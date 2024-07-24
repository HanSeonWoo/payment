import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchRecentTransactions,
  TRANSACTION_TYPES,
  TransactionType,
} from "@/services/transactions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TransactionItem from "./TransactionItem";
import TransactionLoading from "./TransactionLoading";

export default function RecentTransactions() {
  const [transactionType, setTransactionType] = useState<TransactionType>(
    TRANSACTION_TYPES[0],
  );
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recent", transactionType, transactionType === "All" ? 20 : 10],
    queryFn: ({ queryKey }) =>
      fetchRecentTransactions(
        queryKey[1] as TransactionType,
        queryKey[2] as number,
      ),
  });

  return (
    <div className="px-5">
      <div className="p-4">
        <span className="text-md font-bold">Recent Transactions</span>
      </div>

      <Tabs
        defaultValue={TRANSACTION_TYPES[0]}
        className=""
        onValueChange={(type) => setTransactionType(type as TransactionType)}
      >
        <TabsList>
          {TRANSACTION_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
        {isLoading ? (
          <TransactionLoading />
        ) : (
          data?.map((item) => (
            <TransactionItem
              key={`${item.timestamp}${item.name}`}
              transaction={item}
            />
          ))
        )}
      </Tabs>
    </div>
  );
}
