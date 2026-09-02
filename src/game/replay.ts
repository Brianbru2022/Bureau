import type { MatchConfig } from '../types';
import { composeAssessmentSchedule, createMatchConfigFromSchedule, type SchedulePreferences } from './match';

export const createReplayMatchConfig = (
  previous: MatchConfig,
  recentDepartments: MatchConfig['roundTypes'],
  preferences: SchedulePreferences,
  random: () => number
): MatchConfig => {
  const schedule = composeAssessmentSchedule(previous.roundTypes.length, random, recentDepartments, preferences);
  return createMatchConfigFromSchedule(
    previous.preset,
    schedule,
    previous.timerSeconds,
    previous.politicsMode,
    previous.guidedMode,
    previous.difficultyProfile,
    previous.scorePaceProfile
  );
};
