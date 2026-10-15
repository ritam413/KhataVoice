"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium rounded-lg px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground rounded-lg px-3 py-1.5",
          success: "group-[.toaster]:border-emerald/40 group-[.toaster]:text-emerald-300",
          error: "group-[.toaster]:border-destructive/40 group-[.toaster]:text-red-300",
          warning: "group-[.toaster]:border-amber-500/40 group-[.toaster]:text-amber-300",
          info: "group-[.toaster]:border-blue-500/40 group-[.toaster]:text-blue-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
