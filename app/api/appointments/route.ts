import { NextRequest, NextResponse } from "next/server";
import { getAll, removeAppointment } from "../../lib/appointments";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  // Mode vérification créneau : renvoie le nombre de réservations existantes
  if (date && time) {
    const all = await getAll();
    const count = all.filter(a => a.date === date && a.time === time).length;
    return NextResponse.json({ count });
  }

  return NextResponse.json(await getAll());
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await removeAppointment(id);
  return NextResponse.json({ ok: true });
}
