import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export type Task = {
  task: string;
  points: number;
  used: number;
};

export type Category = {
  name: string;
  tasks: Task[];
};

export type EventData = {
  name: string;
  categories: Category[];
};

export type TablesData = {
  events: EventData[];
};

// Columns for each event (0-indexed)
const LEFT     = { category: 0,  task: 1,  points: 2,  used: 3  };
const RIGHT    = { category: 6,  task: 7,  points: 8,  used: 9  };
const WARM_UP  = { category: 12, task: 13, points: 14, used: 15 };

function parseEvent(
  raw: unknown[][],
  cols: typeof LEFT,
  eventName: string
): EventData {
  const categories: Category[] = [];
  let currentCategory = "";
  let currentTasks: Task[] = [];

  const TOTAL_LABELS = new Set(["total", "approximate total for all days"]);

  for (let i = 5; i < raw.length; i++) {
    const row = raw[i];
    if (!Array.isArray(row)) continue;

    const taskCell = String(row[cols.task] ?? "").trim();

    // Skip total/summary rows
    if (TOTAL_LABELS.has(taskCell.toLowerCase())) continue;
    // Skip empty task rows
    if (!taskCell) continue;

    // Check for new category
    const catCell = String(row[cols.category] ?? "").trim();
    if (catCell && catCell !== currentCategory) {
      if (currentCategory && currentTasks.length > 0) {
        categories.push({ name: currentCategory, tasks: currentTasks });
      }
      currentCategory = catCell;
      currentTasks = [];
    }

    const points = typeof row[cols.points] === "number"
      ? row[cols.points] as number
      : Number(row[cols.points]) || 0;
    const usedRaw = row[cols.used];
    const used = typeof usedRaw === "number"
      ? usedRaw
      : usedRaw != null && usedRaw !== ""
        ? Number(usedRaw) || 0
        : 0;

    currentTasks.push({ task: taskCell, points, used });
  }

  if (currentCategory && currentTasks.length > 0) {
    categories.push({ name: currentCategory, tasks: currentTasks });
  }

  return { name: eventName, categories };
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "Book2.xlsx");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Workbook not found" }, { status: 500 });
    }
    const fileBuffer = await fs.promises.readFile(filePath);
    const wb = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });

    const ws = wb.Sheets["Sheet1"];
    if (!ws) {
      return NextResponse.json({ error: "Sheet1 not found" }, { status: 500 });
    }

    const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];

    // Event names are now in row 4 (index 3) after 2 nav rows were inserted
    const topName      = String(raw[3]?.[LEFT.task]      ?? "TOP CEO EVENT");
    const ultimateName = String(raw[3]?.[RIGHT.category] ?? "ULTIMATE CEO EVENT");
    const warmUpName   = String(raw[3]?.[WARM_UP.category] ?? "WARM UP EVENT");

    const result: TablesData = {
      events: [
        parseEvent(raw, LEFT, topName),
        parseEvent(raw, RIGHT, ultimateName),
        parseEvent(raw, WARM_UP, warmUpName),
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("tables route failed", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
