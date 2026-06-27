import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const FILE     = join(DATA_DIR, "schedule.json");

export type DaySchedule  = { enabled: boolean; open: string; close: string };
export type ManualBlock  = { date: string; annual: boolean };

export type ScheduleConfig = {
  schedule:        Record<string, DaySchedule>;
  enabledHolidays: string[];
  manual:          ManualBlock[];
};

const PRESET_HOLIDAYS = [
  { key: "new-year",     month: 1,  day: 1  },
  { key: "independence", month: 4,  day: 4  },
  { key: "labour",       month: 5,  day: 1  },
  { key: "assumption",   month: 8,  day: 15 },
  { key: "toussaint",    month: 11, day: 1  },
  { key: "christmas",    month: 12, day: 25 },
];

export const DEFAULT_SCHEDULE: Record<string, DaySchedule> = {
  lun: { enabled: true,  open: "09:00", close: "18:00" },
  mar: { enabled: true,  open: "09:00", close: "18:00" },
  mer: { enabled: true,  open: "09:00", close: "18:00" },
  jeu: { enabled: true,  open: "09:00", close: "18:00" },
  ven: { enabled: true,  open: "09:00", close: "18:00" },
  sam: { enabled: true,  open: "09:00", close: "17:00" },
  dim: { enabled: false, open: "09:00", close: "18:00" },
};

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export function getScheduleConfig(): ScheduleConfig {
  ensureDir();
  if (!existsSync(FILE)) return { schedule: DEFAULT_SCHEDULE, enabledHolidays: [], manual: [] };
  try { return JSON.parse(readFileSync(FILE, "utf-8")); }
  catch { return { schedule: DEFAULT_SCHEDULE, enabledHolidays: [], manual: [] }; }
}

export function saveScheduleConfig(config: ScheduleConfig): void {
  ensureDir();
  writeFileSync(FILE, JSON.stringify(config, null, 2));
}

// Retourne les patterns bloqués pour le calendrier
// MM-DD = annuel  |  YYYY-MM-DD = ponctuel
export function getBlockedPatterns(config: ScheduleConfig): string[] {
  const patterns: string[] = [];
  for (const h of PRESET_HOLIDAYS) {
    if (config.enabledHolidays.includes(h.key)) {
      patterns.push(`${String(h.month).padStart(2, "0")}-${String(h.day).padStart(2, "0")}`);
    }
  }
  for (const m of config.manual) {
    patterns.push(m.annual ? m.date.slice(5) : m.date);
  }
  return patterns;
}
