import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] hover:bg-primary-hover",
        secondary: "border border-line bg-surface text-fg hover:border-line-strong hover:bg-raised",
        ghost: "text-muted hover:bg-raised hover:text-fg",
        danger: "border border-critical/35 bg-critical-soft text-critical hover:border-critical/60",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-3.5",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (asChild) {
    return <Slot.Root className={classes} {...props} />;
  }
  return <button type={type ?? "button"} className={classes} {...props} />;
}
