import { cn } from "@/lib/utils";
import { TransactionDataType } from "@/services/transactions";

interface TransactionListProps {
  transaction: TransactionDataType;
}

export default function TransactionItem({
  transaction: { amount, name, timestamp, type },
}: TransactionListProps) {
  const floatAmount = parseFloat(amount);
  const isPositive = floatAmount > 0;
  const formattedAmount = Math.abs(floatAmount);
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <div className={cn("size-10 rounded bg-gray-200 p-2")}></div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className="text-xs font-medium capitalize text-gray-500">{type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold text-primary")}>
          {isPositive ? "+" : "-"}${formattedAmount}
        </p>
        <p className="text-xs text-gray-500">{formattedTime}</p>
      </div>
    </div>
  );
}
