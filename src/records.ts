import { TEAMS, Team } from "./data";
import { Schedule, TeamScheduleWeek } from "./schedule";

export interface TeamRecordData {
  wins: number;
  losses: number;
  draws: number;
  wl: number;
}

export interface TeamRecord {
  shorthand: string;
  record: TeamRecordData;
  h2h: Record<string, TeamRecordData>;
  divisionRecord: TeamRecordData;
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
  return TEAMS.reduce<Record<string, TeamRecordData>>((acc, team) => {
    // Don't calculate H2H against ourselves
    if (teamShorthand !== team.shorthand) {
      acc[team.shorthand] = getRecordAgainst(weeks, [team.shorthand]);
    }
    return acc;
  }, {});
}

function getDivisionRecord(weeks: TeamScheduleWeek[], division: string) {
  const divisionTeams = TEAMS.filter((team) => team.division === division);
  return getRecordAgainst(
    weeks,
    divisionTeams.map((team) => team.shorthand)
  );
}

export function getMultipleRecords(
  schedule: Schedule,
  teams: Team[]
): TeamRecord[] {
  return teams.map((team) => {
    // Filter out bye weeks
    const weeks = schedule[team.shorthand]!.filter(
      (week) => week !== null
    ) as TeamScheduleWeek[];
    return {
      shorthand: team.shorthand,
      record: getRecord(weeks),
      h2h: getH2HRecords(weeks, team.shorthand),
      divisionRecord: getDivisionRecord(weeks, team.division),
    };
  });
}
