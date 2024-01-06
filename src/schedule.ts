export interface TeamScheduleWeek {
  opponent: string;
  away: boolean;
  won: boolean | null;
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
        const won = teamPlayedGames[index] ?? null;

        return { opponent: opponentShorthand, away, won };
      });
      return [teamShorthand, games];
    })
  );
}
