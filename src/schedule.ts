import { TEAM_MAP, TEAM_SHORTHANDS, TEAMS, TEAMS_OBJECTS } from "./data";

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

export function parseSchedule(
  schedule: string,
  playedGames: Record<string, (boolean | null)[]>
): ScheduleWithoutByes {
  const lines = schedule.trim().split("\n");
  return Object.fromEntries(
    lines.map((line) => {
      const columns = line.split(" ");
      const teamShorthand = columns[0]!;
      const teamPlayedGames = playedGames[teamShorthand]!;
      const games = columns
        .slice(1)
        .map((opponent, index) => {
          if (opponent === "BYE") {
            return null;
          }

          const away = opponent.startsWith("@");
          const opponentShorthand = opponent.slice(away ? 1 : 0);
          const opponentPlayedGames = playedGames[opponentShorthand]!;
          const won = teamPlayedGames[index] ?? null;

          const week = index + 1;

          if (!TEAM_SHORTHANDS.includes(opponentShorthand)) {
            throw new Error(
              `Unrecognized team in schedule: "${opponentShorthand}"`
            );
          }

          if (won !== null && won === opponentPlayedGames[index]) {
            throw new Error(
              `${teamShorthand} and ${opponentShorthand} cannot both have won/lost week ${week}`
            );
          }

          return { opponent: opponentShorthand, away, won, week };
        })
        .filter(Boolean);
      return [teamShorthand, games as TeamScheduleWeek[]];
    })
  );
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
