import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  getScheduleConfig,
  saveScheduleConfig,
  getBlockedPatterns,
  type ScheduleConfig,
} from "../../lib/schedule";

export async function GET() {
  const config = await getScheduleConfig();
  return NextResponse.json({
    schedule: config.schedule,
    blocked:  getBlockedPatterns(config),
  });
}

export async function PUT(req: NextRequest) {
  const body: ScheduleConfig = await req.json();
  await saveScheduleConfig(body);
  return NextResponse.json({ ok: true });
}
