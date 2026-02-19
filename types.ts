export interface UserProfile {
  rollNumber: string;
  choices: string[];
}

export interface MatchResult {
  matchedUser: string;
  icebreaker?: string;
}

export type ScreenState = 'LOGIN' | 'DASHBOARD';
