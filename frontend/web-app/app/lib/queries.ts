import { gql } from '@apollo/client';

export const GET_TEAMS = gql`
  query GetTeams($organizationId: ID!) {
    teams(organizationId: $organizationId) {
      id
      name
      type
      description
      cognitiveLoad
      members {
        id
        userId
        role
      }
      domains {
        id
        domain
        responsibilityLevel
      }
    }
  }
`;

export const GET_TEAM = gql`
  query GetTeam($id: ID!) {
    team(id: $id) {
      id
      name
      type
      description
      cognitiveLoad
      createdAt
      updatedAt
      members {
        id
        userId
        role
        joinedAt
      }
      domains {
        id
        domain
        responsibilityLevel
      }
      interactions {
        id
        teamBId
        mode
        intensity
        durationType
        startDate
        endDate
        purpose
      }
    }
  }
`;

export const GET_INTERACTIONS = gql`
  query GetInteractions($teamId: ID, $active: Boolean) {
    interactions(teamId: $teamId, active: $active) {
      id
      teamAId
      teamBId
      teamA {
        id
        name
        type
      }
      teamB {
        id
        name
        type
      }
      mode
      intensity
      durationType
      startDate
      endDate
      purpose
      expectedOutcome
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      type
      description
      cognitiveLoad
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $input: UpdateTeamInput!) {
    updateTeam(id: $id, input: $input) {
      id
      name
      type
      description
      cognitiveLoad
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;

export const CREATE_INTERACTION = gql`
  mutation CreateInteraction($input: CreateInteractionInput!) {
    createInteraction(input: $input) {
      id
      teamAId
      teamBId
      mode
      intensity
      durationType
      startDate
      endDate
      purpose
      expectedOutcome
    }
  }
`;

export const UPDATE_INTERACTION = gql`
  mutation UpdateInteraction($id: ID!, $input: UpdateInteractionInput!) {
    updateInteraction(id: $id, input: $input) {
      id
      mode
      intensity
      durationType
      startDate
      endDate
      purpose
      expectedOutcome
    }
  }
`;

export const DELETE_INTERACTION = gql`
  mutation DeleteInteraction($id: ID!) {
    deleteInteraction(id: $id)
  }
`;