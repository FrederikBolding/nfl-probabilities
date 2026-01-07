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
    setSeason(details.value[0] as unknown as number);
  };

  return (
    <Flex
      as="header"
      flexShrink={0}
      direction="row"
      pt={2}
      pb={2}
      px={4}
      backdropFilter="blur(1.25rem)"
      position="fixed"
      top="0"
      left="0"
      width="100%"
      zIndex="sticky"
    >
      <HStack gap={4} alignItems="center">
        <ChakraLink asChild _hover={{ textDecoration: "none" }}>
          <RouterLink to="/">
            <Heading as="h1" size={{ base: "lg", md: "2xl" }}>
              NFL Probabilities
            </Heading>
          </RouterLink>
        </ChakraLink>

        <NavLinks />
      </HStack>

      <Flex ml="auto" alignItems="center">
        <Select.Root
          gap={0}
          collection={seasons}
          // @ts-expect-error The types here are wrong.
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
    { to: "/", label: "Conference" },
    { to: "/division", label: "Division" },
    { to: "/powerranking", label: "Power Ranking" },
  ];

  return (
    <HStack gap={4}>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <ChakraLink
            key={link.to}
            asChild
            as={RouterLink}
            color={isActive ? "blue.500" : "gray.600"}
            fontWeight={isActive ? "semibold" : "medium"}
            _hover={{
              textDecor: "none",
              color: isActive ? undefined : "gray.700",
            }}
          >
            <RouterLink to={link.to}>
              <Text fontSize={{ base: "sm", md: "md" }}>{link.label}</Text>
            </RouterLink>
          </ChakraLink>
        );
      })}
    </HStack>
  );
}
