import {
  AFC_TEAMS,
  Conference,
  DIVISION_MAP,
  Division,
  NFC_TEAMS,
  TEAM_MAP,
  Team,
  WeekResult,
} from "./data";
import { ScheduleWithoutByes, TeamScheduleWeek } from "./schedule";

export interface TeamRecordData {
  wins: number;
  losses: number;
  draws: number;
  wl: number;
  adjustedWins: number;
  adjustedLosses: number;
  totalGames: number;
}

export interface TeamRecordPoints {
  for: number;
  against: number;
  diff: number;
}

export interface TeamRecord {
  shorthand: string;
  division: Division;
  record: TeamRecordData;
  getH2H: (teams: string[]) => TeamRecordData;
  getCommonRecord: (teams: string[]) => TeamRecordData | undefined;
  divisionRecord: TeamRecordData;
  conferenceRecord: TeamRecordData;
  strengthOfVictory: TeamRecordData;
  strengthOfSchedule: TeamRecordData;
  points: TeamRecordPoints;
  conferencePoints: TeamRecordPoints;
}

function getRecord(
  weeks: TeamScheduleWeek[],
  filterFn?: (value: TeamScheduleWeek) => boolean
) {
  const record = weeks.reduce<{
    wins: number;
    losses: number;
    draws: number;
  }>(
    (acc, week) => {
      if (filterFn && !filterFn(week)) {
        return acc;
      }
      if (week.result === WeekResult.Win) {
        acc.wins++;
      } else if (week.result === WeekResult.Loss) {
        acc.losses++;
      } else if (week.result === WeekResult.Draw) {
        acc.draws++;
      }
      return acc;
    },
    {
      wins: 0,
      losses: 0,
      draws: 0,
    }
  );
  return calculateWL(record);
}

function calculateWL({
  wins,
  losses,
  draws,
}: {
  wins: number;
  losses: number;
  draws: number;
}) {
  const adjustedWins = wins + 0.5 * draws;
  const adjustedLosses = losses + 0.5 * draws;
  const totalGames = adjustedWins + adjustedLosses;
  const wl = totalGames > 0 ? adjustedWins / totalGames : 0;
  return { wins, losses, draws, wl, adjustedWins, adjustedLosses, totalGames };
}

function getRecordAgainst(weeks: TeamScheduleWeek[], opposingTeams: string[]) {
  return getRecord(weeks, (week) => opposingTeams.includes(week.opponent));
}

function getDivisionRecord(weeks: TeamScheduleWeek[], division: Division) {
  const divisionTeams = DIVISION_MAP[division];
  return getRecordAgainst(weeks, divisionTeams);
}

function getConferenceRecord(
  weeks: TeamScheduleWeek[],
  conference: Conference
) {
  const conferenceTeams = conference === Conference.AFC ? AFC_TEAMS : NFC_TEAMS;
  return getRecordAgainst(weeks, conferenceTeams);
}

function getCommonRecord(
  schedule: ScheduleWithoutByes,
  teamShorthand: string,
  teamShorthands: string[]
) {
  const ownSchedule = schedule[teamShorthand]!;
  const opponents = ownSchedule.map((week) => week.opponent);

  const commonOpponents = teamShorthands.reduce<string[]>(
    (accumulator, scheduleShorthand) => {
      return accumulator.filter((initialOpponent) =>
        schedule[scheduleShorthand]!.some(
          (week) => week.opponent === initialOpponent
        )
      );
    },
    opponents
  );

  if (commonOpponents.length >= 4) {
    return getRecordAgainst(ownSchedule, commonOpponents);
  }

  return undefined;
}

function getStrengthOfSchedule(
  schedule: ScheduleWithoutByes,
  teamShorthand: string,
  victoryOnly: boolean
) {
  const ownSchedule = schedule[teamShorthand]!;

  const totalRecord = ownSchedule.reduce<{
    wins: number;
    losses: number;
    draws: number;
  }>(
    (accumulator, match) => {
      if (!victoryOnly || (victoryOnly && match.result === WeekResult.Win)) {
        const record = getRecord(schedule[match.opponent]!);
        accumulator.wins += record.wins;
        accumulator.losses += record.losses;
        accumulator.draws += record.draws;
      }
      return accumulator;
    },
    {
      wins: 0,
      losses: 0,
      draws: 0,
    }
  );

  return calculateWL(totalRecord);
}

function getPoints(weeks: TeamScheduleWeek[]) {
  return weeks.reduce(
    (accumulator, week) => {
      if (week.homeScore && week.awayScore) {
        const pointsFor = week.away ? week.awayScore : week.homeScore;
        const pointsAgainst = week.away ? week.homeScore : week.awayScore;
        const diff = pointsFor - pointsAgainst;
        accumulator.for += pointsFor;
        accumulator.against += pointsAgainst;
        accumulator.diff += diff;
      }

      return accumulator;
    },
    { for: 0, against: 0, diff: 0 }
  );
}

export function getMultipleRecords(
  schedule: ScheduleWithoutByes,
  teams: Team[]
): TeamRecord[] {
  return teams.map((team) => {
    const weeks = schedule[team.shorthand]!;
    const h2h = {} as Record<string, TeamRecordData>;
    const commonRecord = {} as Record<string, TeamRecordData | undefined>;
    return {
      shorthand: team.shorthand,
      division: team.division,
      // These getters below are ugly, but more performant (lazy and memoized).
      get record(): TeamRecordData {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.record;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.record = getRecord(weeks);
        return this.record;
      },
      getH2H(input: string[]) {
        const cacheKey = input.join();
        if (!(cacheKey in h2h)) {
          h2h[cacheKey] = getRecordAgainst(weeks, input);
        }
        return h2h[cacheKey]!;
      },
      getCommonRecord(input: string[]) {
        const cacheKey = input.join();
        if (!(cacheKey in commonRecord)) {
          commonRecord[cacheKey] = getCommonRecord(
            schedule,
            team.shorthand,
            input
          );
        }
        return commonRecord[cacheKey]!;
      },
      get divisionRecord(): TeamRecordData {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.divisionRecord;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.divisionRecord = getDivisionRecord(weeks, team.division);
        return this.divisionRecord;
      },
      get conferenceRecord(): TeamRecordData {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.conferenceRecord;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.conferenceRecord = getConferenceRecord(weeks, team.conference);
        return this.conferenceRecord;
      },
      get strengthOfVictory(): TeamRecordData {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.strengthOfVictory;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.strengthOfVictory = getStrengthOfSchedule(
          schedule,
          team.shorthand,
          true
        );
        return this.strengthOfVictory;
      },
      get strengthOfSchedule(): TeamRecordData {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.strengthOfSchedule;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.strengthOfSchedule = getStrengthOfSchedule(
          schedule,
          team.shorthand,
          false
        );
        return this.strengthOfSchedule;
      },
      get points(): TeamRecordPoints {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.points;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.points = getPoints(weeks);
        return this.points;
      },
      get conferencePoints(): TeamRecordPoints {
        // @ts-ignore TypeScript doesn't like this with good reason.
        delete this.conferencePoints;
        // @ts-ignore TypeScript doesn't like this with good reason.
        this.conferencePoints = getPoints(
          weeks.filter((week) => {
            const opponentConference = TEAM_MAP[week.opponent]!.conference;
            return opponentConference === team.conference;
          })
        );
        return this.conferencePoints;
      },
    };
  });
}
