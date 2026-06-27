import { NextRequest, NextResponse } from "next/server";
import {
  getScheduleConfig,
  saveScheduleConfig,
  getBlockedPatterns,
  type ScheduleConfig,
} from "../../lib/schedule";

export const dynamic = "force-dynamic";

export function GET() {
  const config = getScheduleConfig();
  return NextResponse.json({
    schedule: config.schedule,
    blocked:  getBlockedPatterns(config),
  });
}

export async function PUT(req: NextRequest) {
  const body: ScheduleConfig = await req.json();
  saveScheduleConfig(body);
  return NextResponse.json({ ok: true });
}
