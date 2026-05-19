import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { ProgressiveBlur } from "./progressive-blur";
import { TimelineContent } from "./timeline-animation";

// Use the existing heroItems but map them to match the new component's layout
const blocksDesign = [
  {
    id: "iphone-16",
    name: "iPhone 16 Pro Max",
    url: "/product/b82a3b04-a90b-48c9-8d7b-99d985db6e01",
    des: "Apple",
    imgSrc: "/images/phones/apple-iphone-16-pro-max.jpg",
  },
  {
    id: "s25-ultra",
    name: "Galaxy S25 Ultra",
    url: "/product/b82a3b04-a90b-48c9-8d7b-99d985db6e02",
    des: "Samsung",
    imgSrc: "/images/phones/samsung-galaxy-s25-ultra-sm-s938.jpg",
  },
  {
    id: "pixel-9",
    name: "Pixel 9 Pro",
    url: "/product/b82a3b04-a90b-48c9-8d7b-99d985db6e03",
    des: "Google",
    imgSrc: "/images/phones/google-pixel-9-pro-.jpg",
  },
  {
    id: "oneplus-12",
    name: "OnePlus 12",
    url: "/product/b82a3b04-a90b-48c9-8d7b-99d985db6e04",
    des: "OnePlus",
    imgSrc: "/images/phones/oneplus-12.jpg",
  },
  {
    id: "xiaomi-17",
    name: "Xiaomi 17 Ultra",
    url: "/product/b82a3b04-a90b-48c9-8d7b-99d985db6e05",
    des: "Xiaomi",
    imgSrc: "/images/phones/xiaomi-17-ultra.jpg",
  },
  {
    id: "moto-edge",
    name: "Edge 50 Pro",
    url: "/product/b82a3b04-a90b-48c9-8d7b-99d985db6e06",
    des: "Motorola",
    imgSrc: "/images/phones/motorola-edge-50-pro.jpg",
  },
];

export default function HeroSection() {
  const timelineRef = useRef(null);
  
  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <main ref={timelineRef} className="bg-[#09090b] text-[#FAFAFA] min-h-screen">
      <div className="pt-28 pb-12 max-w-5xl mx-auto px-4">
        
        <article className="w-fit mx-auto 2xl:max-w-5xl xl:max-w-4xl max-w-2xl text-center space-y-6">
          <TimelineContent
            as="a"
            href={"/products"}
            animationNum={2}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="flex w-fit mx-auto items-center gap-1 rounded-full bg-[#18181b] border-2 border-[#27272a] hover:border-[#0ea5e9] transition-colors py-0.5 pl-0.5 pr-3 text-xs"
          >
            <div className="rounded-full bg-[#0ea5e9] px-2 py-1 text-xs text-[#09090b] font-bold">
              New
            </div>
            <p className="text-[#a1a1aa] sm:text-base text-xs inline-block">
              ✨ Discover
              <span className="px-1 text-white font-semibold">Latest Models</span>
            </p>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-3 w-3 text-[#0ea5e9]"
            >
              <path
                fillRule="evenodd"
                d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              ></path>
            </svg>
          </TimelineContent>

          <TimelineContent
            as="h1"
            animationNum={3}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="2xl:text-7xl xl:text-6xl sm:text-5xl text-4xl font-bold tracking-tight leading-[100%]"
          >
            Discover Your{" "}
            <span className="font-semibold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              Perfect
            </span>{" "}
            Mobile{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
              Device
            </span>
          </TimelineContent>

          <TimelineContent
            as="p"
            animationNum={4}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="lg:text-xl text-[#a1a1aa] sm:text-lg text-sm max-w-2xl mx-auto"
          >
            Explore the latest smartphones with AI-powered recommendations at OBSIDIAN TECH. 500+ phones from top brands at unbeatable prices.
          </TimelineContent>
        </article>

        <div className="grid md:grid-cols-3 grid-cols-2 gap-6 pt-20">
          {blocksDesign.map((component, index) => {
            return (
              <TimelineContent
                key={component.id}
                as="a"
                animationNum={index + 5}
                timelineRef={timelineRef}
                href={component.url}
                className="transition-all aspect-[3/4] md:aspect-[4/5] rounded-xl border border-[#27272a] hover:border-[#0ea5e9] bg-[#18181b] overflow-hidden relative group shadow-lg"
              >
                <figure className="relative h-full w-full">
                  {component.imgSrc && (
                    <img
                      src={component.imgSrc}
                      className={cn("w-full h-full object-contain p-6 pb-16 transition-transform duration-700 group-hover:scale-110")}
                    />
                  )}
                </figure>
                <ProgressiveBlur
                  className="pointer-events-none absolute bottom-0 left-0 h-[35%] w-full"
                  blurIntensity={0.5}
                />
                <div
                  className={cn(
                    "sm:py-3 py-2 sm:px-4 px-2 absolute bottom-0 left-0 w-full z-10 bg-gradient-to-t from-black/80 to-transparent"
                  )}
                >
                  <h1 className="2xl:text-xl xl:text-xl md:text-lg text-sm font-semibold tracking-wide text-[#FAFAFA]">
                    {component.name}
                  </h1>
                  <p className="text-xs text-[#0ea5e9] font-medium tracking-wider uppercase mt-1">
                    {component.des}
                  </p>
                </div>
              </TimelineContent>
            );
          })}
        </div>
      </div>
    </main>
  );
}
