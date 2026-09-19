import type { ReactNode } from "react";
import { motion } from "motion/react";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { FloatingShapes } from "@/components/brand/FloatingShapes";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-hero-gradient grain relative min-h-screen overflow-hidden">
      <FloatingShapes />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1.15fr_1fr] lg:px-12">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl"
        >
          <div className="mb-10 flex items-center gap-3">
            <LogoMark className="h-11 w-11" />
            <Wordmark className="text-lg" />
          </div>
          <p className="eyebrow mb-4 text-cadet-deep">Build. Challenge. Pitch.</p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.98] text-navy md:text-7xl">
            Your idea
            <br />
            deserves a<br />
            <span className="text-gradient">better pitch.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-cadet-deep">
            "Generate the story. Challenge the assumptions. Walk into the pitch prepared."
          </p>
          <div className="mt-10 hidden gap-6 text-sm font-semibold text-cadet-deep md:flex">
            {["AI-generated deck", "VC Critic", "Fix with AI", "Export & present"].map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cadet-deep" />
                {t}
              </motion.span>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="glass mx-auto w-full max-w-md rounded-[2rem] p-8 shadow-float md:p-10"
        >
          {children}
        </motion.section>
      </div>
    </div>
  );
}
