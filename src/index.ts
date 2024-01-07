import { SCHEDULE } from "./data";
import { getSeeding } from "./playoff";
import { calculatePlayoffProbability } from "./probability";

console.log(getSeeding(SCHEDULE));

const playoffProbabilities = calculatePlayoffProbability(SCHEDULE);

Object.entries(SCHEDULE).forEach(([team, weeks]) => {
  const opponents = weeks.map((week) => week?.opponent ?? "BYE").join(" ");
  const wins = weeks.filter((week) => week?.won === true).length;
  const losses = weeks.filter((week) => week?.won === false).length;
  const draws = 0; // TODO
  console.log(
    team,
    `${wins}-${losses}-${draws}`,
    `${playoffProbabilities[team]}%`
  );
});
