import { AFC_TEAMS, Conference, NFC_TEAMS } from "@nfl-probabilities/core";
import { RecordTable } from "./RecordTable";

export const ConferenceTable = ({ conference }: { conference: Conference }) => {
  const teams = conference === Conference.AFC ? AFC_TEAMS : NFC_TEAMS;

  return <RecordTable header={conference} teams={teams} fullNames />;
};
