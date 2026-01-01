import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Worker from "./worker?worker";
import type {
  Schedule,
  ScheduleWithoutByes,
  Seeding,
  TeamEloRating,
} from "@nfl-probabilities/core";

export type DataContextType = {
  schedule: ScheduleWithoutByes | null;
  scheduleWithByes: Schedule | null;
  ratings: Record<string, TeamEloRating> | null;
  seeding: Seeding | null;
  playoffProbabilities: Record<string, number> | null;
};

export const DataContext = createContext<DataContextType>({
  schedule: null,
  scheduleWithByes: null,
  ratings: null,
  seeding: null,
  playoffProbabilities: null,
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const worker = useRef(new Worker());

  const idRef = useRef(0);
  const [schedule, setSchedule] = useState<DataContextType["schedule"]>(null);
  const [scheduleWithByes, setScheduleWithByes] =
    useState<DataContextType["scheduleWithByes"]>(null);
  const [ratings, setRatings] = useState<DataContextType["ratings"]>(null);
  const [seeding, setSeeding] = useState<DataContextType["seeding"]>(null);
  const [playoffProbabilities, setPlayoffProbabilities] =
    useState<DataContextType["playoffProbabilities"]>(null);

  async function callWorker(method: string) {
    return await new Promise((resolve) => {
      const id = idRef.current++;

      const listener = (event: MessageEvent) => {
        if (event.data.id === id) {
          resolve(event.data.result);
          worker.current.removeEventListener("message", listener);
        }
      };

      worker.current.addEventListener("message", listener);

      worker.current.postMessage({ id, season: 2025, method });
    });
  }

  useEffect(() => {
    callWorker("getSchedule").then((result) => {
      setSchedule(result.schedule);
      setScheduleWithByes(result.scheduleWithByes);
      setRatings(result.ratings);
    });
    callWorker("getSeeding").then((result) => setSeeding(result));
    callWorker("calculatePlayoffProbability").then((result) =>
      setPlayoffProbabilities(result)
    );
  }, []);

  return (
    <DataContext.Provider
      value={{
        schedule,
        scheduleWithByes,
        ratings,
        seeding,
        playoffProbabilities,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
