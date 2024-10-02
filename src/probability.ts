import { TEAMS } from "./data";
import { getSeeding } from "./playoff";
import { Schedule, TeamScheduleWeek, mergeSchedules } from "./schedule";
import { permutationsWithReplacement as permutationsFn } from "combinatorial-generators";

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
        .map((game) => ({ ...game } as TeamScheduleWeek));
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

  console.log(
    `Computing possible outcomes (${unplayedMatchups.length} remaining games)...`
  );

  const permutations = permutationsFn([true, false], unplayedMatchups.length);

  const totalOutcomes = 2 ** unplayedMatchups.length;

  console.log(
    `Computing seedings for all ${totalOutcomes.toLocaleString("fullwide", {
      useGrouping: false,
    })} outcomes... (slow)`
  );

  const seedingOccurrences: Record<string, number> = {};

  for (const permutation of permutations) {
    const possibleSchedule = unplayedMatchups.reduce<Schedule>(
      (acc, matchup, index) => {
        if (!(matchup.teamA in acc)) {
          acc[matchup.teamA] = [];
        }
        if (!(matchup.teamB in acc)) {
          acc[matchup.teamB] = [];
        }

        acc[matchup.teamA]!.push({
          opponent: matchup.teamB,
          away: false,
          week: matchup.week,
          won: permutation[index]!,
        });
        acc[matchup.teamB]!.push({
          opponent: matchup.teamA,
          away: true,
          week: matchup.week,
          won: !permutation[index]!,
        });
        return acc;
      },
      {}
    );

    const mergedSchedule = mergeSchedules(decidedSchedule, possibleSchedule);
    const { nfc, afc } = getSeeding(mergedSchedule);
    const combinedSeeding = nfc.concat(afc);

    for (const team of combinedSeeding) {
      if (!seedingOccurrences[team]) {
        seedingOccurrences[team] = 1;
      } else {
        seedingOccurrences[team]++;
      }
    }
  }

  return TEAMS.reduce<Record<string, number>>((acc, team) => {
    const occurrences = seedingOccurrences[team.shorthand] ?? 0;
    acc[team.shorthand] = (occurrences / totalOutcomes) * 100;
    return acc;
  }, {});
}
