import { SCHEDULE } from "./data";
import { calculatePlayoffProbability, getSeeding } from "./playoff";
import { Schedule } from "./schedule";

Object.entries(SCHEDULE).forEach(([team, weeks]) => {
  const opponents = weeks.map((week) => week?.opponent ?? "BYE").join(" ");
  const wins = weeks.filter((week) => week?.won === true).length;
  const losses = weeks.filter((week) => week?.won === false).length;
  const draws = 0; // TODO
  console.log(
    team,
    `${wins}-${losses}-${draws}`,
    `${calculatePlayoffProbability(team)}%`
  );
});

console.log(getSeeding(SCHEDULE));
