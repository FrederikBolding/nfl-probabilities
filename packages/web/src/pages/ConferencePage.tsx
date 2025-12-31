import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { ConferenceTable } from "../components";
import { Conference } from "@nfl-probabilities/core";

export function ConferencePage() {
  return (
    <Box>
      <Flex direction="row" gap={4}>
        <ConferenceTable conference={Conference.AFC} />
        <ConferenceTable conference={Conference.NFC} />
      </Flex>
    </Box>
  );
}
