"use client";

import { useState } from "react";
import { TablesProvider, useTables } from "@/app/lib/tables-context";
import { EventSection } from "@/app/components/event-section";

const COLORS = ["violet", "cyan", "emerald"] as const;

const NAV_COLORS: Record<string, string> = {
  violet: "text-violet-400 hover:text-violet-200 border-violet-700/50 hover:border-violet-400",
  cyan:   "text-cyan-400 hover:text-cyan-200 border-cyan-700/50 hover:border-cyan-400",
  emerald:"text-emerald-400 hover:text-emerald-200 border-emerald-700/50 hover:border-emerald-400",
};

function CalculatorContent() {
  const { tables, loading, error } = useTables();
  const [resetCounts, setResetCounts] = useState<number[]>([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-slate-400">Loading calculator data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!tables) return null;

  const counts = tables.events.map((_, i) => resetCounts[i] ?? 0);

  function handleReset(i: number) {
    setResetCounts((prev) => {
      const next = [...(prev.length ? prev : tables!.events.map(() => 0))];
      next[i] = (next[i] ?? 0) + 1;
      return next;
    });
  }

  return (
    <>
      <nav className="flex gap-2 mb-5 flex-wrap">
        {tables.events.map((event, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <a
              key={event.name}
              href={`#${event.name}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors ${NAV_COLORS[color]}`}
            >
              {event.name}
            </a>
          );
        })}
      </nav>

      <div className="space-y-4">
        {tables.events.map((event, i) => (
          <EventSection
            key={`${event.name}-${counts[i]}`}
            id={event.name}
            event={event}
            color={COLORS[i % COLORS.length]}
            onReset={() => handleReset(i)}
          />
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <TablesProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <header className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Top Girl
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              CEO Event Calculator
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter how many items you plan to use to calculate your event points
            </p>
          </header>
          <CalculatorContent />
        </div>
      </div>
    </TablesProvider>
  );
}
