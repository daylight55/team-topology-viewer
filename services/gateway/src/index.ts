import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLScalarType, Kind } from 'graphql'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value
  },
  parseValue(value: any) {
    return new Date(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  },
})

const typeDefs = `#graphql
  scalar Date

  enum TeamType {
    stream_aligned
    platform
    enabling
    complicated_subsystem
  }

  enum ResponsibilityLevel {
    primary
    secondary
    supporting
  }

  enum InteractionMode {
    collaboration
    x_as_a_service
    facilitating
  }

  enum InteractionIntensity {
    high
    medium
    low
  }

  enum DurationType {
    temporary
    permanent
  }

  type Team {
    id: ID!
    organizationId: ID!
    name: String!
    type: TeamType!
    description: String
    cognitiveLoad: Float
    createdAt: Date!
    updatedAt: Date!
    members: [TeamMember!]!
    domains: [TeamDomain!]!
    interactions: [Interaction!]!
  }

  type TeamMember {
    id: ID!
    teamId: ID!
    userId: ID!
    role: String
    joinedAt: Date!
    leftAt: Date
  }

  type TeamDomain {
    id: ID!
    teamId: ID!
    domain: String!
    responsibilityLevel: ResponsibilityLevel!
  }

  type Interaction {
    id: ID!
    teamAId: ID!
    teamBId: ID!
    teamA: Team
    teamB: Team
    mode: InteractionMode!
    intensity: InteractionIntensity
    durationType: DurationType!
    startDate: Date!
    endDate: Date
    purpose: String
    expectedOutcome: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Query {
    teams(organizationId: ID!): [Team!]!
    team(id: ID!): Team
    interactions(teamId: ID, active: Boolean): [Interaction!]!
    interaction(id: ID!): Interaction
  }

  type Mutation {
    createTeam(input: CreateTeamInput!): Team!
    updateTeam(id: ID!, input: UpdateTeamInput!): Team!
    deleteTeam(id: ID!): Boolean!
    
    addTeamMember(teamId: ID!, userId: ID!, role: String): TeamMember!
    removeTeamMember(teamId: ID!, memberId: ID!): Boolean!
    
    addTeamDomain(teamId: ID!, domain: String!, responsibilityLevel: ResponsibilityLevel!): TeamDomain!
    removeTeamDomain(teamId: ID!, domainId: ID!): Boolean!
    
    createInteraction(input: CreateInteractionInput!): Interaction!
    updateInteraction(id: ID!, input: UpdateInteractionInput!): Interaction!
    deleteInteraction(id: ID!): Boolean!
  }

  input CreateTeamInput {
    organizationId: ID!
    name: String!
    type: TeamType!
    description: String
    cognitiveLoad: Float
  }

  input UpdateTeamInput {
    name: String
    type: TeamType
    description: String
    cognitiveLoad: Float
  }

  input CreateInteractionInput {
    teamAId: ID!
    teamBId: ID!
    mode: InteractionMode!
    intensity: InteractionIntensity
    durationType: DurationType!
    startDate: Date!
    endDate: Date
    purpose: String
    expectedOutcome: String
  }

  input UpdateInteractionInput {
    mode: InteractionMode
    intensity: InteractionIntensity
    durationType: DurationType
    startDate: Date
    endDate: Date
    purpose: String
    expectedOutcome: String
  }
`

const TEAM_SERVICE_URL = process.env.TEAM_SERVICE_URL || 'http://localhost:3001'
const INTERACTION_SERVICE_URL = process.env.INTERACTION_SERVICE_URL || 'http://localhost:3002'

const resolvers = {
  Date: DateScalar,
  
  Query: {
    teams: async (_: any, { organizationId }: { organizationId: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams?organizationId=${organizationId}`)
      return response.json()
    },
    
    team: async (_: any, { id }: { id: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${id}`)
      if (response.status === 404) return null
      return response.json()
    },
    
    interactions: async (_: any, { teamId, active }: { teamId?: string, active?: boolean }) => {
      let url = `${INTERACTION_SERVICE_URL}/interactions`
      const params = new URLSearchParams()
      if (teamId) params.append('teamId', teamId)
      if (active !== undefined) params.append('active', active.toString())
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      return response.json()
    },
    
    interaction: async (_: any, { id }: { id: string }) => {
      const response = await fetch(`${INTERACTION_SERVICE_URL}/interactions/${id}`)
      if (response.status === 404) return null
      return response.json()
    },
  },
  
  Mutation: {
    createTeam: async (_: any, { input }: { input: any }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      return response.json()
    },
    
    updateTeam: async (_: any, { id, input }: { id: string, input: any }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      return response.json()
    },
    
    deleteTeam: async (_: any, { id }: { id: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${id}`, {
        method: 'DELETE',
      })
      return response.ok
    },
    
    addTeamMember: async (_: any, { teamId, userId, role }: { teamId: string, userId: string, role?: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      return response.json()
    },
    
    removeTeamMember: async (_: any, { teamId, memberId }: { teamId: string, memberId: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      })
      return response.ok
    },
    
    addTeamDomain: async (_: any, { teamId, domain, responsibilityLevel }: { teamId: string, domain: string, responsibilityLevel: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${teamId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, responsibilityLevel }),
      })
      return response.json()
    },
    
    removeTeamDomain: async (_: any, { teamId, domainId }: { teamId: string, domainId: string }) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${teamId}/domains/${domainId}`, {
        method: 'DELETE',
      })
      return response.ok
    },
    
    createInteraction: async (_: any, { input }: { input: any }, context: any) => {
      const response = await fetch(`${INTERACTION_SERVICE_URL}/interactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': context.userId || 'system',
        },
        body: JSON.stringify(input),
      })
      return response.json()
    },
    
    updateInteraction: async (_: any, { id, input }: { id: string, input: any }, context: any) => {
      const response = await fetch(`${INTERACTION_SERVICE_URL}/interactions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': context.userId || 'system',
        },
        body: JSON.stringify(input),
      })
      return response.json()
    },
    
    deleteInteraction: async (_: any, { id }: { id: string }, context: any) => {
      const response = await fetch(`${INTERACTION_SERVICE_URL}/interactions/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': context.userId || 'system',
        },
      })
      return response.ok
    },
  },
  
  Team: {
    interactions: async (team: any) => {
      const response = await fetch(`${INTERACTION_SERVICE_URL}/interactions?teamId=${team.id}`)
      return response.json()
    },
  },
  
  Interaction: {
    teamA: async (interaction: any) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${interaction.teamAId}`)
      return response.json()
    },
    teamB: async (interaction: any) => {
      const response = await fetch(`${TEAM_SERVICE_URL}/teams/${interaction.teamBId}`)
      return response.json()
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: parseInt(process.env.PORT || '4000') },
  context: async ({ req }) => ({
    userId: req.headers['x-user-id'] as string,
  }),
})

console.log(`🚀 GraphQL Gateway ready at: ${url}`)