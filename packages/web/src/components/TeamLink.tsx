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
    <ChakraLink
      asChild
      as={RouterLink}
      color="blue.500"
      _hover={{ textDecoration: "underline" }}
    >
      <RouterLink to={`/team/${team}`}>
        <Text as="span" fontWeight="medium">
          {children ?? name}
        </Text>
      </RouterLink>
    </ChakraLink>
  );
}
