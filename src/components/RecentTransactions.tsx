import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchRecentTransactions,
  TRANSACTION_TYPES,
  TransactionDataType,
  TransactionType,
} from "@/services/transactions";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import TransactionItem from "./TransactionItem";
import TransactionLoading from "./TransactionLoading";
import { useToast } from "@/components/ui/use-toast";

const POLLING_INTERVAL = 60 * 1000; // 60초마다 폴링

export default function RecentTransactions() {
  const [transactionType, setTransactionType] = useState<TransactionType>(
    TRANSACTION_TYPES[0],
  );
  const { toast } = useToast();
  const [usePolling, setUsePolling] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const previousDataRef = useRef<TransactionDataType[] | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recent", transactionType, transactionType === "All" ? 20 : 10],
    queryFn: ({ queryKey }) =>
      fetchRecentTransactions(
        queryKey[1] as TransactionType,
        queryKey[2] as number,
      ),
    refetchInterval: usePolling ? POLLING_INTERVAL : false,
  });

  useEffect(() => {
    if (data && previousDataRef.current) {
      const hasNewData = data.some(
        (newItem) =>
          !previousDataRef.current!.some(
            (oldItem) =>
              oldItem.timestamp === newItem.timestamp &&
              oldItem.name === newItem.name,
          ),
      );

      if (hasNewData) {
        toast({
          title: "새로운 입출금 내역이 있습니다!",
        });
      }
    }
    previousDataRef.current = data || null;
  }, [data, toast]);

  useEffect(() => {
    const clientId =
      localStorage.getItem("clientId") ||
      Math.random().toString(36).substr(2, 9);
    localStorage.setItem("clientId", clientId);

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `/api/transactions/recent?sse=true&clientId=${clientId}`,
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.hasNewData) {
          refetch();
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();
        setUsePolling(true);
      };

      eventSourceRef.current = eventSource;
    };

    if (!usePolling) {
      connectSSE();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [refetch, toast, usePolling]);
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
