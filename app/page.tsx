"use client";

import { TablesProvider, useTables } from "@/app/lib/tables-context";
import { EventSection } from "@/app/components/event-section";

const COLORS = ["violet", "cyan"] as const;

function CalculatorContent() {
  const { tables, loading, error } = useTables();

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

  return (
    <div className="space-y-6">
      {tables.events.map((event, i) => (
        <EventSection key={event.name} event={event} color={COLORS[i % COLORS.length]} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <TablesProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <header className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
              Top Girl
            </p>
            <h1 className="mt-4 text-4xl font-bold text-white">
              CEO Event Calculator
            </h1>
            <p className="mt-2 text-slate-300">
              Enter how many items you plan to use to calculate your event points
            </p>
          </header>
          <CalculatorContent />
        </div>
      </div>
    </TablesProvider>
  );
}
