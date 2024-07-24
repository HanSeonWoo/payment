import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TransactionDataType, TransactionType } from "@/services/transactions";

async function readTransactions(): Promise<TransactionDataType[]> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "delightlabs-hometest-mockdata-202311-202410.json",
  );
  const fileContents = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContents);
}

function getRecentTransactions(
  transactions: TransactionDataType[],
  type: TransactionType,
  count: number,
): TransactionDataType[] {
  const currentTime = new Date();

  return transactions
    .filter((t) => {
      const transactionTime = new Date(t.timestamp);
      return (
        transactionTime <= currentTime &&
        (type === "All" ||
          (type === "Income"
            ? parseFloat(t.amount) > 0
            : parseFloat(t.amount) < 0))
      );
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, count);
}

export async function GET(request: NextRequest) {
  try {
    const transactions = await readTransactions();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as TransactionType;
    const count = parseInt(searchParams.get("count") || "10");

    const recentTransactions = getRecentTransactions(transactions, type, count);
    return NextResponse.json(recentTransactions);
  } catch (error) {
    console.error("Error processing transactions:", error);
    return NextResponse.json(
      { error: "Error processing transactions" },
      { status: 500 },
    );
  }
}
