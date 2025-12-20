import Table from "cli-table3";
import colors from "@colors/colors/safe";
import {
  Conference,
  TEAM_MAP,
  Team,
  WeekResult,
  getSeeding,
  calculatePlayoffProbability,
  getSchedule,
} from "@nfl-probabilities/core";

const args = process.argv;
const season = parseInt(args[2] ?? "2025");

async function main() {
  const { schedule, ratings } = await getSchedule(season);

  const seeding = getSeeding(schedule, true);
  const playoffProbabilities = calculatePlayoffProbability(schedule, ratings);

  function drawRow(
    team: Team,
    seedingData: ReturnType<typeof getSeeding>["afc"]
  ) {
    const weeks = schedule[team.shorthand]!;
    const wins = weeks.filter((week) => week?.result === WeekResult.Win).length;
    const losses = weeks.filter(
      (week) => week?.result === WeekResult.Loss
    ).length;
    const draws = weeks.filter(
      (week) => week?.result === WeekResult.Draw
    ).length;
    const isEliminated = seedingData.eliminatedTeams.includes(team.shorthand);
    const isClinched = seedingData.clinchedTeams.includes(team.shorthand);
    const tag = isClinched ? "(P)" : isEliminated ? "(E)" : "";
    const playoffProbability = playoffProbabilities[team.shorthand]!;
    return [
      `${team.name.split(" ").at(-1)} ${tag}`,
      `${wins}-${losses}-${draws}`,
      `${
        isEliminated || playoffProbability > 1
          ? !isClinched && playoffProbability > 99
            ? ">99"
            : playoffProbability.toFixed(0)
          : "<1"
      }%`,
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
      return aIndex - bIndex;
    });

  const nfc = Object.values(TEAM_MAP)
    .filter((team) => team.conference === Conference.NFC)
    .sort((a, b) => {
      const aIndex = seeding.nfc.seeding.indexOf(a.shorthand);
      const bIndex = seeding.nfc.seeding.indexOf(b.shorthand);
      return aIndex - bIndex;
    });

  drawTable(afc, nfc);
}

main().catch(console.error);
