export interface TeamScheduleWeek {
  opponent: string;
  away: boolean;
  won: boolean | null;
  week: number;
}

export type Schedule = Record<string, (TeamScheduleWeek | null)[]>;

export function parseSchedule(
  schedule: string,
  playedGames: Record<string, (boolean | null)[]>
): Schedule {
  const lines = schedule.trim().split("\n");
  return Object.fromEntries(
    lines.map((line) => {
      const columns = line.split(" ");
      const teamShorthand = columns[0]!;
      const teamPlayedGames = playedGames[teamShorthand]!;
      const games = columns.slice(1).map((opponent, index) => {
        if (opponent === "BYE") {
          return null;
        }

        const away = opponent.startsWith("@");
        const opponentShorthand = opponent.slice(away ? 1 : 0);
        const opponentPlayedGames = playedGames[opponentShorthand]!;
        const won = teamPlayedGames[index] ?? null;

        const week = index + 1;

        if (won !== null && won === opponentPlayedGames[index]) {
          throw new Error(
            `${teamShorthand} and ${opponentShorthand} cannot both have won/lost week ${week}`
          );
        }

        return { opponent: opponentShorthand, away, won, week };
      });
      return [teamShorthand, games];
    })
  );
}

export function mergeSchedules(scheduleA: Schedule, scheduleB: Schedule) {
  return Object.entries(scheduleA).reduce<Schedule>((acc, schedule) => {
    const teamName = schedule[0];
    const gamesA = schedule[1];
    const gamesB = scheduleB[teamName];
    if (gamesB) {
      acc[teamName] = gamesA.concat(gamesB);
    } else {
      acc[teamName] = gamesA;
    }
    return acc;
  }, {});
}
