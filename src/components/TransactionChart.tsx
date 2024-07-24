import {
  AGGREGATE_TYPES,
  AggregateType,
  fetchAggregateTransactions,
} from "@/services/transactions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Chart } from "./Chart";
import { TextSwitch } from "./ui/text-switch";

export default function TransactionChart() {
  const [period, setPeriod] = useState<AggregateType>(AGGREGATE_TYPES[0]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["aggregate", period],
    queryFn: ({ queryKey }) =>
      fetchAggregateTransactions(queryKey[1] as AggregateType),
  });

  return (
    <div className="px-5">
      <TextSwitch
        checked={period === AGGREGATE_TYPES[1]}
        onCheckedChange={() =>
          setPeriod((prev) => (prev === "Week" ? "Month" : "Week"))
        }
        leftLabel={AGGREGATE_TYPES[0]}
        rightLabel={AGGREGATE_TYPES[1]}
      />
      <Chart aggregateData={data || []} />
    </div>
  );
}
