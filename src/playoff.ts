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
import { findMinIndex, separate, setDiff } from "./utils";

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
  const aH2H = a.getH2H(b.shorthand);
  const bH2H = b.getH2H(a.shorthand);
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
  const aCommonRecord = a.getCommonRecord(b.shorthand);
  const bCommonRecord = b.getCommonRecord(a.shorthand);
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
  const aH2H = a.getH2H(b.shorthand);
  const bH2H = b.getH2H(a.shorthand);
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
  const aCommonRecord = a.getCommonRecord(b.shorthand);
  const bCommonRecord = b.getCommonRecord(a.shorthand);
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

function groupRecordsByWL(records: TeamRecord[]) {
  return records.reduce<TeamRecord[][]>(
    (acc, record) => {
      const currentGroup = acc[acc.length - 1]!;
      const recordToCompare = currentGroup[0];

      if (!recordToCompare || recordToCompare.record.wl === record.record.wl) {
        currentGroup.push(record);
      } else {
        acc.push([record]);
      }
      return acc;
    },
    [[]]
  );
}

function breakDivisionTie(records: TeamRecord[]): TeamRecord[] {
  if (records.length > 2) {
    // TODO: Reimplement from sortRecordsInDivision

    const worstConferenceWL = findMinIndex(
      records.map((record) => record.conferenceRecord.wl)
    );

    if (worstConferenceWL !== -1) {
      const [separated, worst] = separate(records, worstConferenceWL);
      return [
        ...breakTies(separated as TeamRecord[], true),
        worst as TeamRecord,
      ];
    }

    throw new Error(
      `Failed to break tie between ${records
        .map((record) => record.shorthand)
        .join(",")}`
    );
  }

  return records.sort(sortRecordsInDivision);
}

function breakConferenceTie(records: TeamRecord[]): TeamRecord[] {
  if (records.length > 2) {
    // TODO: Reimplement from sortRecordsInConference

    const worstConferenceWL = findMinIndex(
      records.map((record) => record.conferenceRecord.wl)
    );

    if (worstConferenceWL !== -1) {
      const [separated, worst] = separate(records, worstConferenceWL);
      return [
        ...breakTies(separated as TeamRecord[], true),
        worst as TeamRecord,
      ];
    }

    throw new Error(
      `Failed to break tie between ${records
        .map((record) => record.shorthand)
        .join(",")}`
    );
  }

  return records.sort(sortRecordsInConference);
}

function breakTies(records: TeamRecord[], isDivisionTie: boolean) {
  if (records.length === 1) {
    return records;
  }
  return isDivisionTie
    ? breakDivisionTie(records)
    : breakConferenceTie(records);
}

function sortRecords(records: TeamRecord[], isDivision: boolean) {
  const initialSort = records.sort((a, b) => compareWL(a.record, b.record));
  const grouped = groupRecordsByWL(initialSort);
  const tiesBroken = grouped
    .map((group) => breakTies(group, isDivision))
    .flat();

  return tiesBroken;
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
    const sortedRecords = sortRecords(filteredRecords, true);
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

  const divisionWinners = sortRecords(
    getDivisionWinners(records, conference),
    false
  );

  const remainingTeams = setDiff(
    conferenceTeams,
    divisionWinners.map((team) => TEAM_MAP[team.shorthand]!)
  ).map((team) => team.shorthand);

  const remainingTeamRecords = records.filter((record) =>
    remainingTeams.includes(record.shorthand)
  );

  const remainingTeamsSorted = sortRecords(remainingTeamRecords, false);

  const wildCards = remainingTeamsSorted.slice(0, 3);

  return divisionWinners.concat(wildCards).map((team) => team.shorthand);
}
