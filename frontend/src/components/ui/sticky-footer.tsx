"use client"
import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Link } from "react-router-dom"
import {
    Facebook,
    Instagram,
    Twitter,
    Dribbble,
    Globe,
    ArrowUpRight
} from "lucide-react"

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            staggerChildren: 0.1,
        },
    },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
}

const linkVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
}

const socialVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 10,
        },
    },
}

const backgroundVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 2,
            ease: "linear",
        },
    },
}

const footerData = {
    sections: [
        {
            title: "About Us",
            links: [
                { label: "Our Story", href: "/about" },
                { label: "Mission & Vision", href: "/about" },
                { label: "Tech Stack", href: "/about" },
                { label: "Careers", href: "#" }
            ]
        },
        {
            title: "Support",
            links: [
                { label: "Contact Us", href: "/contact" },
                { label: "Shipping Info", href: "#" },
                { label: "Returns Policy", href: "#" },
                { label: "FAQs", href: "#" }
            ]
        },
        {
            title: "Quick Links",
            links: [
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "Deals", href: "/deals" },
                { label: "Cart", href: "/cart" }
            ]
        },
        {
            title: "Contact",
            links: [
                { label: "+91 6353808435", href: "tel:+916353808435" },
                { label: "obsidiantech.1@gmail.com", href: "mailto:obsidiantech.1@gmail.com" },
                { label: "Surat, Gujarat, India", href: "#" }
            ]
        },
    ],
    social: [
        { href: "#", label: "Facebook", icon: <Facebook size={18} /> },
        { href: "#", label: "Instagram", icon: <Instagram size={18} /> },
        { href: "#", label: "Twitter", icon: <Twitter size={18} /> },
        { href: "#", label: "LinkedIn", icon: <ArrowUpRight size={18} /> },
    ],
    title: "OBSIDIAN TECH",
    subtitle: "Premium Smart Hub Ecosystem",
    copyright: `©${new Date().getFullYear()} OBSIDIAN TECH. All rights reserved.`,
}

const NavSection = ({ title, links, index }: { title: string; links: any[]; index: number }) => (
    <motion.div variants={itemVariants} custom={index} className="flex flex-col gap-3">
        <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className="mb-4 uppercase text-zinc-400 text-xs font-bold tracking-[0.2em] border-b border-zinc-800 pb-2"
        >
            {title}
        </motion.h3>
        {links.map((link, linkIndex) => (
            <motion.div
                key={linkIndex}
                variants={linkVariants}
                custom={linkIndex}
            >
                <Link
                    to={link.href}
                    className="text-zinc-400 hover:text-cyan-400 transition-all duration-300 font-sans text-sm block group relative w-fit"
                >
                    <span className="relative flex items-center gap-1">
                        {link.label}
                        <motion.span
                            className="absolute bottom-0 left-0 h-[1px] bg-cyan-400"
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                        />
                    </span>
                </Link>
            </motion.div>
        ))}
    </motion.div>
)

const SocialLink = ({ href, label, icon, index }: { href: string; label: string; icon: React.ReactNode; index: number }) => (
    <motion.a
        variants={socialVariants}
        custom={index}
        href={href}
        whileHover={{
            scale: 1.15,
            rotate: 8,
            transition: { type: "spring", stiffness: 300, damping: 15 },
        }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-cyan-400 flex items-center justify-center transition-all duration-300 group shadow-sm"
        aria-label={label}
    >
        <motion.span
            className="text-zinc-300 group-hover:text-black"
            whileHover={{ scale: 1.1 }}
        >
            {icon}
        </motion.span>
    </motion.a>
)

export default function StickyFooter() {
    return (
        <div
            className="relative h-[80vh] md:h-[70vh] w-full"
            style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
        >
            <div className="relative h-[calc(100vh+80vh)] md:h-[calc(100vh+70vh)] -top-[100vh]">
                <div className="h-[80vh] md:h-[70vh] sticky top-[calc(100vh-80vh)] md:top-[calc(100vh-70vh)]">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="bg-[#09090b] py-12 px-6 md:px-16 lg:px-24 h-full w-full flex flex-col justify-between relative overflow-hidden border-t border-zinc-800"
                    >
                        {/* Animated Background Blobs */}
                        <motion.div
                            variants={backgroundVariants}
                            className="absolute -top-24 -right-24 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-[80px]"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3],
                                x: [0, 20, 0],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        <motion.div
                            variants={backgroundVariants}
                            className="absolute -bottom-24 -left-24 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/10 rounded-full blur-[80px]"
                            animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.2, 0.4, 0.2],
                                y: [0, -30, 0],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1,
                            }}
                        />

                        {/* Top Section: Navigation */}
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
                            {footerData.sections.map((section, index) => (
                                <NavSection key={section.title} title={section.title} links={section.links} index={index} />
                            ))}
                        </div>

                        {/* Bottom Section: Brand & Legacy */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-8 mt-12">
                            <div className="flex-1">
                                <motion.div
                                    className="flex items-center gap-4 mb-2"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                >

                                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none">
                                        {footerData.title}
                                    </h1>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    whileInView={{ opacity: 1, width: "auto" }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                    className="flex items-center gap-4 mt-2"
                                >
                                    <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500" />
                                    <p className="text-zinc-400 text-sm md:text-base font-medium tracking-wide">
                                        {footerData.subtitle}
                                    </p>
                                </motion.div>
                            </div>

                            <div className="flex flex-col md:items-end gap-6">
                                <div className="flex gap-4">
                                    {footerData.social.map((social, index) => (
                                        <SocialLink
                                            key={social.label}
                                            href={social.href}
                                            label={social.label}
                                            icon={social.icon}
                                            index={index}
                                        />
                                    ))}
                                </div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.5 }}
                                    className="text-zinc-500 text-xs md:text-sm font-medium"
                                >
                                    {footerData.copyright}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
