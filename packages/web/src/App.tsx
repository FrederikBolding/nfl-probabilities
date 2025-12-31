import React from "react";
import { TeamPage, ConferencePage, DivisionPage, PowerRankingPage } from "./pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Header } from "./components/Header";

export default function App() {
  return (
    <Box pt={0} px={4} pb={4}>
      <Header />
      <Routes>
        <Route path="/" element={<ConferencePage />} />
        <Route path="/conference" element={<ConferencePage />} />
        <Route path="/division" element={<DivisionPage />} />
        <Route path="/powerranking" element={<PowerRankingPage />} />
        <Route path="/team/:team" element={<TeamPage />} />
      </Routes>
    </Box>
  );
}
