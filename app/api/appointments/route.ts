import { NextRequest, NextResponse } from "next/server";
import { getAll, removeAppointment } from "../../lib/appointments";

export async function GET() {
  return NextResponse.json(await getAll());
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await removeAppointment(id);
  return NextResponse.json({ ok: true });
}
