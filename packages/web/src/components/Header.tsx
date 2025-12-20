import {
  createListCollection,
  Flex,
  Heading,
  Portal,
  Select,
} from "@chakra-ui/react";

export const Header = () => {
  const seasons = createListCollection({
    items: [{ label: "2025", value: "2025" }],
  });

  return (
    <Flex
      as="header"
      flexShrink="0"
      direction="row"
      justifyContent="space-between"
      width="100%"
    >
      <Heading as="h1" size="3xl">
        NFL Probabilities
      </Heading>
      <Flex>
        <Select.Root
          collection={seasons}
          defaultValue={[seasons.items[0]!.value]}
        >
          <Select.HiddenSelect />
          <Select.Label />

          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Portal>
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
          </Portal>
        </Select.Root>
      </Flex>
    </Flex>
  );
};
