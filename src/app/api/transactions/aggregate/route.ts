import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  AggregateDataType,
  AggregateType,
  TransactionDataType,
} from "@/services/transactions";
import {
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  isWithinInterval,
  addHours,
} from "date-fns";
import { formatInTimeZone, getTimezoneOffset, toZonedTime } from "date-fns-tz";

const TIME_ZONE = "Asia/Seoul";

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
  const now = new Date();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = toZonedTime(now, TIME_ZONE);

  const endDate = endOfDay(subDays(localTime, 1));
  let startDate: Date;
  if (period === "Week") {
    startDate = startOfDay(subDays(endDate, 6));
  } else if (period === "Month") {
    startDate = startOfDay(subMonths(endDate, 1));
  } else {
    throw new Error("Invalid period");
  }
  return {
    startDate: localTimeZone === "UTC" ? addHours(startDate, -9) : startDate,
    endDate: localTimeZone === "UTC" ? addHours(endDate, -9) : endDate,
  };
}

function formatNumber(num: number): number {
  return Number(num.toFixed(2));
}

function formatToKSTDate(date: Date): string {
  return formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd");
}

function aggregateTransactions(
  transactions: TransactionDataType[],
  period: AggregateType,
): AggregateDataType[] {
  const { startDate, endDate } = getDateRange(period);

  const dailyAggregates: { [date: string]: AggregateDataType } = {};
  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.timestamp);

    if (isWithinInterval(transactionDate, { start: startDate, end: endDate })) {
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
    .sort((a, b) => a.date.localeCompare(b.date));
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
