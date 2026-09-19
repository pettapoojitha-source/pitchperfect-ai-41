import { motion } from "motion/react";

/** Subtle animated abstract shapes: slides, charts, ideas, AI, startups. */
export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Slide card */}
      <motion.div
        className="glass absolute left-[8%] top-[14%] h-28 w-44 rounded-2xl p-3 shadow-float"
        animate={{ y: [0, -16, 0], rotate: [-4, -2, -4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-2 w-16 rounded-full bg-cadet-deep/60" />
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-32 rounded-full bg-cadet/40" />
          <div className="h-1.5 w-24 rounded-full bg-cadet/30" />
          <div className="h-1.5 w-28 rounded-full bg-cadet/30" />
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        className="glass absolute bottom-[18%] left-[14%] flex h-32 w-40 items-end gap-2 rounded-2xl p-4 shadow-float"
        animate={{ y: [0, 14, 0], rotate: [3, 5, 3] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        {[35, 55, 45, 75, 95].map((h, i) => (
          <motion.div
            key={i}
            className="w-full rounded-t-md bg-linear-to-t from-cadet-deep to-mint-deep"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
          />
        ))}
      </motion.div>

      {/* Idea spark */}
      <motion.div
        className="absolute right-[12%] top-[20%] h-24 w-24 rounded-full bg-mint-deep/50 blur-2xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* AI ring */}
      <motion.div
        className="absolute right-[18%] top-[30%] h-16 w-16 rounded-full border-2 border-mint-ice/70"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-mint-ice shadow-glow" />
      </motion.div>

      {/* Startup arrow */}
      <motion.svg
        viewBox="0 0 120 80"
        className="absolute bottom-[14%] right-[10%] w-44 opacity-80"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <motion.path
          d="M8 68 C 30 60, 45 62, 60 40 S 90 14, 112 10"
          stroke="var(--mint-ice)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
        />
        <circle cx="112" cy="10" r="6" fill="var(--mint-ice)" />
      </motion.svg>

      {/* Soft orbs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-mint-ice/40 blur-3xl" />
      <div className="absolute -bottom-24 right-1/3 h-80 w-80 rounded-full bg-cadet-deep/30 blur-3xl" />
    </div>
  );
}
