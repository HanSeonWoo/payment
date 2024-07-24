"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface TextSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  leftLabel?: string;
  rightLabel?: string;
}

const TextSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  TextSwitchProps
>(({ className, leftLabel, rightLabel, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className="pointer-events-none absolute block h-full w-[calc(50%)] rounded-full bg-primary shadow-lg ring-0 transition-transform duration-200 data-[state=checked]:translate-x-[calc(100%)] data-[state=unchecked]:translate-x-0" />
    <div className="z-10 flex">
      <span
        className={cn(
          "px-4 py-2 text-sm font-bold transition-colors duration-200",
          props.checked
            ? "text-secondary-foreground"
            : "text-primary-foreground",
        )}
      >
        {leftLabel}
      </span>
      <span
        className={cn(
          "px-4 py-2 text-sm font-bold transition-colors duration-200",
          !props.checked
            ? "text-secondary-foreground"
            : "text-primary-foreground",
        )}
      >
        {rightLabel}
      </span>
    </div>
  </SwitchPrimitives.Root>
));
TextSwitch.displayName = SwitchPrimitives.Root.displayName;

export { TextSwitch };
