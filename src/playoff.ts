import {
  AFC_TEAMS,
  DIVISIONS,
  NFC_TEAMS,
  TEAMS,
  TEAM_MAP,
  isDivisionInConference,
} from "./data";
import { TeamRecord, TeamRecordData, getMultipleRecords } from "./records";
import { Schedule } from "./schedule";
import { setDiff } from "./utils";

function compareWL(a: TeamRecordData, b: TeamRecordData) {
  return b.wl - a.wl;
}

function sortRecords(records: TeamRecord[]) {
  return records.sort((a, b) => {
    // Sort by W/L percentage at first.
    const wlDiff = compareWL(a.record, b.record);
    if (wlDiff !== 0) {
      return wlDiff;
    }

    // Next, look at H2H.
    const aH2H = a.h2h[b.shorthand]!;
    const bH2H = b.h2h[a.shorthand]!;
    const h2hDiff = compareWL(aH2H, bH2H);
    if (h2hDiff !== 0) {
      return h2hDiff;
    }

    // Next, look at division W/L
    const divisionDiff = compareWL(a.divisionRecord, b.divisionRecord);
    if (divisionDiff !== 0) {
      return divisionDiff;
    }

    // TODO: Deal with tie breakers
    // TODO: Consider different tie breaking rules between division opponents and non-division opponents
    // TODO: Consider three+-way ties
    return 0;

    throw new Error(
      `Failed to break tie between ${a.shorthand} and ${b.shorthand}`
    );
  });
}

function getDivisionWinners(schedule: Schedule, conference?: string) {
  const filteredDivisions = conference
    ? DIVISIONS.filter((division) => division.startsWith(conference))
    : DIVISIONS;
  return filteredDivisions.map((division) => {
    const teams = TEAMS.filter((team) => team.division === division);
    const records = sortRecords(getMultipleRecords(schedule, teams));
    return records[0]!;
  });
}

export function getSeeding(schedule: Schedule) {
  const nfc = getConferenceSeeding(schedule, "NFC");
  const afc = getConferenceSeeding(schedule, "AFC");
  return { nfc, afc };
}

function getConferenceSeeding(schedule: Schedule, conference: string) {
  const conferenceTeams = conference === "AFC" ? AFC_TEAMS : NFC_TEAMS;
  const filteredSchedule = Object.keys(schedule).reduce<Schedule>(
    (acc, teamName) => {
      const team = TEAM_MAP[teamName]!;
      if (isDivisionInConference(team.division, conference)) {
        acc[teamName] = schedule[teamName]!;
      }
      return acc;
    },
    {}
  );

  const divisionWinners = sortRecords(
    getDivisionWinners(filteredSchedule, conference)
  );

  const remainingTeams = setDiff(
    conferenceTeams,
    divisionWinners.map((team) => TEAM_MAP[team.shorthand]!)
  );

  const remainingTeamsSorted = sortRecords(
    getMultipleRecords(schedule, remainingTeams)
  );

  const wildCards = remainingTeamsSorted.slice(0, 3);

  return divisionWinners.concat(wildCards).map((team) => team.shorthand);
}
