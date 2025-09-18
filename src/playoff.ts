import {
  AFC_DIVISIONS,
  AFC_TEAMS_OBJECTS,
  Conference,
  NFC_DIVISIONS,
  NFC_TEAMS_OBJECTS,
  REGULAR_SEASON_GAMES,
  TEAM_MAP,
  WILDCARD_SPOTS,
} from "./data";
import { TeamRecord, TeamRecordData, getMultipleRecords } from "./records";
import { ScheduleWithoutByes } from "./schedule";
import { filterMap, findMinIndex, findMinIndexMap, separate } from "./utils";

function compareWL(a: TeamRecordData, b: TeamRecordData) {
  return b.wl - a.wl;
}

function findDivisionTiebreakEliminationIndex(records: TeamRecord[]): number {
  // First, look at H2H.
  const h2hIndex = findMinIndexMap(
    records,
    (record) =>
      record.getH2H(
        filterMap(
          records,
          (opponent) => opponent.shorthand !== record.shorthand,
          (opponent) => opponent.shorthand
        )
      ).wl
  );
  if (h2hIndex !== -1) {
    return h2hIndex;
  }

  // Next, look at division W/L
  const divisionIndex = findMinIndexMap(
    records,
    (record) => record.divisionRecord.wl
  );
  if (divisionIndex !== -1) {
    return divisionIndex;
  }

  // Next, look at common games
  const commonRecords = records.map((record) =>
    record.getCommonRecord(
      filterMap(
        records,
        (opponent) => opponent.shorthand !== record.shorthand,
        (opponent) => opponent.shorthand
      )
    )
  );
  const commonRecordIndex = findMinIndex(
    filterMap(commonRecords, Boolean, (record) => record!.wl)
  );
  if (commonRecordIndex !== -1) {
    return commonRecordIndex;
  }

  // Next, look at conference record
  const conferenceIndex = findMinIndexMap(
    records,
    (record) => record.conferenceRecord.wl
  );
  if (conferenceIndex !== -1) {
    return conferenceIndex;
  }

  // Next, look at strength of victory
  const strengthOfVictoryIndex = findMinIndexMap(
    records,
    (record) => record.strengthOfVictory.wl
  );
  if (strengthOfVictoryIndex !== -1) {
    return strengthOfVictoryIndex;
  }

  // Next, look at strength of schedule
  const strengthOfScheduleIndex = findMinIndexMap(
    records,
    (record) => record.strengthOfSchedule.wl
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
    const h2hIndex = findMinIndexMap(
      records,
      (record) =>
        record.getH2H(
          filterMap(
            records,
            (opponent) => opponent.shorthand !== record.shorthand,
            (opponent) => opponent.shorthand
          )
        ).wl
    );
    if (h2hIndex !== -1) {
      return h2hIndex;
    }
  }

  // Next, look at conference record
  const conferenceIndex = findMinIndexMap(
    records,
    (record) => record.conferenceRecord.wl
  );
  if (conferenceIndex !== -1) {
    return conferenceIndex;
  }

  // Next, look at common games
  const commonRecords = records.map((record) =>
    record.getCommonRecord(
      filterMap(
        records,
        (opponent) => opponent.shorthand !== record.shorthand,
        (opponent) => opponent.shorthand
      )
    )
  );
  const commonRecordIndex = findMinIndex(
    filterMap(commonRecords, Boolean, (record) => record!.wl)
  );
  if (commonRecordIndex !== -1) {
    return commonRecordIndex;
  }

  // Next, look at strength of victory
  const strengthOfVictoryIndex = findMinIndexMap(
    records,
    (record) => record.strengthOfVictory.wl
  );
  if (strengthOfVictoryIndex !== -1) {
    return strengthOfVictoryIndex;
  }

  // Next, look at strength of schedule
  const strengthOfScheduleIndex = findMinIndexMap(
    records,
    (record) => record.strengthOfSchedule.wl
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
      accumulator[record.division]!++;
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
    if (divisionIndex === -1) {
      throw new Error(
        `Failed to break tie between: ${divisionRecords
          .map((record) => record.shorthand)
          .join(",")}`
      );
    }
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
  const tiesBroken = grouped.flatMap((group) => breakTies(group, isDivision));

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

    const tiesBroken = breakTies(grouped[0]!, true);

    return tiesBroken[0]!;
  });
}

export function getSeeding(
  schedule: ScheduleWithoutByes,
  includeEliminations = false
) {
  const nfc = getConferenceSeeding(
    schedule,
    Conference.NFC,
    includeEliminations
  );
  const afc = getConferenceSeeding(
    schedule,
    Conference.AFC,
    includeEliminations
  );
  return { nfc, afc };
}

