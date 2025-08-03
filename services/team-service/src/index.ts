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

const TeamTypeEnum = z.enum(['stream_aligned', 'platform', 'enabling', 'complicated_subsystem'])
const ResponsibilityLevelEnum = z.enum(['primary', 'secondary', 'supporting'])

const CreateTeamSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  type: TeamTypeEnum,
  description: z.string().optional(),
  cognitiveLoad: z.number().min(0).max(1).optional(),
})

const UpdateTeamSchema = CreateTeamSchema.partial().omit({ organizationId: true })

const AddTeamMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().optional(),
})

const AddTeamDomainSchema = z.object({
  domain: z.string().min(1),
  responsibilityLevel: ResponsibilityLevelEnum,
})

app.get('/health', (c) => {
  return c.json({ status: 'healthy', service: 'team-service' })
})

app.get('/teams', async (c) => {
  const organizationId = c.req.query('organizationId')
  
  if (!organizationId) {
    return c.json({ error: 'organizationId is required' }, 400)
  }

  const teams = await prisma.team.findMany({
    where: { organizationId },
    include: {
      members: true,
      domains: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(teams)
})

app.get('/teams/:id', async (c) => {
  const id = c.req.param('id')
  
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: true,
      domains: true,
    },
  })

  if (!team) {
    return c.json({ error: 'Team not found' }, 404)
  }

  return c.json(team)
})

app.post('/teams', async (c) => {
  try {
    const body = await c.req.json()
    const data = CreateTeamSchema.parse(body)

    const team = await prisma.team.create({
      data,
      include: {
        members: true,
        domains: true,
      },
    })

    return c.json(team, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400)
    }
    throw error
  }
})

app.patch('/teams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const data = UpdateTeamSchema.parse(body)

    const team = await prisma.team.update({
      where: { id },
      data,
      include: {
        members: true,
        domains: true,
      },
    })

    return c.json(team)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400)
    }
    throw error
  }
})

app.delete('/teams/:id', async (c) => {
  const id = c.req.param('id')

  await prisma.team.delete({
    where: { id },
  })

  return c.json({ message: 'Team deleted successfully' })
})

app.post('/teams/:id/members', async (c) => {
  try {
    const teamId = c.req.param('id')
    const body = await c.req.json()
    const data = AddTeamMemberSchema.parse(body)

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        ...data,
      },
    })

    return c.json(member, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400)
    }
    throw error
  }
})

app.delete('/teams/:teamId/members/:memberId', async (c) => {
  const memberId = c.req.param('memberId')

  await prisma.teamMember.update({
    where: { id: memberId },
    data: { leftAt: new Date() },
  })

  return c.json({ message: 'Team member removed successfully' })
})

app.post('/teams/:id/domains', async (c) => {
  try {
    const teamId = c.req.param('id')
    const body = await c.req.json()
    const data = AddTeamDomainSchema.parse(body)

    const domain = await prisma.teamDomain.create({
      data: {
        teamId,
        ...data,
      },
    })

    return c.json(domain, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400)
    }
    throw error
  }
})

app.delete('/teams/:teamId/domains/:domainId', async (c) => {
  const domainId = c.req.param('domainId')

  await prisma.teamDomain.delete({
    where: { id: domainId },
  })

  return c.json({ message: 'Team domain removed successfully' })
})

const port = parseInt(process.env.PORT || '3001')
console.log(`Team Service is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})