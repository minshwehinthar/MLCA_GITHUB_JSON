import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-burgundy text-white",
        gold: "border-gold/30 bg-gold/15 text-[#7a5a16]",
        outline: "border-burgundy/20 text-burgundy",
        secondary: "border-transparent bg-cream-dark text-burgundy",
        success: "border-emerald-200 bg-emerald-100 text-emerald-800",
        warning: "border-amber-200 bg-amber-100 text-amber-800",
        info: "border-sky-200 bg-sky-100 text-sky-800",
        danger: "border-red-200 bg-red-100 text-red-700",
        muted: "border-stone-200 bg-stone-100 text-stone-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
