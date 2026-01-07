import React from "react";
import {
  TeamPage,
  ConferencePage,
  DivisionPage,
  PowerRankingPage,
} from "./pages";
import { Routes, Route } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { Header } from "./components/Header";

export default function App() {
  return (
    <Flex
      px={4}
      py={4}
      flexDirection="column"
      height="100vh"
      position="relative"
    >
      <Header />
      <Flex as="main" flexDirection="column" mt={{ base: "64px", md: 12 }} pb={4}>
        <Routes>
          <Route path="/" element={<ConferencePage />} />
          <Route path="/conference" element={<ConferencePage />} />
          <Route path="/division" element={<DivisionPage />} />
          <Route path="/powerranking" element={<PowerRankingPage />} />
          <Route path="/team/:team" element={<TeamPage />} />
        </Routes>
      </Flex>
    </Flex>
  );
}
