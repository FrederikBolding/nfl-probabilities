import { REGULAR_SEASON_GAMES } from "@nfl-probabilities/core";
import { writeFile } from "fs/promises";

// Partial type to satisfy TS
interface Event {
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

const args = process.argv;
const season = parseInt(args[2] ?? "2025");

async function main() {
  const weeks = await Promise.all(
    new Array(REGULAR_SEASON_GAMES + 1).fill(1).map(async (_, index) => {
      const week = index + 1;
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/123/eventsround.php?id=4391&s=${season}&r=${week}`
      );
      const json = (await response.json()) as { events: Event[] };

      return json.events.map((event, index) => ({
        week,
        game: index,
        teamA: event.strHomeTeam,
        teamB: event.strAwayTeam,
        teamAScore: event.intHomeScore ? parseInt(event.intHomeScore) : null,
        teamBScore: event.intAwayScore ? parseInt(event.intAwayScore) : null,
      }));
    })
  );

  await writeFile(`../core/src/data/${season}.json`, JSON.stringify({ weeks }, null, 2));
}

main().catch(console.error);
