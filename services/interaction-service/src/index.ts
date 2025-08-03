import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const app = new Hono()
const prisma = new PrismaClient()

app.use('*', logger())
app.use('*', cors())

const InteractionModeEnum = z.enum(['collaboration', 'x_as_a_service', 'facilitating'])
const InteractionIntensityEnum = z.enum(['high', 'medium', 'low'])
const DurationTypeEnum = z.enum(['temporary', 'permanent'])

const CreateInteractionSchema = z.object({
  teamAId: z.string().uuid(),
  teamBId: z.string().uuid(),
  mode: InteractionModeEnum,
  intensity: InteractionIntensityEnum.optional(),
  durationType: DurationTypeEnum,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  purpose: z.string().optional(),
  expectedOutcome: z.string().optional(),
})

const UpdateInteractionSchema = CreateInteractionSchema.partial().omit({ 
  teamAId: true, 
  teamBId: true 
})

app.get('/health', (c) => {
  return c.json({ status: 'healthy', service: 'interaction-service' })
})

app.get('/interactions', async (c) => {
  const teamId = c.req.query('teamId')
  const active = c.req.query('active') === 'true'
  
  let where: any = {}
  
  if (teamId) {
    where = {
      OR: [
        { teamAId: teamId },
        { teamBId: teamId }
      ]
    }
  }
  
  if (active) {
    where = {
      ...where,
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ]
    }
  }

  const interactions = await prisma.interaction.findMany({
    where,
    orderBy: { startDate: 'desc' },
  })

  return c.json(interactions)
})

app.get('/interactions/:id', async (c) => {
  const id = c.req.param('id')
  
  const interaction = await prisma.interaction.findUnique({
    where: { id },
    include: {
      history: {
        orderBy: { changedAt: 'desc' }
      }
    }
  })

  if (!interaction) {
    return c.json({ error: 'Interaction not found' }, 404)
  }

  return c.json(interaction)
})

app.post('/interactions', async (c) => {
  try {
    const body = await c.req.json()
    const data = CreateInteractionSchema.parse(body)
    
    if (data.teamAId === data.teamBId) {
      return c.json({ error: 'Teams cannot interact with themselves' }, 400)
    }

    const interaction = await prisma.interaction.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })

    return c.json(interaction, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400)
    }
    throw error
  }
})

app.patch('/interactions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const userId = c.req.header('X-User-Id')
    const body = await c.req.json()
    const data = UpdateInteractionSchema.parse(body)

    const currentInteraction = await prisma.interaction.findUnique({
      where: { id }
    })

    if (!currentInteraction) {
      return c.json({ error: 'Interaction not found' }, 404)
    }

    const updateData: any = { ...data }
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate)
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate)
    }

    const [updatedInteraction, _] = await prisma.$transaction([
      prisma.interaction.update({
        where: { id },
        data: updateData,
      }),
      prisma.interactionHistory.create({
        data: {
          interactionId: id,
          changedBy: userId || 'system',
          changeType: 'update',
          oldValue: currentInteraction as any,
          newValue: updateData,
        },
      }),
    ])

    return c.json(updatedInteraction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400)
    }
    throw error
  }
})

app.delete('/interactions/:id', async (c) => {
  const id = c.req.param('id')
  const userId = c.req.header('X-User-Id')

  const interaction = await prisma.interaction.findUnique({
    where: { id }
  })

  if (!interaction) {
    return c.json({ error: 'Interaction not found' }, 404)
  }

  await prisma.$transaction([
    prisma.interactionHistory.create({
      data: {
        interactionId: id,
        changedBy: userId || 'system',
        changeType: 'delete',
        oldValue: interaction as any,
        newValue: null,
      },
    }),
    prisma.interaction.delete({
      where: { id },
    }),
  ])

  return c.json({ message: 'Interaction deleted successfully' })
})

app.get('/interactions/:id/history', async (c) => {
  const interactionId = c.req.param('id')
  
  const history = await prisma.interactionHistory.findMany({
    where: { interactionId },
    orderBy: { changedAt: 'desc' },
  })

  return c.json(history)
})

const port = parseInt(process.env.PORT || '3002')
console.log(`Interaction Service is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})