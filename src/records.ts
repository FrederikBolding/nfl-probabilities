import {
  Conference,
  Division,
  TEAMS,
  TEAM_MAP,
  Team,
  isDivisionInConference,
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
  h2h: Record<string, TeamRecordData>;
  commonRecord: Record<string, TeamRecordData>;
  divisionRecord: TeamRecordData;
  conferenceRecord: TeamRecordData;
}

function filterByeWeeks(
  weeks: (TeamScheduleWeek | null)[]
): TeamScheduleWeek[] {
  return weeks.filter((week) => week !== null) as TeamScheduleWeek[];
}

function getRecord(weeks: TeamScheduleWeek[]) {
  const wins = weeks.filter((week) => week?.won === true).length;
  const losses = weeks.filter((week) => week?.won === false).length;
  const draws = 0; // TODO
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

function getH2HRecords(weeks: TeamScheduleWeek[], teamShorthand: string) {
  const ownTeam = TEAM_MAP[teamShorthand]!;
  return TEAMS.reduce<Record<string, TeamRecordData>>((acc, team) => {
    // Don't calculate H2H against ourselves or teams outside our conference
    if (
      team.conference === ownTeam.conference &&
      teamShorthand !== team.shorthand
    ) {
      acc[team.shorthand] = getRecordAgainst(weeks, [team.shorthand]);
    }
    return acc;
  }, {});
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
  const conferenceTeams = TEAMS.filter(
    (team) => team.conference === conference
  );
  return getRecordAgainst(
    weeks,
    conferenceTeams.map((team) => team.shorthand)
  );
}

function getCommonRecord(schedule: Schedule, teamShorthand: string) {
  const ownTeam = TEAM_MAP[teamShorthand]!;
  const ownSchedule = filterByeWeeks(schedule[teamShorthand]!);
  const opponents = ownSchedule.map((match) => match.opponent);
  return TEAMS.reduce<Record<string, TeamRecordData>>((acc, team) => {
    // Don't calculate this for ourselves or teams outside our conference
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
        acc[team.shorthand] = getRecordAgainst(ownSchedule, commonTeams);
      }
    }
    return acc;
  }, {});
}

export function getMultipleRecords(
  schedule: Schedule,
  teams: Team[]
): TeamRecord[] {
  return teams.map((team) => {
    // Filter out bye weeks
    const weeks = filterByeWeeks(schedule[team.shorthand]!);
    // TODO: Lazily compute all this
    return {
      shorthand: team.shorthand,
      division: team.division,
      record: getRecord(weeks),
      h2h: getH2HRecords(weeks, team.shorthand),
      commonRecord: getCommonRecord(schedule, team.shorthand),
      divisionRecord: getDivisionRecord(weeks, team.division),
      conferenceRecord: getConferenceRecord(weeks, team.conference),
    };
  });
}
