import {
  getSchedule,
  getSeeding,
  calculatePlayoffProbability,
} from "@nfl-probabilities/core";

export type WorkerResponse = Awaited<ReturnType<typeof handleRequest>>;

const schedules: Record<number, ReturnType<typeof getSchedule>> = {};

async function getCachedSchedule(season: number) {
  const cached = schedules[season];
  if (cached) {
    return cached;
  }

  const promise = getSchedule(season);
  schedules[season] = promise;
  return promise;
}

function handleRequest(
  schedule: Awaited<ReturnType<typeof getSchedule>>,
  method: string,
) {
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
  const schedule = await getCachedSchedule(event.data.season);
  const result = handleRequest(schedule, event.data.method);
  postMessage({ id, result });
});
