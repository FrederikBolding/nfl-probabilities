import {
  getSchedule,
  getSeeding,
  calculatePlayoffProbability,
} from "@nfl-probabilities/core";

async function handleRequest(method: string) {
  const schedule = await getSchedule(2025);
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
  const result = await handleRequest(event.data.method);
  postMessage({ id, result });
});
