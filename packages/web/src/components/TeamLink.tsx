import { useContext } from "react";
import { Badge, Link as ChakraLink, Flex, Text } from "@chakra-ui/react";
import { Conference, TEAM_MAP } from "@nfl-probabilities/core";
import { Link as RouterLink } from "react-router-dom";
import { DataContext } from "../worker";

export function TeamLink({
  team,
  showFullName,
  showPlayoffStatus,
}: {
  team: string;
  showFullName?: boolean | undefined;
  showPlayoffStatus?: boolean | undefined;
}) {
  const { seeding } = useContext(DataContext);
  const { name, conference } = TEAM_MAP[team]!;

  const teamName = showFullName ? name : name.split(" ").at(-1);

  const conferenceSeeding =
    conference === Conference.AFC ? seeding?.afc : seeding?.nfc;
  const isEliminated = conferenceSeeding?.eliminatedTeams.includes(team);
  const isClinched = conferenceSeeding?.clinchedTeams.includes(team);

  return (
    <Flex alignItems="center" gap={1}>
      <ChakraLink
        asChild
        as={RouterLink}
        color="blue.500"
        _hover={{ textDecoration: "underline" }}
      >
        <RouterLink to={`/team/${team}`}>
          <Text as="span" fontWeight="medium">
            {teamName}
          </Text>
        </RouterLink>
      </ChakraLink>
      {showPlayoffStatus && isClinched && <Badge colorScheme="green">P</Badge>}
      {showPlayoffStatus && isEliminated && <Badge colorScheme="red">E</Badge>}
    </Flex>
  );
}
