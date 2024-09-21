import {
  AFC_TEAMS,
  Conference,
  Division,
  NFC_TEAMS,
  TEAMS,
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
}

function filterByeWeeks(
  weeks: (TeamScheduleWeek | null)[]
): TeamScheduleWeek[] {
  return weeks.filter((week) => week !== null) as TeamScheduleWeek[];
}

function getRecord(weeks: TeamScheduleWeek[]) {
  const { wins, losses, draws } = weeks.reduce<{
    wins: number;
    losses: number;
    draws: number;
  }>(
    (acc, week) => {
      if (week.won) {
        acc.wins++;
      } else {
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

function getDivisionRecord(weeks: TeamScheduleWeek[], division: Division) {
  const divisionTeams = TEAMS.filter((team) => team.division === division);
  return getRecordAgainst(
    weeks,
    divisionTeams.map((team) => team.shorthand)
  );
}

function getConferenceRecord(
  weeks: TeamScheduleWeek[],
  conference: Conference
) {
  const conferenceTeams = conference === Conference.AFC ? AFC_TEAMS : NFC_TEAMS;
  return getRecordAgainst(
    weeks,
    conferenceTeams.map((team) => team.shorthand)
  );
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

  if (
    team.conference === ownTeam.conference &&
    teamShorthand !== team.shorthand
  ) {
    const opponentSchedule = filterByeWeeks(schedule[team.shorthand]!);

    // Common games are games where tie breaking teams have a common opponent
    const commonTeams = opponentSchedule!
      .filter((match) => opponents.includes(match.opponent))
      .map((match) => match.opponent);

    if (commonTeams.length >= 4) {
      return getRecordAgainst(ownSchedule, commonTeams);
    }
  }

  return undefined;
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
      getH2H(input) {
        if (!(input in h2h)) {
          h2h[input] = getRecordAgainst(weeks, [input]);
        }
        return h2h[input]!;
      },
      getCommonRecord(input) {
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
    };
  });
}
