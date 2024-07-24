export const TRANSACTION_TYPES = ["All", "Expense", "Income"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type TransactionDataType = {
  amount: string;
  name: string;
  timestamp: string;
  type: string;
};

export const fetchRecentTransactions = async (
  type: TransactionType = "All",
  count: number = 10,
): Promise<TransactionDataType[]> => {
  const response = await fetch(
    `/api/transactions/recent?type=${type}&count=${count}`,
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};

export const AGGREGATE_TYPES = ["Week", "Month"] as const;
export type AggregateType = (typeof AGGREGATE_TYPES)[number];

export type AggregateDataType = {
  date: string;
  income: number;
  expense: number;
};

export async function fetchAggregateTransactions(
  period: AggregateType = "Month",
): Promise<AggregateDataType[]> {
  try {
    const response = await fetch(
      `/api/transactions/aggregate?period=${period}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AggregateDataType[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch aggregate transactions:", error);
    throw error;
  }
}
