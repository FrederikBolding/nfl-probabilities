import { Conference, TEAMS, WeekResult } from "./data";
import { getPlayoffTeams } from "./playoff";
import {
  Schedule,
  ScheduleWithoutByes,
  TeamScheduleWeek,
  mergeSchedules,
} from "./schedule";
import { permutationsWithReplacement as permutationsFn } from "combinatorial-generators";
import { filterMap } from "./utils";
import {
  calculateProbability as calculateEloProbability,
  TeamEloRating,
} from "./elo";

interface UndecidedMatchup {
  week: number;
  teamA: string;
  teamB: string;
  winner: null;
}

function permutationsExtensive(n: number) {
  return permutationsFn([true, false], n);
}

function* permutationsRandomSample(
  unplayedMatchups: UndecidedMatchup[],
  samples: number,
  teamRatings?: Record<string, TeamEloRating>
) {
  for (let i = 0; i < samples; i++) {
    yield unplayedMatchups.map((matchup) => {
      const roll = Math.random();

      if (teamRatings) {
        const homeElo = teamRatings[matchup.teamA]!;
        const awayElo = teamRatings[matchup.teamB]!;
        const probability = calculateEloProbability(
          homeElo.current,
          awayElo.current
        );

        return roll < probability;
      }

      return roll < 0.5;
    });
  }
}

function generatePermutations(
  unplayedMatchups: UndecidedMatchup[],
  teamRatings: Record<string, TeamEloRating>
) {
  const n = unplayedMatchups.length;
  const outcomes = 2 ** n;
  const samples = 40_000;

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
    permutations: permutationsRandomSample(
      unplayedMatchups,
      samples,
      teamRatings
    ),
  };
}

export function calculatePlayoffProbability(
  schedule: ScheduleWithoutByes,
  teamRatings: Record<string, TeamEloRating>
): Record<string, number> {
  const decidedSchedule = Object.entries(schedule).reduce<ScheduleWithoutByes>(
    (acc, teamSchedule) => {
      const teamName = teamSchedule[0];
      const games = teamSchedule[1];
      // Only include decided games
      acc[teamName] = games.filter((game) => game.result !== null);
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
        .filter((game) => game?.result === null)
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
    const matchups = filterMap(
      games,
      (game) => game?.away === false,
      (game) => ({
        week: game!.week,
        teamA,
        teamB: game!.opponent,
        winner: null,
      })
    );
    return acc.concat(matchups);
  }, []);

  const { permutations, length: outcomesTested } = generatePermutations(
    unplayedMatchups,
    teamRatings
  );

  const seedingOccurrences: Record<string, number> = {};

  let simulationFailures = 0;
  for (const permutation of permutations) {
    const possibleSchedule = unplayedMatchups.reduce<ScheduleWithoutByes>(
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
          result: permutation[index]! ? WeekResult.Win : WeekResult.Loss,
        });
        acc[matchup.teamB]!.push({
          opponent: matchup.teamA,
          away: true,
          week: matchup.week,
          result: permutation[index]! ? WeekResult.Loss : WeekResult.Win,
        });
        return acc;
      },
      {}
    );

    try {
      const mergedSchedule = mergeSchedules(decidedSchedule, possibleSchedule);
      const afcPlayoffTeams = getPlayoffTeams(mergedSchedule, Conference.AFC);
      const nfcPlayoffTeams = getPlayoffTeams(mergedSchedule, Conference.NFC);
      const combinedPlayoff = afcPlayoffTeams.concat(nfcPlayoffTeams);

      for (const team of combinedPlayoff) {
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
