import {
  createListCollection,
  Flex,
  Heading,
  Select,
  HStack,
  Link as ChakraLink,
  Text,
  type SelectValueChangeDetails,
} from "@chakra-ui/react";
import { useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { DataContext } from "../worker";

export const Header = () => {
  const { setSeason } = useContext(DataContext);

  const seasons = createListCollection({
    items: [
      { label: "2025", value: 2025 },
      { label: "2024", value: 2024 },
      { label: "2023", value: 2023 },
    ],
  });

  const onSeasonChange = (
    details: SelectValueChangeDetails<{ label: string; value: number }>
  ) => {
    setSeason(details.value);
  };

  return (
    <Flex
      as="header"
      flexShrink="0"
      direction="row"
      justifyContent="space-between"
      width="100%"
      pt={0}
      pb={4}
    >
      <HStack gap={6} alignItems="center">
        <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
          <Heading as="h1" size="3xl">
            NFL Probabilities
          </Heading>
        </ChakraLink>

        <NavLinks />
      </HStack>
      <Flex>
        <Select.Root
          collection={seasons}
          defaultValue={[seasons.items[0]!.value]}
          onValueChange={onSeasonChange}
        >
          <Select.HiddenSelect />
          <Select.Label />

          <Select.Control minW="8ch">
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content>
              {seasons.items.map((season) => (
                <Select.Item item={season} key={season.value}>
                  {season.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Flex>
    </Flex>
  );
};

function NavLinks() {
  const location = useLocation();
  const links = [
    { to: "/conference", label: "Conference" },
    { to: "/division", label: "Division" },
    { to: "/powerranking", label: "Power Ranking" },
  ];

  return (
    <HStack gap={4}>
      {links.map((link) => {
        const isActive = location.pathname.startsWith(link.to);
        return (
          <ChakraLink
            key={link.to}
            as={RouterLink}
            to={link.to}
            color={isActive ? "blue.600" : "gray.700"}
            fontWeight={isActive ? "semibold" : "normal"}
          >
            <Text>{link.label}</Text>
          </ChakraLink>
        );
      })}
    </HStack>
  );
}
