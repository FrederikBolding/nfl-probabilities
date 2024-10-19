import {
  AFC_DIVISIONS,
  AFC_TEAMS,
  Conference,
  NFC_DIVISIONS,
  NFC_TEAMS,
  TEAM_MAP,
} from "./data";
import { TeamRecord, TeamRecordData, getMultipleRecords } from "./records";
import { Schedule } from "./schedule";
import { findMinIndex, separate, setDiff } from "./utils";

function compareWL(a: TeamRecordData, b: TeamRecordData) {
  return b.wl - a.wl;
}

function findDivisionTiebreakEliminationIndex(records: TeamRecord[]): number {
  // First, look at H2H.
  const h2h = records.map(
    (record) =>
      record.getH2H(
        records
          .filter((opponent) => opponent.shorthand !== record.shorthand)
          .map((opponent) => opponent.shorthand)
      ).wl
  );
  const h2hIndex = findMinIndex(h2h);
  if (h2hIndex !== -1) {
    return h2hIndex;
  }

  // Next, look at division W/L
  const divisionIndex = findMinIndex(
    records.map((record) => record.divisionRecord.wl)
  );
  if (divisionIndex !== -1) {
    return divisionIndex;
  }

  // Next, look at common games
  const commonRecords = records.map((record) =>
    record.getCommonRecord(
      records
        .filter((opponent) => opponent.shorthand !== record.shorthand)
        .map((opponent) => opponent.shorthand)
    )
  );
  const commonRecordIndex = findMinIndex(
    commonRecords.map((record) => record!.wl)
  );
  if (commonRecordIndex !== -1) {
    return commonRecordIndex;
  }

  // Next, look at conference record
  const conferenceIndex = findMinIndex(
    records.map((record) => record.conferenceRecord.wl)
  );
  if (conferenceIndex !== -1) {
    return conferenceIndex;
  }

  // Next, look at strength of victory
  const strengthOfVictoryIndex = findMinIndex(
    records.map((record) => record.strengthOfVictory.wl)
  );
  if (strengthOfVictoryIndex !== -1) {
    return strengthOfVictoryIndex;
  }

  // Next, look at strength of schedule
  const strengthOfScheduleIndex = findMinIndex(
    records.map((record) => record.strengthOfSchedule.wl)
  );
  if (strengthOfScheduleIndex !== -1) {
    return strengthOfScheduleIndex;
  }

  // TODO: Deal with more tie breakers

  return -1;
}

