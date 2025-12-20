import { useContext } from "react";
import { DataContext } from "../worker";
import { TEAM_MAP, WeekResult } from "@nfl-probabilities/core";
import {
  Flex,
  Text,
  Badge,
  TableRoot,
  TableHeader,
  TableCaption,
  TableRow,
  TableColumnHeader,
  TableCell,
  TableBody,
} from "@chakra-ui/react";

export const PowerRanking = () => {
  const { ratings, schedule } = useContext(DataContext);

  return (
    <Flex direction="column" flexGrow={1}>
      <TableRoot variant="outline">
        <TableCaption />
        <TableHeader>
          <TableRow>
            <TableColumnHeader>Team</TableColumnHeader>
            <TableColumnHeader>ELO</TableColumnHeader>
            <TableColumnHeader>Record</TableColumnHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(ratings ?? {})
            .sort(([_teamA, ratingA], [_teamB, ratingB]) => ratingB - ratingA)
            .map(([team, rating]) => {
              const { name } = TEAM_MAP[team]!;

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
                    <Text>{name}</Text>
                  </TableCell>
                  <TableCell>{rating.toFixed(2)}</TableCell>
                  <TableCell>
                    {wins}-{losses}-{draws}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </TableRoot>
    </Flex>
  );
};
