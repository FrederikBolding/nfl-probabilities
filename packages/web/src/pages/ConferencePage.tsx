import React from "react";
import { Box, Flex, Stack } from "@chakra-ui/react";
import { ConferenceTable } from "../components";
import { Conference } from "@nfl-probabilities/core";

export function ConferencePage() {
  return (
    <Box>
      <Stack direction={{ base: "column", md: "row" }}>
        <ConferenceTable conference={Conference.AFC} />
        <ConferenceTable conference={Conference.NFC} />
      </Stack>
    </Box>
  );
}
