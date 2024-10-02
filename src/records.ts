import {
  AFC_EAST_TEAMS,
  AFC_NORTH_TEAMS,
  AFC_SOUTH_TEAMS,
  AFC_TEAMS,
  AFC_WEST_TEAMS,
  Conference,
  Division,
  NFC_EAST_TEAMS,
  NFC_NORTH_TEAMS,
  NFC_SOUTH_TEAMS,
  NFC_TEAMS,
  NFC_WEST_TEAMS,
  TEAM_MAP,
  Team,
} from "./data";
import { Schedule, TeamScheduleWeek } from "./schedule";

export interface TeamRecordData {
  wins: number;
  losses: number;
  draws: number;
  wl: number;
}

export interface TeamRecord {
  shorthand: string;
  division: Division;
  record: TeamRecordData;
  getH2H: (team: string) => TeamRecordData;
  getCommonRecord: (team: string) => TeamRecordData | undefined;
  divisionRecord: TeamRecordData;
  conferenceRecord: TeamRecordData;
  strengthOfVictory: TeamRecordData;
  strengthOfSchedule: TeamRecordData;
}

function filterByeWeeks(
  weeks: (TeamScheduleWeek | null)[]
): TeamScheduleWeek[] {
  return weeks.filter((week) => week !== null) as TeamScheduleWeek[];
}

function getRecord(weeks: TeamScheduleWeek[]) {
  const record = weeks.reduce<{
    wins: number;
    losses: number;
    draws: number;
  }>(
    (acc, week) => {
      if (week.won === true) {
        acc.wins++;
      } else if (week.won === false) {
        acc.losses++;
      }
      return acc;
    },
    {
      wins: 0,
      losses: 0,
      // TODO
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
  const wl = adjustedWins / totalGames;
  return { wins, losses, draws, wl };
}

function getRecordAgainst(weeks: TeamScheduleWeek[], opposingTeams: string[]) {
  return getRecord(
    weeks.filter((week) => opposingTeams.includes(week.opponent))
  );
}

function getDivisionTeams(division: Division) {
  switch (division) {
    default:
    case Division.AFC_North:
      return AFC_NORTH_TEAMS;
    case Division.AFC_South:
      return AFC_SOUTH_TEAMS;
    case Division.AFC_East:
      return AFC_EAST_TEAMS;
    case Division.AFC_West:
      return AFC_WEST_TEAMS;
    case Division.NFC_North:
      return NFC_NORTH_TEAMS;
    case Division.NFC_South:
      return NFC_SOUTH_TEAMS;
    case Division.NFC_East:
      return NFC_EAST_TEAMS;
    case Division.NFC_West:
      return NFC_WEST_TEAMS;
  }
}

function getDivisionRecord(weeks: TeamScheduleWeek[], division: Division) {
  const divisionTeams = getDivisionTeams(division);
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
  schedule: Schedule,
  teamShorthand: string,
  opponentShorthand: string
) {
  const ownTeam = TEAM_MAP[teamShorthand]!;
  const ownSchedule = filterByeWeeks(schedule[teamShorthand]!);
  const opponents = ownSchedule.map((match) => match.opponent);

  const team = TEAM_MAP[opponentShorthand]!;

  if (team.conference === ownTeam.conference) {
    const opponentSchedule = filterByeWeeks(schedule[team.shorthand]!);

    // Common games are games where tie breaking teams have a common opponent
    const commonTeams = opponentSchedule!
      .filter((match) => opponents.includes(match.opponent))
      .map((match) => match.opponent);

    if (team.division === ownTeam.division || commonTeams.length >= 4) {
      return getRecordAgainst(ownSchedule, commonTeams);
    }
  }

  return undefined;
}

function getStrengthOfSchedule(
  schedule: Schedule,
  teamShorthand: string,
  victoryOnly: boolean
) {
  const ownSchedule = filterByeWeeks(schedule[teamShorthand]!);
  const opponents = ownSchedule
    .filter((opponent) => (victoryOnly && opponent.won) || !victoryOnly)
    .map((match) => match.opponent);

  const records = opponents.map((opponent) => getRecord(filterByeWeeks(schedule[opponent]!)));

  const totalRecord = records.reduce<{
    wins: number;
    losses: number;
    draws: number;
  }>(
    (accumulator, record) => {
      accumulator.wins += record.wins;
      accumulator.losses += record.losses;
      accumulator.draws += record.draws;
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

export function getMultipleRecords(
  schedule: Schedule,
  teams: Team[]
): TeamRecord[] {
  return teams.map((team) => {
    // Filter out bye weeks
    const weeks = filterByeWeeks(schedule[team.shorthand]!);
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
      getH2H(input: string) {
        if (!(input in h2h)) {
          h2h[input] = getRecordAgainst(weeks, [input]);
        }
        return h2h[input]!;
      },
      getCommonRecord(input: string) {
        if (!(input in commonRecord)) {
          commonRecord[input] = getCommonRecord(
            schedule,
            team.shorthand,
            input
          );
        }
        return commonRecord[input]!;
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
    };
  });
}
