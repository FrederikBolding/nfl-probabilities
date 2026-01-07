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
  HStack,
  Flex,
  StatRoot,
  StatLabel,
  StatValueText,
  TableScrollArea,
} from "@chakra-ui/react";
import { DataContext } from "../worker";
import {
  calculateProbability,
  Conference,
  CONFERENCE_PLAYOFF_TEAMS,
  TEAM_MAP,
  WeekResult,
} from "@nfl-probabilities/core";
import { TeamLink, EloChart } from "../components";
import { useParams } from "react-router-dom";

export function TeamPage() {
  const { team } = useParams();
  const { scheduleWithByes, ratings, seeding } = useContext(DataContext);

  if (team === undefined || !(team in TEAM_MAP)) {
    return null;
  }

  const teamInfo = TEAM_MAP[team]!;
  const weeks = scheduleWithByes?.[team] ?? [];
  const rating = ratings?.[team];
  const byeWeek = weeks.findIndex((week) => week === null) + 1;

  const conferenceSeeding =
    teamInfo.conference === Conference.AFC ? seeding?.afc : seeding?.nfc;
  const seed = conferenceSeeding?.seeding.indexOf(team);

  const wins = weeks?.filter((week) => week?.result === WeekResult.Win).length;
  const losses = weeks?.filter(
    (week) => week?.result === WeekResult.Loss
  ).length;
  const draws = weeks?.filter(
    (week) => week?.result === WeekResult.Draw
  ).length;

  return (
    <Flex direction="column" gap={4}>
      <HStack gap={1}>
        <Heading size={{ base: "lg", md: "xl" }}>{teamInfo.name}</Heading>
        <Badge>{teamInfo.division}</Badge>
        {seed !== undefined && seed < CONFERENCE_PLAYOFF_TEAMS && (
          <Badge>
            {teamInfo.conference} #{seed + 1} Seed
          </Badge>
        )}
      </HStack>

      <HStack
        borderWidth={1}
        p={3}
        borderRadius="md"
        overflow="hidden"
        bg="bg.muted"
      >
        <StatRoot>
          <StatLabel>Record</StatLabel>
          <StatValueText>
            {wins}-{losses}-{draws}
          </StatValueText>
        </StatRoot>
        <StatRoot>
          <StatLabel>ELO</StatLabel>
          <StatValueText>{rating?.current.toFixed(2)}</StatValueText>
        </StatRoot>
      </HStack>

      <Box borderWidth={1} p={2} borderRadius="md" overflow="hidden">
        <EloChart team={team} />
      </Box>

      <Box borderWidth={1} borderRadius="md" overflow="hidden">
        <TableScrollArea>
          <TableRoot variant="outline">
            <TableHeader>
              <TableRow>
                <TableColumnHeader>Opponent</TableColumnHeader>
                <TableColumnHeader>Result</TableColumnHeader>
                <TableColumnHeader>Score</TableColumnHeader>
                <TableColumnHeader>Margin</TableColumnHeader>
                <TableColumnHeader>ELO Change</TableColumnHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((week, idx) => {
                const weekNumber = idx + 1;

                if (week === null) {
                  return (
                    <TableRow key={idx}>
                      <TableCell colSpan={5}>Week {weekNumber} Bye</TableCell>
                    </TableRow>
                  );
                }

                const { result, homeScore, awayScore, away, opponent } = week;
                const isWin = result === WeekResult.Win;
                const isLoss = result === WeekResult.Loss;
                const isDraw = result === WeekResult.Draw;
                const isPlayed = result !== null;

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

                const adjustedWeekNumber =
                  weekNumber > byeWeek ? weekNumber - 1 : weekNumber;

                const eloChange =
                  isPlayed && rating
                    ? rating.history[adjustedWeekNumber]! -
                      rating.history[adjustedWeekNumber - 1]!
                    : null;

                const opponentRating = ratings?.[opponent];
                const winProbability =
                  opponentRating &&
                  rating &&
                  calculateProbability(rating.current, opponentRating.current);

                return (
                  <TableRow key={idx}>
                    <TableCell>
                      {away && "@ "}
                      <TeamLink team={opponent} />
                    </TableCell>
                    <TableCell>
                      <Text color={resultColor} fontWeight="semibold">
                        {result === null
                          ? winProbability
                            ? `${(winProbability * 100).toFixed(1)}%`
                            : "TBD"
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
                    <TableCell color={resultColor} fontWeight="semibold">
                      {eloChange !== null &&
                        (eloChange > 0
                          ? `+${eloChange.toFixed(2)}`
                          : eloChange.toFixed(2))}
                      {eloChange === null && "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableRoot>
        </TableScrollArea>
      </Box>
    </Flex>
  );
}
