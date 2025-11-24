import { TEAMS, WeekResult } from "./data";
import { ScheduleWithoutByes, TeamScheduleWeek } from "./schedule";

const K = 20;
const INITIAL_ELO = 1500;
const HOME_FIELD_ADVANTAGE = 65;

// TODO: Consider memoizing
export function calculateProbability(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function calculateMOVMultiplier(
  ratingA: number,
  ratingB: number,
  margin: number
) {
  const multiplier =
    Math.log(margin + 1) * (2.2 / (0.001 * Math.abs(ratingA - ratingB) + 2.2));
  return Math.max(1, Math.min(multiplier, 3));
}

function calculateRating(
  ratingA: number,
  ratingB: number,
  outcome: number,
  margin: number
) {
  const probabilityA = calculateProbability(
    ratingA + HOME_FIELD_ADVANTAGE,
    ratingB
  );
  const probabilityB = 1.0 - probabilityA;

  const effectiveK = K * calculateMOVMultiplier(ratingA, ratingB, margin);

  return {
    ratingA: ratingA + effectiveK * (outcome - probabilityA),
    ratingB: ratingB + effectiveK * (1 - outcome - probabilityB),
  };
}

export function calculateTeamRatings(schedule: ScheduleWithoutByes) {
  const ratings = TEAMS.reduce<Record<string, number>>((accumulator, team) => {
    accumulator[team.shorthand] = INITIAL_ELO;
    return accumulator;
  }, {});

  const decidedWeeks = Object.entries(schedule).reduce<
    (TeamScheduleWeek & { team: string })[][]
  >((accumulator, teamSchedule) => {
    const teamName = teamSchedule[0];
    const games = teamSchedule[1];

    games.forEach((game, index) => {
      if (index > accumulator.length - 1) {
        accumulator.push([]);
      }
      // Only include decided home games to not double count games
      if (game.result !== null && !game.away) {
        accumulator[index]!.push({ ...game, team: teamName });
      }
    });
    return accumulator;
  }, []);

  decidedWeeks.forEach((week) => {
    week.forEach((game) => {
      const ratingA = ratings[game.team]!;
      const ratingB = ratings[game.opponent]!;
      const outcome =
        game.result === WeekResult.Win
          ? 1.0
          : game.result === WeekResult.Draw
          ? 0.5
          : 0.0;
      const margin = Math.abs(game.homeScore! - game.awayScore!);
      const { ratingA: newRatingA, ratingB: newRatingB } = calculateRating(
        ratingA,
        ratingB,
        outcome,
        margin
      );
      ratings[game.team] = newRatingA;
      ratings[game.opponent] = newRatingB;
    });
  });

  return ratings;
}
