import {
  getSchedule,
  getSeeding,
  calculatePlayoffProbability,
} from "@nfl-probabilities/core";

async function handleRequest(season: number, method: string) {
  const schedule = await getSchedule(season);
  switch (method) {
    case "getSchedule":
      return schedule;
    case "getSeeding":
      return getSeeding(schedule.schedule, true);
    case "calculatePlayoffProbability":
      return calculatePlayoffProbability(schedule.schedule, schedule.ratings);
  }
}

addEventListener("message", async (event) => {
  const id = event.data.id;
  const result = await handleRequest(event.data.season, event.data.method);
  postMessage({ id, result });
});
