import {
  AFC_TEAMS,
  Conference,
  DIVISIONS,
  NFC_TEAMS,
  TEAM_MAP,
  isDivisionInConference,
} from "./data";
import { TeamRecord, TeamRecordData, getMultipleRecords } from "./records";
import { Schedule } from "./schedule";
import { setDiff } from "./utils";

function compareWL(a: TeamRecordData, b: TeamRecordData) {
  return b.wl - a.wl;
}

function sortRecordsInDivision(a: TeamRecord, b: TeamRecord) {
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

  // Next, look at common games
  const aCommonRecord = a.commonRecord[b.shorthand];
  const bCommonRecord = b.commonRecord[a.shorthand];
  if (aCommonRecord && bCommonRecord) {
    const commonGameDiff = compareWL(aCommonRecord, bCommonRecord);
    if (commonGameDiff !== 0) {
      return commonGameDiff;
    }
  }

  // Next, look at conference record
  const conferenceDiff = compareWL(a.conferenceRecord, b.conferenceRecord);
  if (conferenceDiff !== 0) {
    return conferenceDiff;
  }

  // TODO: Deal with more tie breakers
  // TODO: Consider three+-way ties
  //return 0;

  throw new Error(
    `Failed to break tie between ${a.shorthand} and ${
      b.shorthand
    } ${JSON.stringify(a.conferenceRecord)} ${JSON.stringify(
      b.conferenceRecord
    )}`
  );
}

function sortRecordsInConference(a: TeamRecord, b: TeamRecord) {
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

  // Next, look at conference record
  const conferenceDiff = compareWL(a.conferenceRecord, b.conferenceRecord);
  if (conferenceDiff !== 0) {
    return conferenceDiff;
  }

  // Next, look at common games
  const aCommonRecord = a.commonRecord[b.shorthand];
  const bCommonRecord = b.commonRecord[a.shorthand];
  if (aCommonRecord && bCommonRecord) {
    const commonGameDiff = compareWL(aCommonRecord, bCommonRecord);
    if (commonGameDiff !== 0) {
      return commonGameDiff;
    }
  }

  // TODO: Deal with more tie breakers
  // TODO: Consider three+-way ties
  //return 0;

  throw new Error(
    `Failed to break tie between ${a.shorthand} and ${
      b.shorthand
    } ${JSON.stringify(a.conferenceRecord)} ${JSON.stringify(
      b.conferenceRecord
    )}`
  );
}

function sortRecords(records: TeamRecord[]) {
  return records.sort((a, b) => {
    if (a.division === b.division) {
      return sortRecordsInDivision(a, b);
    }
    return sortRecordsInConference(a, b);
  });
}

function getDivisionWinners(records: TeamRecord[], conference?: Conference) {
  const filteredDivisions = conference
    ? DIVISIONS.filter((division) =>
        isDivisionInConference(division, conference)
      )
    : DIVISIONS;
  return filteredDivisions.map((division) => {
    const filteredRecords = records.filter(
      (record) => record.division === division
    );
    const sortedRecords = sortRecords(filteredRecords);
    return sortedRecords[0]!;
  });
}

export function getSeeding(schedule: Schedule) {
  const nfc = getConferenceSeeding(schedule, Conference.NFC);
  const afc = getConferenceSeeding(schedule, Conference.AFC);
  return { nfc, afc };
}

function getConferenceSeeding(schedule: Schedule, conference: Conference) {
  const conferenceTeams = conference === Conference.AFC ? AFC_TEAMS : NFC_TEAMS;

  const records = getMultipleRecords(schedule, conferenceTeams);

  const divisionWinners = sortRecords(getDivisionWinners(records, conference));

  const remainingTeams = setDiff(
    conferenceTeams,
    divisionWinners.map((team) => TEAM_MAP[team.shorthand]!)
  ).map((team) => team.shorthand);

  const remainingTeamRecords = records.filter((record) =>
    remainingTeams.includes(record.shorthand)
  );

  const remainingTeamsSorted = sortRecords(remainingTeamRecords);

  const wildCards = remainingTeamsSorted.slice(0, 3);

  return divisionWinners.concat(wildCards).map((team) => team.shorthand);
}
