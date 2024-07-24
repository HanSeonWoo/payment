import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TransactionDataType, TransactionType } from "@/services/transactions";

export const maxDuration = 60;

interface Client {
  controller: ReadableStreamDefaultController;
  lastKnownTransaction: TransactionDataType | null;
}
let clients = new Map<string, Client>();

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
    const clientId = searchParams.get("clientId"); // 클라이언트 ID를 쿼리 파라미터로 받음

    console.log("가자아", searchParams);

    if (searchParams.get("sse") === "true" && clientId) {
      console.log("get if문 안에 들어옴.");
      const stream = new ReadableStream({
        start(controller) {
          clients.set(clientId, { controller, lastKnownTransaction: null });
          request.signal.addEventListener("abort", () => {
            clients.delete(clientId);
          });
        },
      });
      console.log("🚀 ~ GET ~ stream:", stream);

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
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

async function checkAndNotifyClients() {
  console.group("checkAndNotifyClients Group");
  console.log("checkAndNotifyClients start");
  const transactions = await readTransactions();
  const recentTransactions = getRecentTransactions(transactions, "All", 10);
  console.log(
    "recentTransactions",
    recentTransactions ? recentTransactions[0] : "",
  );

  if (recentTransactions.length > 0) {
    const mostRecentTransaction = recentTransactions[0];

    clients.forEach((client, clientId) => {
      console.log("clientId : ", clientId);
      if (
        !client.lastKnownTransaction ||
        new Date(mostRecentTransaction.timestamp) >
          new Date(client.lastKnownTransaction.timestamp)
      ) {
        // 이 클라이언트에 대해 새로운 거래가 있음
        client.lastKnownTransaction = mostRecentTransaction;
        client.controller.enqueue(
          `data: ${JSON.stringify({ hasNewData: true })}\n\n`,
        );

        console.log(`New transaction detected for client ${clientId}`);
      } else {
        console.log(`No new transactions for client ${clientId}`);
      }
    });
  }
  console.groupEnd();
}

setInterval(async () => {
  await checkAndNotifyClients();
}, 60 * 1000); // 1분마다 확인
