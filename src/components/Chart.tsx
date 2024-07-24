"use client";

import { Area, AreaChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  CustomChartTooltipContent,
} from "@/components/ui/chart";
import { AggregateDataType } from "@/services/transactions";
import { useMemo } from "react";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  aggregateData: AggregateDataType[];
};

const BASE_VALUE_CONSTANT = 0.95;

const processData = (data: AggregateDataType[]) => {
  const minIncome = Math.min(...data.map((d) => d.income));
  const minExpense = Math.min(...data.map((d) => d.expense));
  const baseValue = Math.floor(
    Math.min(minIncome, minExpense) * BASE_VALUE_CONSTANT,
  );

  return data.map((d) => ({
    ...d,
    income: Math.floor(d.income - baseValue),
    expense: Math.floor(d.expense - baseValue),
    baseValue,
  }));
};

export function Chart({ aggregateData }: Props) {
  const processedData = useMemo(
    () => processData(aggregateData),
    [aggregateData],
  );

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={processedData}
        margin={{
          left: 2,
          right: 2,
        }}
      >
        <ChartTooltip cursor={false} content={<CustomChartTooltipContent />} />
        <ChartLegend
          className="py-2"
          content={<ChartLegendContent />}
          verticalAlign={"top"}
        />
        <defs>
          <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="10%"
              stopColor="var(--color-income)"
              stopOpacity={0.2}
            />
            <stop
              offset="95%"
              stopColor="var(--color-income)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="50%"
              stopColor="var(--color-expense)"
              stopOpacity={0.7}
            />
            <stop
              offset="90%"
              stopColor="var(--color-expense)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="income"
          type="natural"
          fill="url(#fillIncome)"
          fillOpacity={0.4}
          stroke="var(--color-income)"
          strokeWidth={2}
        />
        <Area
          dataKey="expense"
          type="natural"
          fill="url(#fillExpense)"
          fillOpacity={0.4}
          stroke="var(--color-expense)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
