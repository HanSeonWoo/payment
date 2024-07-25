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
  console.log("Your local time zone is:", localTimeZone);

  console.log("🚀 ~ getDateRange ~ now:", now);
  const localTime = toZonedTime(now, localTimeZone);
  console.log("🚀 ~ getDateRange ~ localTime:", localTime);

  const endDate = endOfDay(subDays(now, 1));
  let startDate: Date;
  if (period === "Week") {
    startDate = startOfDay(subDays(endDate, 6));
  } else if (period === "Month") {
    startDate = startOfDay(subMonths(endDate, 1));
  } else {
    throw new Error("Invalid period");
  }

  return {
    startDate,
    endDate,
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
  console.log("🚀 ~ endDate:", endDate);
  console.log("🚀 ~ startDate:", startDate);

  const dailyAggregates: { [date: string]: AggregateDataType } = {};
  transactions.forEach((transaction) => {
    const transactionDate = toZonedTime(
      new Date(transaction.timestamp),
      TIME_ZONE,
    );

    if (isWithinInterval(transactionDate, { start: startDate, end: endDate })) {
      const date = formatToKSTDate(transactionDate);
      const amount = parseFloat(transaction.amount);

      if (!dailyAggregates[date]) {
        console.log(
          "🚀 ~ transactions.forEach ~ transactionDate:",
          transactionDate,
        );
        console.log("🚀 ~ transactions.forEach ~ date:", date);
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
