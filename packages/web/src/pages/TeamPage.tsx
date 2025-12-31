import React from "react";
import { useContext } from "react";
import {
  Box,
  Heading,
  TableRoot,
  TableHeader,
  TableRow,
  TableColumnHeader,
  TableBody,
  TableCell,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { DataContext } from "../worker";
import { TEAM_MAP, WeekResult } from "@nfl-probabilities/core";
import TeamLink from "../components/TeamLink";
import { useParams } from "react-router-dom";

export function TeamPage() {
  const { team } = useParams();
  const { schedule } = useContext(DataContext);

  if (team === undefined || !(team in TEAM_MAP)) {
    return null;
  }

  const teamInfo = TEAM_MAP[team]!;
  const weeks = schedule?.[team] ?? [];

  return (
    <Box>
      <HStack mb={4}>
        <Heading size="lg">{teamInfo.name}</Heading>
        <Badge>{teamInfo.division}</Badge>
      </HStack>

      <Box borderWidth={1} borderRadius="md" overflow="hidden">
        <TableRoot variant="outline">
          <TableHeader>
            <TableRow>
              <TableColumnHeader>Opponent</TableColumnHeader>
              <TableColumnHeader>Result</TableColumnHeader>
              <TableColumnHeader>Score</TableColumnHeader>
              <TableColumnHeader>Margin</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week, idx) => {
              const { result, homeScore, awayScore, away, opponent } = week;
              const isWin = result === WeekResult.Win;
              const isLoss = result === WeekResult.Loss;
              const isDraw = result === WeekResult.Draw;

              const resultColor = isWin
                ? "green.600"
                : isLoss
                ? "red.600"
                : isDraw
                ? "yellow.600"
                : "gray.500";

              const teamScore = away ? awayScore : homeScore;
              const opponentScore = away ? homeScore : awayScore;

              const margin =
                teamScore !== undefined &&
                opponentScore !== undefined &&
                teamScore - opponentScore;

              return (
                <TableRow key={idx}>
                  <TableCell>
                    {away && "@ "}
                    <TeamLink team={opponent} />
                  </TableCell>
                  <TableCell>
                    <Text color={resultColor} fontWeight="semibold">
                      {result === null
                        ? "TBD"
                        : isWin
                        ? "W"
                        : isLoss
                        ? "L"
                        : "D"}
                    </Text>
                  </TableCell>
                  <TableCell>
                    {teamScore !== null && opponentScore !== null
                      ? `${teamScore}-${opponentScore}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Text color={resultColor} fontWeight="semibold">
                      {margin ? (margin > 0 ? `+${margin}` : margin) : "-"}
                    </Text>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableRoot>
      </Box>
    </Box>
  );
}
