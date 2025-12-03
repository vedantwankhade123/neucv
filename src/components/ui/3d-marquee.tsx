"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

export const ThreeDMarquee = ({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) => {
  // Split the items array into 4 equal parts
  const chunkSize = Math.ceil(items.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return items.slice(start, start + chunkSize);
  });

  return (
    <div
      className={cn(
        "mx-auto block h-[600px] overflow-hidden rounded-2xl max-sm:h-100 relative bg-slate-50/50",
        className,
      )}
    >
      {/* Gradient Fade Masks */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white via-white/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />

      <div className="flex size-full items-center justify-center py-20">
        <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
          <div
            style={{
              transform: "rotateX(20deg) rotateY(-10deg) rotateZ(10deg)",
            }}
            className="relative top-20 left-0 grid size-full origin-center grid-cols-4 gap-4 [transform-style:preserve-3d]"
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={{
                  y: colIndex % 2 === 0 ? ["-5%", "-35%"] : ["-35%", "-5%"]
                }}
                transition={{
                  duration: 45,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                key={colIndex + "marquee"}
                className="flex flex-col items-center gap-6"
              >
                {subarray.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="relative"
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg bg-white">
                      {item}
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};