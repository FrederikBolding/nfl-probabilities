import { useContext } from "react";
import { DataContext } from "../worker";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { INITIAL_ELO } from "@nfl-probabilities/core";

export function EloChart({ team }: { team: string }) {
  const { ratings } = useContext(DataContext);
  const rating = ratings?.[team];

  const chart = useChart({
    data:
      rating?.history.map((elo, index) => ({
        elo,
        week: `Week ${index + 1}`,
      })) ?? [],
    series: [{ name: "elo", label: "ELO" }],
  });

  return (
    <Chart.Root maxH="sm" chart={chart}>
      <LineChart data={chart.data}>
        <CartesianGrid
          stroke={chart.color("border")}
          vertical={false}
          opacity={0.5}
        />
        <XAxis
          axisLine={false}
          dataKey={chart.key("week")}
          stroke={chart.color("border")}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          width={40}
          stroke={chart.color("border")}
          domain={["dataMin - 50", "dataMax + 50"]}
          tickFormatter={(value) => value.toFixed(0)}
        />
        <ReferenceLine y={INITIAL_ELO} strokeDasharray="5 5" />
        <Tooltip
          animationDuration={100}
          cursor={false}
          content={<Chart.Tooltip />}
        />
        {chart.series.map((item) => (
          <Line
            type="natural"
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            stroke={chart.color(item.color)}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </Chart.Root>
  );
}
