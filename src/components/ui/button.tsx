import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-saffron-500/20 hover:bg-saffron-600 active:scale-[0.98]",
        emerald:
          "bg-emerald text-accent-foreground shadow-md shadow-emerald-500/20 hover:bg-emerald-dark active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-input bg-transparent hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        ghost:
          "hover:bg-secondary hover:text-foreground active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 min-h-[48px] px-5 py-2 text-sm font-semibold",
        sm: "h-9 min-h-[36px] px-3 text-xs rounded-md",
        lg: "h-14 min-h-[56px] px-8 text-base font-semibold",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px] p-0 rounded-[10px] [&_svg]:size-5",
        voiceHero: "h-20 w-20 min-h-[80px] min-w-[80px] p-0 rounded-full shadow-xl shadow-saffron-500/30 active:scale-95 [&_svg]:size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
