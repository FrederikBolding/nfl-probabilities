import React from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import { DivisionTable } from "../components";
import { Division } from "@nfl-probabilities/core";

export function DivisionPage() {
  return (
    <Box>
      <SimpleGrid minChildWidth="300px" gap={4}>
        <DivisionTable division={Division.AFC_North} />
        <DivisionTable division={Division.AFC_East} />
        <DivisionTable division={Division.AFC_West} />
        <DivisionTable division={Division.AFC_South} />

        <DivisionTable division={Division.NFC_North} />
        <DivisionTable division={Division.NFC_East} />
        <DivisionTable division={Division.NFC_West} />
        <DivisionTable division={Division.NFC_South} />
      </SimpleGrid>
    </Box>
  );
}
