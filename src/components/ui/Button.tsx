import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "charcoal" | "light" | "ghost";

export function Button({
  className,
  variant = "charcoal",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "charcoal" &&
          "bg-charcoal text-bone shadow-soft hover:-translate-y-0.5 hover:bg-ink",
        variant === "light" &&
          "border border-charcoal/10 bg-bone text-charcoal hover:-translate-y-0.5 hover:border-charcoal/25",
        variant === "ghost" && "text-charcoal hover:bg-charcoal/5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
