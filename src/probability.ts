import { TEAMS } from "./data";
import { getSeeding } from "./playoff";
import { Schedule, TeamScheduleWeek, mergeSchedules } from "./schedule";

interface UndecidedMatchup {
  week: number;
  teamA: string;
  teamB: string;
  winner: null;
}

interface DecidedMatchup {
  week: number;
  teamA: string;
  teamB: string;
  winner: string;
}

export function calculatePlayoffProbability(
  schedule: Schedule
): Record<string, number> {
  const decidedSchedule = Object.entries(schedule).reduce<Schedule>(
    (acc, teamSchedule) => {
      const teamName = teamSchedule[0];
      const games = teamSchedule[1];
      // Only include bye or decided games
      acc[teamName] = games.filter(
        (game) => game === null || game.won !== null
      );
      return acc;
    },
    {}
  );

  const undecidedSchedule = Object.entries(schedule).reduce<Schedule>(
    (acc, teamSchedule) => {
      const teamName = teamSchedule[0];
      const games = teamSchedule[1];
      // Only include undecided games
      acc[teamName] = games
        .filter((game) => game?.won === null)
        // Copy object to not change input values
        .map((game) => ({ ...game }) as TeamScheduleWeek);
      return acc;
    },
    {}
  );

  const unplayedMatchups = Object.entries(undecidedSchedule).reduce<
    UndecidedMatchup[]
  >((acc, teamSchedule) => {
    const teamA = teamSchedule[0];
    const games = teamSchedule[1];
    // Only add home games
    const homeGames = games.filter((game) => game?.away === false);
    const matchups = homeGames.map((game) => ({
      week: game!.week,
      teamA,
      teamB: game!.opponent,
      winner: null,
    }));
    return acc.concat(matchups);
  }, []);

  console.log("Computing possible outcomes...");

  // Or combinations?
  const permutations = coinFlip(unplayedMatchups.length);

  const possibleOutcomes = permutations.reduce<DecidedMatchup[][]>(
    (acc, permutation) => {
      const matchups = permutation
        .split("")
        .reduce<DecidedMatchup[]>((permutationAcc, flip, index) => {
          const matchup = unplayedMatchups[index]!;
          permutationAcc.push({
            week: matchup.week,
            teamA: matchup.teamA,
            teamB: matchup.teamB,
            winner: flip === "H" ? matchup.teamA : matchup.teamB,
          });
          return permutationAcc;
        }, []);
      acc.push(matchups);
      return acc;
    },
    []
  );

  const totalOutcomes = possibleOutcomes.length;

  console.log(`Computing seedings for all ${totalOutcomes} outcomes... (slow)`);

  const possibleSeedings = possibleOutcomes.map((matchups) => {
    // This seems stupid and slow, fix
    const possibleSchedule = Object.entries(undecidedSchedule).reduce<Schedule>(
      (acc, teamSchedule) => {
        const teamName = teamSchedule[0];
        const games = teamSchedule[1];
        const teamMatchups = matchups.filter(
          (matchup) => matchup.teamA === teamName || matchup.teamB === teamName
        );

        for (const matchup of teamMatchups) {
          const index = games.findIndex((game) => game!.week === matchup.week);
          games[index]!.won = matchup.winner === teamName;
        }

        acc[teamName] = games;
        return acc;
      },
      {}
    );
    const mergedSchedule = mergeSchedules(decidedSchedule, possibleSchedule);
    const { nfc, afc } = getSeeding(mergedSchedule);
    return nfc.concat(afc);
  });

  const seedingOccurrences = possibleSeedings.reduce<Record<string, number>>(
    (acc, seeding) => {
      for (const team of seeding) {
        if (!acc[team]) {
          acc[team] = 1;
        } else {
          acc[team]++;
        }
      }
      return acc;
    },
    {}
  );

  return TEAMS.reduce<Record<string, number>>((acc, team) => {
    const occurrences = seedingOccurrences[team.shorthand] ?? 0;
    acc[team.shorthand] = (occurrences / totalOutcomes) * 100;
    return acc;
  }, {});
}

// Can we do this in a smarter way?
function coinFlip(n: number): string[] {
  return n <= 0 ? [""] : coinFlip(n - 1).flatMap((r) => [r + "H", r + "T"]);
}
