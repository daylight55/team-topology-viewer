export type TeamType = 'stream_aligned' | 'platform' | 'enabling' | 'complicated_subsystem';
export type ResponsibilityLevel = 'primary' | 'secondary' | 'supporting';
export type InteractionMode = 'collaboration' | 'x_as_a_service' | 'facilitating';
export type InteractionIntensity = 'high' | 'medium' | 'low';
export type DurationType = 'temporary' | 'permanent';

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  type: TeamType;
  description?: string;
  cognitiveLoad?: number;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  domains: TeamDomain[];
  interactions?: Interaction[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role?: string;
  joinedAt: string;
  leftAt?: string;
}

export interface TeamDomain {
  id: string;
  teamId: string;
  domain: string;
  responsibilityLevel: ResponsibilityLevel;
}

export interface Interaction {
  id: string;
  teamAId: string;
  teamBId: string;
  teamA?: Team;
  teamB?: Team;
  mode: InteractionMode;
  intensity?: InteractionIntensity;
  durationType: DurationType;
  startDate: string;
  endDate?: string;
  purpose?: string;
  expectedOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

export const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  stream_aligned: 'Stream-aligned',
  platform: 'Platform',
  enabling: 'Enabling',
  complicated_subsystem: 'Complicated Subsystem',
};

export const INTERACTION_MODE_LABELS: Record<InteractionMode, string> = {
  collaboration: 'Collaboration',
  x_as_a_service: 'X-as-a-Service',
  facilitating: 'Facilitating',
};