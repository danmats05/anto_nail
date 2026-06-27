import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const DEFAULT_CONFIG: ScheduleConfig = {
  schedule: DEFAULT_SCHEDULE,
  enabledHolidays: [],
  manual: [],
};

export async function getScheduleConfig(): Promise<ScheduleConfig> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "schedule")
    .single();
  if (error || !data) return DEFAULT_CONFIG;
  return data.value as ScheduleConfig;
}

export async function saveScheduleConfig(config: ScheduleConfig): Promise<void> {
  await supabase.from("settings").delete().eq("key", "schedule");
  const { error } = await supabase.from("settings").insert({ key: "schedule", value: config });
  if (error) {
    console.error("saveScheduleConfig error:", error);
    throw error;
  }
}

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
