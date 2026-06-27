import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type StoredAppointment = {
  id:        string;
  date:      string;
  time?:     string;
  service:   string;
  price:     number;
  nom:       string;
  whatsapp:  string;
  message:   string;
  createdAt: string;
};

export async function getAll(): Promise<StoredAppointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("createdAt", { ascending: true });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function addAppointment(a: StoredAppointment): Promise<void> {
  const { error } = await supabase.from("appointments").insert(a);
  if (error) console.error(error);
}

export async function removeAppointment(id: string): Promise<void> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) console.error(error);
}
