import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-burgundy text-white shadow-sm hover:bg-burgundy-700 active:scale-[0.99]",
        gold: "bg-gold text-burgundy-900 shadow-sm hover:bg-gold-light active:scale-[0.99]",
        outline: "border border-burgundy/25 bg-transparent text-burgundy hover:bg-burgundy/5",
        secondary: "bg-cream-dark text-burgundy hover:bg-[#e8e0ce]",
        ghost: "text-burgundy hover:bg-burgundy/5",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-burgundy underline-offset-4 hover:underline",
        white: "bg-white text-burgundy shadow-sm hover:bg-cream",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
