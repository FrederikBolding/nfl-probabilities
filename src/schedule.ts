import { TEAMS, TEAMS_OBJECTS, SEASON, WeekResult } from "./data";
import { calculatePowerRanking } from "./elo";

const RAW_DATA = require(`./data/${SEASON}.json`);

export const SCHEDULE = formatSchedule(RAW_DATA);

export const ELO_POWER_RANKING = calculatePowerRanking(SCHEDULE);

export interface TeamScheduleWeek {
  opponent: string;
  away: boolean;
  result: WeekResult | null;
  week: number;
}

export type Schedule = Record<string, (TeamScheduleWeek | null)[]>;

export type ScheduleWithoutByes = Record<string, TeamScheduleWeek[]>;

interface RawScheduleData {
  weeks: RawScheduleGame[][];
}

interface RawScheduleGame {
  week: number;
  game: number;
  teamA: keyof typeof TEAMS_OBJECTS;
  teamB: keyof typeof TEAMS_OBJECTS;
  teamAScore: number;
  teamBScore: number;
}

function getResult(
  teamAScore: number | null,
  teamBScore: number | null
): [null, null] | [WeekResult, WeekResult] {
  if (teamAScore === null || teamBScore === null) {
    return [null, null];
  }

  if (teamAScore > teamBScore) {
    return [WeekResult.Win, WeekResult.Loss];
  } else if (teamBScore > teamAScore) {
    return [WeekResult.Loss, WeekResult.Win];
  }

  return [WeekResult.Draw, WeekResult.Draw];
}

export function formatSchedule(data: RawScheduleData): ScheduleWithoutByes {
  const schedule = TEAMS.reduce<Record<string, TeamScheduleWeek[]>>(
    (acc, team) => {
      acc[team.shorthand] = [];
      return acc;
    },
    {}
  );

  const allGames = data.weeks.flat();

  allGames.forEach((game) => {
    const homeTeam = TEAMS_OBJECTS[game.teamA]!.shorthand;
    const awayTeam = TEAMS_OBJECTS[game.teamB]!.shorthand;

    const [homeTeamResult, awayTeamResult] = getResult(
      game.teamAScore,
      game.teamBScore
    );

    schedule[homeTeam]!.push({
      week: game.week,
      opponent: awayTeam,
      away: false,
      result: homeTeamResult,
    });

    schedule[awayTeam]!.push({
      week: game.week,
      opponent: homeTeam,
      away: true,
      result: awayTeamResult,
    });
  });

  return schedule;
}

export function mergeSchedules(
  scheduleA: ScheduleWithoutByes,
  scheduleB: ScheduleWithoutByes
) {
  return Object.entries(scheduleA).reduce<ScheduleWithoutByes>(
    (acc, schedule) => {
      const teamName = schedule[0];
      const gamesA = schedule[1];
      const gamesB = scheduleB[teamName];
      if (gamesB) {
        acc[teamName] = gamesA.concat(gamesB);
      } else {
        acc[teamName] = gamesA;
      }
      return acc;
    },
    {}
  );
}
