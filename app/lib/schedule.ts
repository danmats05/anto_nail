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

function headers() {
  return {
    "apikey":        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    "Content-Type":  "application/json",
  };
}

function base() {
  return `${process.env.SUPABASE_URL!.replace(/\/$/, "")}/rest/v1/settings`;
}

export async function getScheduleConfig(): Promise<ScheduleConfig> {
  try {
    const res = await fetch(`${base()}?key=eq.schedule&select=value`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_CONFIG;
    const rows = await res.json();
    if (!rows || rows.length === 0) return DEFAULT_CONFIG;
    return rows[0].value as ScheduleConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveScheduleConfig(config: ScheduleConfig): Promise<void> {
  await fetch(`${base()}?key=eq.schedule`, {
    method: "DELETE",
    headers: headers(),
  });
  const res = await fetch(base(), {
    method: "POST",
    headers: { ...headers(), "Prefer": "return=minimal" },
    body: JSON.stringify({ key: "schedule", value: config }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("saveScheduleConfig:", err);
    throw new Error(err);
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
