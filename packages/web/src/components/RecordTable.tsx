import {
  Conference,
  type ConferenceSeeding,
  type Schedule,
  TEAM_MAP,
  WeekResult,
} from "@nfl-probabilities/core";
import {
  Flex,
  Heading,
  TableCaption,
  TableCell,
  TableHeader,
  TableRoot,
  TableRow,
  TableColumnHeader,
  TableBody,
  Text,
  SkeletonText,
} from "@chakra-ui/react";
import TeamLink from "./TeamLink";
import { useContext } from "react";
import { DataContext } from "../worker";

export const RecordTable = ({
  header,
  teams,
}: {
  header: string;
  teams: string[];
}) => {
  const { schedule, seeding, playoffProbabilities } = useContext(DataContext);

  const sortedTeams = teams.sort((teamA, teamB) => {
    if (
      seeding &&
      TEAM_MAP[teamA]!.conference === TEAM_MAP[teamB]!.conference
    ) {
      const conferenceSeeding =
        TEAM_MAP[teamA]!.conference === Conference.AFC
          ? seeding?.afc
          : seeding?.nfc;
      const aIndex = conferenceSeeding.seeding.indexOf(teamA);
      const bIndex = conferenceSeeding.seeding.indexOf(teamB);
      return aIndex - bIndex;
    }

    // Team record comparison not implemented
    return 1;
  });

  return (
    <Flex
      direction="column"
      flexGrow={1}
      borderWidth={1}
      borderRadius="md"
      overflow="hidden"
    >
      <TableRoot variant="outline">
        <TableCaption />
        <TableHeader>
          <TableRow borderBottom={0}>
            <TableColumnHeader colSpan={3} borderBottom={0}>
              <Heading textAlign="center" size="md">
                {header}
              </Heading>
            </TableColumnHeader>
          </TableRow>
          <TableRow>
            <TableColumnHeader>Team</TableColumnHeader>
            <TableColumnHeader>Record</TableColumnHeader>
            <TableColumnHeader>Playoff %</TableColumnHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTeams.map((team) => {
            const { name, conference } = TEAM_MAP[team]!;
            const conferenceSeeding =
              conference === Conference.AFC ? seeding?.afc : seeding?.nfc;
            const isEliminated =
              conferenceSeeding?.eliminatedTeams.includes(team);
            const isClinched = conferenceSeeding?.clinchedTeams.includes(team);

            const tag = isClinched ? "(P)" : isEliminated ? "(E)" : "";
            const playoffProbability = playoffProbabilities?.[team];

            const weeks = schedule?.[team];
            const wins = weeks?.filter(
              (week) => week?.result === WeekResult.Win
            ).length;
            const losses = weeks?.filter(
              (week) => week?.result === WeekResult.Loss
            ).length;
            const draws = weeks?.filter(
              (week) => week?.result === WeekResult.Draw
            ).length;

            return (
              <TableRow key={team}>
                <TableCell>
                  <TeamLink team={team}>
                    {name} {tag}
                  </TeamLink>
                </TableCell>
                <TableCell>
                  {wins}-{losses}-{draws}
                </TableCell>
                <TableCell>
                  {playoffProbability !== undefined ? (
                    <Text>
                      {isEliminated || playoffProbability > 1
                        ? !isClinched && playoffProbability > 99
                          ? ">99"
                          : playoffProbability.toFixed(0)
                        : "<1"}
                      %
                    </Text>
                  ) : (
                    <SkeletonText noOfLines={1} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableRoot>
    </Flex>
  );
};
