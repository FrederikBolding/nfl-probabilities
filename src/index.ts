import { Conference, SCHEDULE_2024 as SCHEDULE, TEAM_MAP, Team } from "./data";
import { getSeeding } from "./playoff";
import { calculatePlayoffProbability } from "./probability";
import Table from "cli-table3";
import colors from "@colors/colors/safe";

console.log("Calculating current seeding...");
const seeding = getSeeding(SCHEDULE, true);

const playoffProbabilities = calculatePlayoffProbability(SCHEDULE);

function drawRow(team: Team, seedingData: any) {
  const weeks = SCHEDULE[team.shorthand]!;
  const wins = weeks.filter((week) => week?.won === true).length;
  const losses = weeks.filter((week) => week?.won === false).length;
  const draws = 0; // TODO
  const isEliminated = seedingData.eliminatedTeams.includes(team.shorthand);
  const isClinched = seedingData.clinchedTeams.includes(team.shorthand);
  const tag = isClinched ? "(P)" : isEliminated ? "(E)" : "";
  return [
    `${team.name.split(" ").at(-1)} ${tag}`,
    `${wins}-${losses}-${draws}`,
    `${playoffProbabilities[team.shorthand]!.toFixed(2)}%`,
  ];
}

function drawTable(afc: Team[], nfc: Team[]) {
  const table = new Table();

  table.push([
    { content: colors.red("AFC"), colSpan: 3, hAlign: "center" },
    { content: "", rowSpan: 18 },
    { content: colors.blue("NFC"), colSpan: 3, hAlign: "center" },
  ]);

  table.push([
    colors.red("Team"),
    colors.red("Record"),
    colors.red("Playoff %"),
    colors.blue("Team"),
    colors.blue("Record"),
    colors.blue("Playoff %"),
  ]);

  afc.forEach((team, index) => {
    table.push([
      ...drawRow(team, seeding.afc),
      ...drawRow(nfc[index]!, seeding.nfc),
    ]);
  });

  console.log(table.toString());
}

const afc = Object.values(TEAM_MAP)
  .filter((team) => team.conference === Conference.AFC)
  .sort((a, b) => {
    const aIndex = seeding.afc.seeding.indexOf(a.shorthand);
    const bIndex = seeding.afc.seeding.indexOf(b.shorthand);
    if (aIndex === -1 && bIndex === -1) {
      return (
        playoffProbabilities[b.shorthand]! - playoffProbabilities[a.shorthand]!
      );
    } else if (aIndex === -1) {
      return 1;
    } else if (bIndex === -1) {
      return -1;
    }
    return aIndex - bIndex;
  });

const nfc = Object.values(TEAM_MAP)
  .filter((team) => team.conference === Conference.NFC)
  .sort((a, b) => {
    const aIndex = seeding.nfc.seeding.indexOf(a.shorthand);
    const bIndex = seeding.nfc.seeding.indexOf(b.shorthand);
    if (aIndex === -1 && bIndex === -1) {
      return (
        playoffProbabilities[b.shorthand]! - playoffProbabilities[a.shorthand]!
      );
    } else if (aIndex === -1) {
      return 1;
    } else if (bIndex === -1) {
      return -1;
    }
    return aIndex - bIndex;
  });

drawTable(afc, nfc);
