import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[#6366f1] to-[#1a3d6d] text-white hover:brightness-110 hover:scale-[1.03] shadow-premium",
                destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
                outline: "border border-[#6366f1] text-[#6366f1] bg-transparent hover:bg-[#6366f1] hover:text-white transition-all",
                secondary: "bg-[#0ea5e9] text-[#6366f1] hover:bg-[#27272a] shadow-sm",
                ghost: "hover:bg-[#27272a]/20 hover:text-[#6366f1]",
                link: "text-[#6366f1] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-9 rounded-md px-4",
                lg: "h-12 rounded-lg px-10 text-base",
                icon: "h-10 w-10 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = "Button";

export { Button, buttonVariants };
