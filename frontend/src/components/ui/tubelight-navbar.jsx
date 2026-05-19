import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TubelightNavbar({ items, className }) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        const match = items.find((item) => location.pathname === item.url);
        return match ? match.name : items[0].name;
    });
    const [isMobile, setIsMobile] = useState(false);

    // Sync active tab with route changes (handles browser back/forward)
    useEffect(() => {
        const match = items.find((item) => location.pathname === item.url);
        if (match) setActiveTab(match.name);
    }, [location.pathname, items]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={cn("flex items-center", className)}>
            <div className="flex items-center gap-1 bg-[#27272a]/20 border border-[#27272a] backdrop-blur-md py-1 px-1 rounded-full shadow-lg">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;

                    return (
                        <Link
                            key={item.name}
                            to={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative cursor-pointer text-sm font-semibold px-5 py-2 rounded-full transition-colors duration-200 select-none",
                                "text-[#6366f1] hover:text-[#0ea5e9]",
                                isActive && "text-[#6366f1]"
                            )}
                        >
                            {/* Desktop: text label */}
                            <span className="hidden md:inline relative z-10">{item.name}</span>
                            {/* Mobile: icon only */}
                            <span className="md:hidden relative z-10">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="tubelight-lamp"
                                    className="absolute inset-0 w-full bg-[#0ea5e9]/20 rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 350,
                                        damping: 30,
                                    }}
                                >
                                    {/* Lamp glow effect */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#6366f1] rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-[#6366f1]/20 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-[#6366f1]/15 rounded-full blur-md -top-1" />
                                        <div className="absolute w-4 h-4 bg-[#6366f1]/10 rounded-full blur-sm top-0 left-2" />
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
