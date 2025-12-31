import React from "react";
import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import { DivisionTable } from "../components";
import { Division } from "@nfl-probabilities/core";

export function DivisionPage() {
  return (
    <Box>
      <Flex direction="row" gap={4}>
        <SimpleGrid gap={4} columns={2}>
          <DivisionTable division={Division.AFC_North} />
          <DivisionTable division={Division.AFC_East} />
          <DivisionTable division={Division.AFC_West} />
          <DivisionTable division={Division.AFC_South} />
        </SimpleGrid>
        <SimpleGrid gap={4} columns={2}>
          <DivisionTable division={Division.NFC_North} />
          <DivisionTable division={Division.NFC_East} />
          <DivisionTable division={Division.NFC_West} />
          <DivisionTable division={Division.NFC_South} />
        </SimpleGrid>
      </Flex>
    </Box>
  );
}
