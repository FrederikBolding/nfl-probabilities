import { TEAMS, WeekResult } from "./data";
import { ScheduleWithoutByes, TeamScheduleWeek } from "./schedule";

const K = 30;

const INITIAL_ELO = 1000;

function calculateProbability(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));
}

function calculateRating(ratingA: number, ratingB: number, outcome: number) {
  const probabilityA = calculateProbability(ratingB, ratingA);
  const probabilityB = calculateProbability(ratingA, ratingB);

  return {
    ratingA: ratingA + K * (outcome - probabilityA),
    ratingB: ratingB + K * (1 - outcome - probabilityB),
  };
}

export function calculatePowerRanking(schedule: ScheduleWithoutByes) {
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
      const { ratingA: newRatingA, ratingB: newRatingB } = calculateRating(
        ratingA,
        ratingB,
        outcome
      );
      ratings[game.team] = newRatingA;
      ratings[game.opponent] = newRatingB;
    });
  });

  return Object.entries(ratings)
    .sort((a, b) => b[1] - a[1])
    .map((rating) => rating[0]);
}
