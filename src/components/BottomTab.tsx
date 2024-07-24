import React from "react";
import { cn } from "@/lib/utils";

type BottomTabProps = {
  name: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
};

export default function BottomTab({
  icon: Icon,
  isActive,
  onClick,
}: BottomTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-20 flex-col items-center justify-center",
        "transition-all duration-300 ease-in-out",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={"size-6"} />
      {isActive && <div className="h-1" />}
      <div
        className={cn(
          "absolute bottom-0 h-[5px] w-[38px] rounded-t-xl bg-primary",
          "transition-all duration-300 ease-in-out",
          isActive
            ? "scale-x-100 transform opacity-100"
            : "scale-x-0 transform opacity-0",
        )}
      />
    </button>
  );
}
