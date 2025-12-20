import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import { DataProvider } from "./worker/DataContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <DataProvider>
          <App />
        </DataProvider>
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>
);
