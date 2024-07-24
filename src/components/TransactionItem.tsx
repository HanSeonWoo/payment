import { cn } from "@/lib/utils";
import { TransactionDataType } from "@/services/transactions";
import { memo, useEffect, useState } from "react";

interface TransactionListProps {
  transaction: TransactionDataType;
}

function TransactionItem({
  transaction: { amount, name, timestamp, type },
}: TransactionListProps) {
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), 200);
    return () => clearTimeout(timer);
  }, []);

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
    <div
      className={`transition-all duration-500 ease-in-out ${
        animate
          ? "-translate-y-2 bg-yellow-100"
          : "translate-y-0 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className={cn("size-10 rounded bg-gray-200 p-2")}></div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{name}</p>
            <p className="text-xs font-medium capitalize text-gray-500">
              {type}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-bold text-primary")}>
            {isPositive ? "+" : "-"}${formattedAmount}
          </p>
          <p className="text-xs text-gray-500">{formattedTime}</p>
        </div>
      </div>
    </div>
  );
}

export default memo(TransactionItem, (prevProps, nextProps) => {
  return (
    prevProps.transaction.name === nextProps.transaction.name &&
    prevProps.transaction.timestamp === nextProps.transaction.timestamp
  );
});
