import {
  Conference,
  Division,
  INITIAL_ELO,
  TEAM_MAP,
} from "@nfl-probabilities/core";
import { ConferenceTable, DivisionTable } from "./components";
import {
  Flex,
  Heading,
  Box,
  TabsRoot,
  TabsList,
  TabsContent,
  TabsTrigger,
  Text,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { PowerRanking } from "./components/PowerRanking";
import { Header } from "./components/Header";

function App() {
  return (
    <Box paddingX={4} pb={4}>
      <Header />
      <TabsRoot defaultValue="conference">
        <TabsList>
          <TabsTrigger value="conference">Conference</TabsTrigger>
          <TabsTrigger value="division">Division</TabsTrigger>
          <TabsTrigger value="powerranking">Power Ranking</TabsTrigger>
        </TabsList>
        <TabsContent value="conference">
          <Box>
            <Flex direction="row" gap={4}>
              <ConferenceTable conference={Conference.AFC} />
              <ConferenceTable conference={Conference.NFC} />
            </Flex>
          </Box>
        </TabsContent>
        <TabsContent value="division">
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
        </TabsContent>
        <TabsContent value="powerranking">
          <Box>
            <PowerRanking />
          </Box>
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}

export default App;