function findConferenceTiebreakEliminationIndex(records: TeamRecord[]) {
  // First, look at H2H.
  // TODO: Handle sweep rule for three+ way tie.
  if (records.length === 2) {
    const h2h = records.map(
      (record) =>
        record.getH2H(
          records
            .filter((opponent) => opponent.shorthand !== record.shorthand)
            .map((opponent) => opponent.shorthand)
        ).wl
    );
    const h2hIndex = findMinIndex(h2h);
    if (h2hIndex !== -1) {
      console.log("Tiebreak via H2H");
      return h2hIndex;
    }
  }

  // Next, look at conference record
  const conferenceIndex = findMinIndex(
    records.map((record) => record.conferenceRecord.wl)
  );
  if (conferenceIndex !== -1) {
    return conferenceIndex;
  }

  // Next, look at common games
  const commonRecords = records.map((record) =>
    record.getCommonRecord(
      records
        .filter((opponent) => opponent.shorthand !== record.shorthand)
        .map((opponent) => opponent.shorthand)
    )
  );
  const commonRecordIndex = findMinIndex(
    commonRecords.map((record) => record!.wl)
  );
  if (commonRecordIndex !== -1) {
    return commonRecordIndex;
  }

  // Next, look at strength of victory
  const strengthOfVictoryIndex = findMinIndex(
    records.map((record) => record.strengthOfVictory.wl)
  );
  if (strengthOfVictoryIndex !== -1) {
    return strengthOfVictoryIndex;
  }

  // Next, look at strength of schedule
  const strengthOfScheduleIndex = findMinIndex(
    records.map((record) => record.strengthOfSchedule.wl)
  );
  if (strengthOfScheduleIndex !== -1) {
    return strengthOfScheduleIndex;
  }

  // TODO: Deal with more tie breakers
  return -1;
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

function breakTies(
  records: TeamRecord[],
  isDivisionTie: boolean
): TeamRecord[] {
  if (records.length === 1) {
    return records;
  }
  const isDivision =
    isDivisionTie ||
    records.every((record) => record.division === records[0]!.division);

  const divisions = records.reduce<Record<string, number>>(
    (accumulator, record) => {
      if (!(record.division in accumulator)) {
        accumulator[record.division] = 0;
      }
      accumulator[record.division]++;
      return accumulator;
    },
    {}
  );

  const divisionToBreak = Object.entries(divisions).find(
    ([_key, value]) => value > 1
  )?.[0];

  // If we are breaking ties for a wildcard and have multiple teams from the same division, we need to look at eliminating the worst team from that division.
  // TODO: Eliminated teams should be reconsidered in following rounds of tie breaking.
  if (!isDivisionTie && divisionToBreak) {
    const divisionRecords = records.filter(
      (record) => record.division === divisionToBreak
    );
    const divisionIndex = findDivisionTiebreakEliminationIndex(divisionRecords);
    const index = records.findIndex(
      (record) => record.shorthand === divisionRecords[divisionIndex]!.shorthand
    );
    const [separated, worst] = separate(records, index);
    return [
      ...breakTies(separated as TeamRecord[], isDivision),
      worst as TeamRecord,
    ];
  }

  const index = isDivision
    ? findDivisionTiebreakEliminationIndex(records)
    : findConferenceTiebreakEliminationIndex(records);
  if (index === -1) {
    throw new Error(
      `Failed to break tie between: ${records
        .map((record) => record.shorthand)
        .join(",")}`
    );
  }
  const [separated, worst] = separate(records, index);
  return [
    ...breakTies(separated as TeamRecord[], isDivision),
    worst as TeamRecord,
  ];
}

function sortRecords(records: TeamRecord[], isDivision: boolean) {
  const initialSort = records.sort((a, b) => compareWL(a.record, b.record));
  const grouped = groupRecordsByWL(initialSort);
  const tiesBroken = grouped
    .map((group) => breakTies(group, isDivision))
    .flat();

  return tiesBroken;
}

function getDivisionWinners(records: TeamRecord[], conference: Conference) {
  const filteredDivisions =
    conference === Conference.AFC ? AFC_DIVISIONS : NFC_DIVISIONS;
  return filteredDivisions.map((division) => {
    const filteredRecords = records.filter(
      (record) => record.division === division
    );

    // Faster version of sortRecords, this should match that implementation as close as possible.
    const initialSort = filteredRecords.sort((a, b) =>
      compareWL(a.record, b.record)
    );
    const grouped = groupRecordsByWL(initialSort);

    if (grouped[0]!.length === 1) {
      return grouped[0]![0]!;
    }

    const tiesBroken = grouped.map((group) => breakTies(group, true)).flat();

    return tiesBroken[0]!;
  });
}

export function getSeeding(schedule: Schedule) {
  const nfc = getConferenceSeeding(schedule, Conference.NFC);
  const afc = getConferenceSeeding(schedule, Conference.AFC);
  return { nfc, afc };
}

function getConferenceSeeding(schedule: Schedule, conference: Conference) {
  const conferenceTeams = conference === Conference.AFC ? AFC_TEAMS : NFC_TEAMS;

  const records = getMultipleRecords(
    schedule,
    conferenceTeams.map((team) => TEAM_MAP[team]!)
  );

  const divisionWinners = sortRecords(
    getDivisionWinners(records, conference),
    false
  );

  const remainingTeams = setDiff(
    conferenceTeams,
    divisionWinners.map((team) => team.shorthand)
  );

  const remainingTeamRecords = records.filter((record) =>
    remainingTeams.includes(record.shorthand)
  );

  const remainingTeamsSorted = sortRecords(remainingTeamRecords, false);

  const wildCards = remainingTeamsSorted.slice(0, 3);

  return divisionWinners.concat(wildCards).map((team) => team.shorthand);
}
