import React from "react";
import { Link as ChakraLink, Text } from "@chakra-ui/react";
import { TEAM_MAP } from "@nfl-probabilities/core";
import { Link as RouterLink } from "react-router-dom";

export function TeamLink({
  team,
  children,
}: {
  team: string;
  children?: React.ReactNode;
}) {
  const name = TEAM_MAP[team]?.name ?? team;

  return (
    <ChakraLink as={RouterLink} to={`/team/${team}`} color="blue.400">
      <Text as="span">{children ?? name}</Text>
    </ChakraLink>
  );
}
