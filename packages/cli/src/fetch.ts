import { REGULAR_SEASON_GAMES, TEAMS_OBJECTS } from "@nfl-probabilities/core";
import { writeFile } from "fs/promises";

// Partial type to satisfy TS
interface Event {
  strHomeTeam: keyof typeof TEAMS_OBJECTS;
  strAwayTeam: keyof typeof TEAMS_OBJECTS;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

const args = process.argv;
const season = parseInt(args[2] ?? "2026");

async function main() {
  const weeks = await Promise.all(
    new Array(REGULAR_SEASON_GAMES + 1).fill(1).map(async (_, index) => {
      const week = index + 1;
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/123/eventsround.php?id=4391&s=${season}&r=${week}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch from API. Status code: ${response.status}`,
        );
      }

      const json = (await response.json()) as { events: Event[] };

      return json.events.map((event) => {
        const teamA = TEAMS_OBJECTS[event.strHomeTeam].shorthand;
        const teamB = TEAMS_OBJECTS[event.strAwayTeam].shorthand;

        return {
          week,
          teamA,
          teamB,
          teamAScore: event.intHomeScore ? parseInt(event.intHomeScore) : null,
          teamBScore: event.intAwayScore ? parseInt(event.intAwayScore) : null,
        };
      });
    }),
  );

  await writeFile(
    `../core/src/data/${season}.json`,
    JSON.stringify({ weeks }, null, 2),
  );
}

main().catch(console.error);
