import { useContext } from "react";
import { DataContext } from "../worker";
import { WeekResult } from "@nfl-probabilities/core";
import {
  Flex,
  TableRoot,
  TableHeader,
  TableCaption,
  TableRow,
  TableColumnHeader,
  TableCell,
  TableBody,
} from "@chakra-ui/react";
import { TeamLink } from "./TeamLink";

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
            .sort(([_teamA, ratingA], [_teamB, ratingB]) => ratingB.current - ratingA.current)
            .map(([team, rating]) => {
  
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
                    <TeamLink team={team} />
                  </TableCell>
                  <TableCell>{rating.current.toFixed(2)}</TableCell>
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