function canTie(
  recordA: TeamRecord,
  recordB: TeamRecord,
  remainingGames: number
) {
  // Team A can tie Team B in W/L if they win the remaining N games
  // Also return true if Team A outright has beat Team B
  const winDiff = recordA.record.adjustedWins - recordB.record.adjustedWins;
  if (winDiff > remainingGames) {
    return true;
  }
  return Math.abs(winDiff) <= remainingGames;
}

function isPlayoffsClinched(
  records: TeamRecord[],
  divisionWinners: string[],
  wildCards: string[],
  shorthand: string
) {
  const team = TEAM_MAP[shorthand]!;
  const teamRecord = records.find((record) => record.shorthand === shorthand)!;

  const allTeams = records.filter((record) => record.shorthand !== shorthand);

  const division = team.division;
  const divisionTeams = allTeams.filter(
    (record) => record.division === division
  );

  const isCurrentDivisionWinner = divisionWinners.includes(shorthand);

  const isGuaranteedDivisionWinner =
    isCurrentDivisionWinner &&
    !divisionTeams.some((divisionTeamRecord) =>
      canTie(
        divisionTeamRecord,
        teamRecord,
        REGULAR_SEASON_GAMES - divisionTeamRecord.record.totalGames
      )
    );

  const wildCardTies = allTeams.filter((wildCardTeamRecord) =>
    canTie(
      wildCardTeamRecord,
      teamRecord,
      REGULAR_SEASON_GAMES - wildCardTeamRecord.record.totalGames
    )
  );

  const isGuaranteedWildcard =
    (isCurrentDivisionWinner || wildCards.includes(shorthand)) &&
    wildCardTies.length < WILDCARD_SPOTS + 4;

  // A team is considered clinched if it is a guaranteed division winner or a guaranteed wild card (in top 7 and no one can tie)
  return isGuaranteedDivisionWinner || isGuaranteedWildcard;
}

function isEliminated(
  records: TeamRecord[],
  divisionWinners: string[],
  wildCards: string[],
  shorthand: string
) {
  const team = TEAM_MAP[shorthand]!;
  const teamRecord = records.find((record) => record.shorthand === shorthand)!;

  const remainingGames = REGULAR_SEASON_GAMES - teamRecord.record.totalGames;

  const division = team.division;
  const divisionWinner = divisionWinners.find(
    (divisionWinner) => TEAM_MAP[divisionWinner]!.division === division
  )!;

  const divisionWinnerRecord = records.find(
    (record) => record.shorthand === divisionWinner
  )!;

  const canTieDivisionWinner = canTie(
    teamRecord,
    divisionWinnerRecord,
    remainingGames
  );

  const canTieWildCard = wildCards.some((wildCard) => {
    const wildCardRecord = records.find(
      (record) => record.shorthand === wildCard
    )!;

    return canTie(teamRecord, wildCardRecord, remainingGames);
  });

  // A team is considered eliminated if it cannot at least tie for the division or tie for a wildcard spot
  return !canTieDivisionWinner && !canTieWildCard;
}

function getConferenceSeeding(
  schedule: ScheduleWithoutByes,
  conference: Conference,
  includeEliminations: boolean
) {
  const conferenceTeams =
    conference === Conference.AFC ? AFC_TEAMS_OBJECTS : NFC_TEAMS_OBJECTS;

  const records = getMultipleRecords(schedule, conferenceTeams);

  const divisionWinners = sortRecords(
    getDivisionWinners(records, conference),
    false
  ).map((team) => team.shorthand);

  const remainingTeamRecords = records.filter(
    (record) => !divisionWinners.includes(record.shorthand)
  );

  const remainingTeamsSorted = sortRecords(remainingTeamRecords, false);

  const wildCards = remainingTeamsSorted
    .slice(0, WILDCARD_SPOTS)
    .map((team) => team.shorthand);

  const seeding = divisionWinners.concat(wildCards);

  const eliminatedTeams = includeEliminations
    ? conferenceTeams.reduce<string[]>((accumulator, team) => {
        if (isEliminated(records, divisionWinners, wildCards, team.shorthand)) {
          accumulator.push(team.shorthand);
        }
        return accumulator;
      }, [])
    : [];

  const clinchedTeams = includeEliminations
    ? conferenceTeams.reduce<string[]>((accumulator, team) => {
        if (
          isPlayoffsClinched(
            records,
            divisionWinners,
            wildCards,
            team.shorthand
          )
        ) {
          accumulator.push(team.shorthand);
        }
        return accumulator;
      }, [])
    : [];

  return { seeding, eliminatedTeams, clinchedTeams };
}
