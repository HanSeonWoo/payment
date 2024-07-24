import { BellIcon } from "@heroicons/react/24/outline";
import RecentTransactions from "../RecentTransactions";
import TransactionChart from "../TransactionChart";

export default function ChartTab() {
  return (
    <div className="">
      <div className="flex justify-between p-5">
        <h1 className="text-xl font-bold">Transactions</h1>
        <BellIcon className="size-6" />
      </div>

      <TransactionChart />

      <RecentTransactions />
    </div>
  );
}
