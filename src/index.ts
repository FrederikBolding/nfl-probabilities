import { Conference, SCHEDULE_2024 as SCHEDULE, TEAM_MAP, Team } from "./data";
import { getSeeding } from "./playoff";
import { calculatePlayoffProbability } from "./probability";
import Table from "cli-table3";

console.log("Calculating current seeding...");
const seeding = getSeeding(SCHEDULE);

const playoffProbabilities = calculatePlayoffProbability(SCHEDULE);

function drawTable(teams: Team[]) {
  const table = new Table({
    head: ["Team", "Record", "Playoff Probability"],
  });

  teams.forEach((team) => {
    const weeks = SCHEDULE[team.shorthand]!;
    const wins = weeks.filter((week) => week?.won === true).length;
    const losses = weeks.filter((week) => week?.won === false).length;
    const draws = 0; // TODO
    table.push([
      team.name,
      `${wins}-${losses}-${draws}`,
      `${playoffProbabilities[team.shorthand]!.toFixed(2)}%`,
    ]);
  });

  console.log(table.toString());
}

const afc = Object.values(TEAM_MAP)
  .filter((team) => team.conference === Conference.AFC)
  .sort((a, b) => {
    const aIndex = seeding.afc.indexOf(a.shorthand);
    const bIndex = seeding.afc.indexOf(b.shorthand);
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
    const aIndex = seeding.nfc.indexOf(a.shorthand);
    const bIndex = seeding.nfc.indexOf(b.shorthand);
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

drawTable(afc);
drawTable(nfc);
