import { TEAMS, TEAMS_OBJECTS } from "./data";
import { calculatePowerRanking } from "./elo";

export const SEASON = 2025;

const RAW_DATA = require(`./data/${SEASON}.json`);

export const SCHEDULE = formatSchedule(RAW_DATA);

export const ELO_POWER_RANKING = calculatePowerRanking(SCHEDULE);

export interface TeamScheduleWeek {
  opponent: string;
  away: boolean;
  won: boolean | null;
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

    const gamePlayed = game.teamAScore !== null && game.teamBScore !== null;

    // TODO: Account for ties
    if (game.teamAScore !== null && game.teamAScore === game.teamBScore) {
      throw new Error("Ties have not yet been implemented.");
    }

    const homeTeamWon = gamePlayed ? game.teamAScore > game.teamBScore : null;
    const awayTeamWon = gamePlayed ? !homeTeamWon : null;

    schedule[homeTeam]!.push({
      week: game.week,
      opponent: awayTeam,
      away: false,
      won: homeTeamWon,
    });

    schedule[awayTeam]!.push({
      week: game.week,
      opponent: homeTeam,
      away: true,
      won: awayTeamWon,
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
