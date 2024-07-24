import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { page = 1, limit = 50 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const filePath = path.join(process.cwd(), "data", "transactions.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const transactions = JSON.parse(fileContents);

  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = pageNumber * limitNumber;

  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  res.status(200).json({
    data: paginatedTransactions,
    totalCount: transactions.length,
    page: pageNumber,
    limit: limitNumber,
  });
}
