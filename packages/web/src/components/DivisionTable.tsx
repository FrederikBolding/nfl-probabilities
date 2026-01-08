import { Division, DIVISION_MAP } from "@nfl-probabilities/core";
import { RecordTable } from "./RecordTable";

export const DivisionTable = ({ division }: { division: Division }) => {
  const teams = DIVISION_MAP[division];

  return <RecordTable header={division} teams={teams} />;
};
