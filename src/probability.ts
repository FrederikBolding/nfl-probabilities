import { TEAMS, WEEK_11_2024_POWER_RANKING } from "./data";
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

function permutationsExtensive(n: number) {
  return permutationsFn([true, false], n);
}

function* permutationsRandomSample(
  unplayedMatchups: UndecidedMatchup[],
  samples: number,
  weighted: boolean
) {
  for (let i = 0; i < samples; i++) {
    yield unplayedMatchups.map((matchup) => {
      const roll = Math.random();

      if (weighted) {
        const homeIndex = WEEK_11_2024_POWER_RANKING.indexOf(matchup.teamA);
        const homeScore = WEEK_11_2024_POWER_RANKING.length - homeIndex;
        const awayIndex = WEEK_11_2024_POWER_RANKING.indexOf(matchup.teamB);
        const awayScore = WEEK_11_2024_POWER_RANKING.length - awayIndex;

        if (homeIndex === -1 || awayIndex === -1) {
          throw new Error(`${matchup.teamA} or ${matchup.teamB} not found`);
        }

        // TODO: Consider weighting this differently to be less skewed.
        const total = homeScore + awayScore;
        const winPercentage = homeScore / total;
        return roll < winPercentage;
      }

      return roll < 0.5;
    });
  }
}

function generatePermutations(unplayedMatchups: UndecidedMatchup[]) {
  const n = unplayedMatchups.length;
  const outcomes = 2 ** n;
  const samples = 100_000;

  if (outcomes <= samples) {
    console.log(
      `Computing seedings for all ${outcomes.toLocaleString("fullwide", {
        useGrouping: false,
      })} outcomes (${n} remaining games)...`
    );
    return { length: outcomes, permutations: permutationsExtensive(n) };
  }

  console.log(
    `Computing seedings for ${samples.toLocaleString("fullwide", {
      useGrouping: false,
    })} random outcomes (${n} remaining games)...`
  );
  return {
    length: samples,
    permutations: permutationsRandomSample(unplayedMatchups, samples, true),
  };
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

  const { permutations, length: outcomesTested } =
    generatePermutations(unplayedMatchups);

  const seedingOccurrences: Record<string, number> = {};

  let simulationFailures = 0;
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

    try {
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
    } catch {
      // Ignore
      simulationFailures++;
    }
  }

  const simulations = outcomesTested - simulationFailures;

  return TEAMS.reduce<Record<string, number>>((acc, team) => {
    const occurrences = seedingOccurrences[team.shorthand] ?? 0;
    acc[team.shorthand] = (occurrences / simulations) * 100;
    return acc;
  }, {});
}
