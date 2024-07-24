import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  AggregateDataType,
  AggregateType,
  TransactionDataType,
} from "@/services/transactions";

async function readTransactions(): Promise<TransactionDataType[]> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "delightlabs-hometest-mockdata-202311-202410.json",
  );
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents);
}

function getDateRange(period: AggregateType): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);

  if (period === "Week") {
    // 어제를 포함한 7일
    startDate.setDate(endDate.getDate() - 6);
  } else if (period === "Month") {
    startDate.setMonth(endDate.getMonth() - 1);
    startDate.setDate(startDate.getDate() + 1);
  }
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
}

function formatNumber(num: number): number {
  return Number(num.toFixed(2));
}

function convertToKST(date: Date): Date {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

function formatToKSTDate(date: Date): string {
  const kstDate = convertToKST(date);
  return kstDate.toISOString().split("T")[0];
}

function aggregateTransactions(
  transactions: TransactionDataType[],
  period: AggregateType,
): AggregateDataType[] {
  const { startDate, endDate } = getDateRange(period);

  const dailyAggregates: { [date: string]: AggregateDataType } = {};

  const kstStartDate = convertToKST(startDate);
  const kstEndDate = convertToKST(endDate);

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.timestamp);
    const kstTransactionDate = convertToKST(transactionDate);

    if (
      kstTransactionDate >= kstStartDate &&
      kstTransactionDate <= kstEndDate
    ) {
      const date = formatToKSTDate(transactionDate);
      const amount = parseFloat(transaction.amount);

      if (!dailyAggregates[date]) {
        dailyAggregates[date] = { date, income: 0, expense: 0 };
      }

      if (amount >= 0) {
        dailyAggregates[date].income += amount;
      } else {
        dailyAggregates[date].expense += Math.abs(amount);
      }
    }
  });

  return Object.values(dailyAggregates)
    .map((aggregate) => ({
      ...aggregate,
      income: formatNumber(aggregate.income),
      expense: formatNumber(aggregate.expense),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function GET(request: NextRequest) {
  try {
    const transactions = await readTransactions();
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as AggregateType) || "Month";

    return NextResponse.json(aggregateTransactions(transactions, period));
  } catch (error) {
    console.error("Error processing transactions:", error);
    return NextResponse.json(
      { error: "Error processing transactions" },
      { status: 500 },
    );
  }
}
