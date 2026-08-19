import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  hoverable?: boolean;
}

export function Card({
  className,
  selected,
  hoverable = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 bg-white p-5 transition-all duration-200",
        hoverable && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
        selected
          ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-500/10"
          : "border-gray-100 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
