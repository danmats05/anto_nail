"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnPrimary, btnSecondary } from "../lib/hooks";
import { UsersThree, CrownSimple, Eye, EyeClosed } from "@phosphor-icons/react";

// ─── Types ───────────────────────────────────────────────────────────────────

type DaySchedule  = { enabled: boolean; open: string; close: string };
type Schedule     = Record<string, DaySchedule>;
type ManualBlock  = { id: string; date: string; annual: boolean };
type Appointment  = { id: string; date: string; time?: string; service: string; price: number; nom?: string };

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = [
  { key: "lun", label: "Lundi"    },
  { key: "mar", label: "Mardi"    },
  { key: "mer", label: "Mercredi" },
  { key: "jeu", label: "Jeudi"    },
  { key: "ven", label: "Vendredi" },
  { key: "sam", label: "Samedi"   },
  { key: "dim", label: "Dimanche" },
];

const DEFAULT_SCHEDULE: Schedule = {
  lun: { enabled: true,  open: "09:00", close: "18:00" },
  mar: { enabled: true,  open: "09:00", close: "18:00" },
  mer: { enabled: true,  open: "09:00", close: "18:00" },
  jeu: { enabled: true,  open: "09:00", close: "18:00" },
  ven: { enabled: true,  open: "09:00", close: "18:00" },
  sam: { enabled: true,  open: "09:00", close: "17:00" },
  dim: { enabled: false, open: "09:00", close: "18:00" },
};

const PRESET_HOLIDAYS = [
  { key: "new-year",     label: "Jour de l'An",            month: 1,  day: 1  },
  { key: "independence", label: "Fête de l'Indépendance",  month: 4,  day: 4  },
  { key: "labour",       label: "Fête du Travail",          month: 5,  day: 1  },
  { key: "assumption",   label: "Assomption",               month: 8,  day: 15 },
  { key: "toussaint",   label: "Toussaint",                month: 11, day: 1  },
  { key: "christmas",   label: "Noël",                     month: 12, day: 25 },
];

const SERVICES = [
  { key: "gel",      label: "Pose Gel",       price: 39000 },
  { key: "nailart",  label: "Nail Art",        price: 52000 },
  { key: "bb",       label: "Baby Boomer",     price: 49000 },
  { key: "depose",   label: "Dépose & Soin",   price: 23000 },
  { key: "manucure", label: "Manucure",        price: 30000 },
  { key: "semi",     label: "Semi-Permanent",  price: 33000 },
];

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTH_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const ADMIN_PWD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "antonail2024";

// ─── Shared styles ────────────────────────────────────────────────────────────

const sectionLabel: React.CSSProperties = {
  fontFamily:    "var(--font-dm-sans)",
  fontSize:      "10px",
  fontWeight:    700,
  letterSpacing: "0.26em",
  textTransform: "uppercase",
  color:         "var(--grey)",
  display:       "flex",
  alignItems:    "center",
  gap:           "12px",
  margin:        0,
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router                         = useRouter();
  const [authed, setAuthed]           = useState(false);
  const [pwd, setPwd]                 = useState("");
  const [pwdError, setPwdError]       = useState(false);
  const [tab, setTab]                 = useState<"planning" | "stats">("planning");
  const [schedule, setSchedule]       = useState<Schedule>(DEFAULT_SCHEDULE);
  const [holidays, setHolidays]       = useState<Set<string>>(new Set());
  const [manual, setManual]           = useState<ManualBlock[]>([]);
  const [newDate, setNewDate]         = useState("");
  const [newAnnual, setNewAnnual]     = useState(false);
  const [swipedId, setSwipedId]       = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const touchStartX                   = useRef(0);
  const [saved, setSaved]             = useState(false);

  // ── Stats state ───────────────────────────────────────────────────────────
  const now = new Date();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statMonth, setStatMonth]       = useState(now.getMonth() + 1);
  const [statYear, setStatYear]         = useState(now.getFullYear());
  const [chartRange, setChartRange] = useState<"annee" | "6mois" | "3mois" | "mois" | "semaine">("annee");
  const [activePoint, setActivePoint] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("anto-admin") === "1") setAuthed(true);

    const s = localStorage.getItem("anto-schedule");
    if (s) setSchedule(JSON.parse(s));

    const h = localStorage.getItem("anto-holidays");
    if (h) setHolidays(new Set(JSON.parse(h)));

    const m = localStorage.getItem("anto-manual");
    if (m) setManual(JSON.parse(m));

    // Charger les réservations depuis l'API (alimentée par le formulaire)
    fetch("/api/appointments")
      .then(r => r.json())
      .then(data => setAppointments(data))
      .catch(() => {});
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === ADMIN_PWD) {
      sessionStorage.setItem("anto-admin", "1");
      setAuthed(true);
    } else {
      setPwdError(true);
      setPwd("");
    }
  }

  function logout() {
    sessionStorage.removeItem("anto-admin");
    sessionStorage.setItem("anto-skip-preloader", "1");
    router.push("/");
  }

  async function save() {
    localStorage.setItem("anto-schedule",  JSON.stringify(schedule));
    localStorage.setItem("anto-holidays",  JSON.stringify([...holidays]));
    localStorage.setItem("anto-manual",    JSON.stringify(manual));

    // Synchronise vers le serveur pour le calendrier côté clientes
    const res = await fetch("/api/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule, enabledHolidays: [...holidays], manual }),
    });
    if (!res.ok) console.error("Save schedule failed:", await res.text());

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────
  function fmtFCFA(n: number) {
    return n.toLocaleString("fr-FR") + " FCFA";
  }

  function monthAppts(y: number, m: number) {
    return appointments.filter(a => {
      const d = new Date(a.date + "T12:00:00");
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }

  function rangeAppts(range: "annee" | "6mois" | "3mois" | "mois" | "semaine") {
    if (range === "mois") return monthAppts(statYear, statMonth);
    if (range === "annee") return appointments.filter(a =>
      new Date(a.date + "T12:00:00").getFullYear() === statYear
    );
    if (range === "3mois" || range === "6mois") {
      const n = range === "3mois" ? 3 : 6;
      const result: Appointment[] = [];
      for (let i = 0; i < n; i++) {
        let m = statMonth - i, y = statYear;
        if (m <= 0) { m += 12; y -= 1; }
        result.push(...monthAppts(y, m));
      }
      return result;
    }
    // semaine — semaine réelle (lun-dim)
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = today.getDay();
    const monday = new Date(today); monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
    return appointments.filter(a => {
      const d = new Date(a.date + "T12:00:00");
      return d >= monday && d <= sunday;
    });
  }

  function prevMonth() {
    if (statMonth === 1) { setStatMonth(12); setStatYear(y => y - 1); }
    else setStatMonth(m => m - 1);
  }

  function nextMonth() {
    if (statMonth === 12) { setStatMonth(1); setStatYear(y => y + 1); }
    else setStatMonth(m => m + 1);
  }

  async function removeAppointment(id: string) {
    await fetch("/api/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAppointments(p => p.filter(a => a.id !== id));
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    setSwipedId(null);
    setTimeout(() => {
      removeAppointment(id);
      setDeletingId(null);
    }, 480);
  }

  type ChartBar = { label: string; revenue: number; clients: number; isCurrent: boolean };

  function getChartBars(range: typeof chartRange): ChartBar[] {
    if (range === "annee") {
      return MONTHS.map((name, i) => {
        const m = monthAppts(statYear, i + 1);
        return { label: MONTH_SHORT[i], revenue: m.reduce((s, a) => s + a.price, 0), clients: m.length, isCurrent: i + 1 === statMonth };
      });
    }
    if (range === "6mois" || range === "3mois") {
      const count = range === "6mois" ? 6 : 3;
      return Array.from({ length: count }, (_, i) => {
        let m = statMonth - (count - 1 - i);
        let y = statYear;
        while (m <= 0) { m += 12; y--; }
        const appts = monthAppts(y, m);
        return { label: MONTH_SHORT[m - 1], revenue: appts.reduce((s, a) => s + a.price, 0), clients: appts.length, isCurrent: m === statMonth && y === statYear };
      });
    }
    if (range === "mois") {
      const daysInMonth = new Date(statYear, statMonth, 0).getDate();
      const bars: ChartBar[] = [];
      let day = 1; let wk = 1;
      while (day <= daysInMonth) {
        const end = Math.min(day + 6, daysInMonth);
        const pad = (n: number) => String(n).padStart(2, "0");
        const s = `${statYear}-${pad(statMonth)}-${pad(day)}`;
        const e = `${statYear}-${pad(statMonth)}-${pad(end)}`;
        const a = appointments.filter(x => x.date >= s && x.date <= e);
        bars.push({ label: `Sem. ${wk}`, revenue: a.reduce((sum, x) => sum + x.price, 0), clients: a.length, isCurrent: false });
        day = end + 1; wk++;
      }
      return bars;
    }
    if (range === "semaine") {
      const today = new Date();
      const dow   = today.getDay();
      const mon   = new Date(today);
      mon.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
      const todayISO = today.toISOString().slice(0, 10);
      return ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((label, i) => {
        const d = new Date(mon); d.setDate(mon.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        const a = appointments.filter(x => x.date === iso);
        return { label, revenue: a.reduce((s, x) => s + x.price, 0), clients: a.length, isCurrent: iso === todayISO };
      });
    }
    return [];
  }

  function toggleDay(key: string) {
    setSchedule(p => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
  }

  function setTime(key: string, field: "open" | "close", val: string) {
    setSchedule(p => ({ ...p, [key]: { ...p[key], [field]: val } }));
  }

  function toggleHoliday(key: string) {
    setHolidays(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function addManual() {
    if (!newDate || manual.some(m => m.date === newDate && m.annual === newAnnual)) return;
    setManual(p => [...p, { id: crypto.randomUUID(), date: newDate, annual: newAnnual }]
      .sort((a, b) => a.date.localeCompare(b.date)));
    setNewDate("");
  }

  function removeManual(id: string) {
    setManual(p => p.filter(m => m.id !== id));
  }

  function fmtDate(iso: string, annual: boolean) {
    const d = new Date(iso + "T12:00:00");
    if (annual) {
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    }
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  if (!authed) return (
    <LoginScreen
      pwd={pwd}
      setPwd={v => { setPwd(v); setPwdError(false); }}
      error={pwdError}
      onSubmit={login}
    />
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", animation: "adminPageIn 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        background: "var(--white)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0 clamp(20px, 5vw, 48px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        animation: "adminPageIn 0.45s cubic-bezier(0.22,1,0.36,1) both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/" style={{ display: "block" }}>
            <Image src="/logo-anto.png" alt="Anto Nail" width={96} height={40}
              style={{ objectFit: "contain", display: "block" }} />
          </Link>
        </div>

        <button
          onClick={logout}
          className="admin-btn-secondary"
          style={{ ...btnSecondary, padding: "10px 20px", fontSize: "11px" }}
        >
          Déconnexion
        </button>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "56px clamp(20px, 5vw, 48px) 100px", animation: "adminPageIn 0.55s cubic-bezier(0.22,1,0.36,1) 0.07s both" }}>

        {/* Page title */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{ ...sectionLabel, marginBottom: "14px" }}>
            <span style={{ width: "28px", height: "1px", background: "var(--grey-light)", flexShrink: 0 }} />
            Espace admin
          </p>
          <h1 style={{
            fontFamily:    "var(--font-dm-sans)",
            fontSize:      "clamp(36px, 5vw, 52px)",
            fontWeight:    700,
            letterSpacing: "-0.03em",
            lineHeight:    1,
            color:         "var(--noir)",
            margin:        0,
          }}>
            Mon planning
          </h1>
        </div>

        {/* ── Tab nav ──────────────────────────────────────────────────── */}
        <div style={{
          display:      "flex",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          marginBottom: "48px",
        }}>
          {([
            ["planning",     "Planning"],
            ["stats",        "Statistiques"],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily:    "var(--font-dm-sans)",
              fontSize:      "12px",
              fontWeight:    700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color:         tab === t ? "var(--noir)" : "var(--grey)",
              background:    "none",
              border:        "none",
              borderBottom:  tab === t ? "2px solid var(--noir)" : "2px solid transparent",
              padding:       "0 0 14px",
              marginRight:   "32px",
              marginBottom:  "-1px",
              cursor:        "pointer",
              transition:    "color 0.2s, border-color 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ══ PLANNING TAB ═════════════════════════════════════════════ */}
        {tab === "planning" && (
          <div style={{ display: "flex", flexDirection: "column" }}>

            {/* ── Horaires hebdomadaires ────────────────────────────── */}
            <Section
              label="Horaires hebdomadaires"
              description="Activez les jours où vous travaillez et définissez vos heures d'ouverture."
            >
              {DAYS.map(({ key, label }, i) => {
                const day = schedule[key];
                return (
                  <div key={key} className="admin-day-row" style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    gap:            "16px",
                    padding:        "16px 0",
                    borderBottom:   i < DAYS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <Toggle on={day.enabled} onToggle={() => toggleDay(key)} />
                      <span style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize:   "13px",
                        fontWeight: day.enabled ? 700 : 400,
                        color:      day.enabled ? "var(--noir)" : "rgba(0,0,0,0.28)",
                        width:      "72px",
                        transition: "color 0.2s",
                      }}>{label}</span>
                    </div>
                    {day.enabled ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <TimeInput className="admin-time-input" value={day.open}  onChange={v => setTime(key, "open",  v)} />
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "var(--grey-light)", fontWeight: 700 }}>→</span>
                        <TimeInput className="admin-time-input" value={day.close} onChange={v => setTime(key, "close", v)} />
                      </div>
                    ) : (
                      <span style={{
                        fontFamily:    "var(--font-dm-sans)",
                        fontSize:      "11px",
                        fontWeight:    700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color:         "rgba(0,0,0,0.18)",
                      }}>Fermé</span>
                    )}
                  </div>
                );
              })}
            </Section>

            {/* ── Jours fermés ──────────────────────────────────────── */}
            <Section
              label="Jours fermés"
              description="Gérez les jours fériés et vos congés personnels."
            >
              {/* Sous-section : jours fériés */}
              <p style={{ ...sectionLabel, fontSize: "9px", letterSpacing: "0.2em", marginBottom: "14px" }}>
                Jours fériés
              </p>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: "32px" }}>
                {PRESET_HOLIDAYS.map(({ key, label, month, day }, i) => (
                  <div key={key} style={{
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "space-between",
                    padding:      "13px 0",
                    borderBottom: i < PRESET_HOLIDAYS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <Toggle on={holidays.has(key)} onToggle={() => toggleHoliday(key)} />
                      <span style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize:   "13px",
                        fontWeight: holidays.has(key) ? 600 : 400,
                        color:      holidays.has(key) ? "var(--noir)" : "rgba(0,0,0,0.4)",
                        transition: "color 0.2s",
                      }}>{label}</span>
                    </div>
                    <span style={{
                      fontFamily:    "var(--font-dm-sans)",
                      fontSize:      "11px",
                      color:         "var(--grey)",
                      letterSpacing: "0.04em",
                    }}>
                      {String(day).padStart(2, "0")} / {String(month).padStart(2, "0")} · chaque année
                    </span>
                  </div>
                ))}
              </div>

              {/* Sous-section : dates personnalisées */}
              <p style={{ ...sectionLabel, fontSize: "9px", letterSpacing: "0.2em", marginBottom: "16px" }}>
                Congés & imprévus
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", width: "100%" }}>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize:   "13px",
                    color:      "var(--noir)",
                    background: "var(--white)",
                    border:     "1.5px solid rgba(0,0,0,0.14)",
                    padding:    "10px 14px",
                    outline:    "none",
                    cursor:     "pointer",
                    width:      "100%",
                    boxSizing:  "border-box",
                    minHeight:  "44px",
                    display:    "block",
                  }}
                />
                {/* Récurrence toggle + bouton groupés */}
                <div style={{ display: "flex", gap: "8px", width: "100%", alignItems: "stretch" }}>
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", padding: "3px", flex: 1 }}>
                    {([false, true] as const).map(v => (
                      <button
                        key={String(v)}
                        onClick={() => setNewAnnual(v)}
                        style={{
                          fontFamily:    "var(--font-dm-sans)",
                          fontSize:      "11px",
                          fontWeight:    newAnnual === v ? 700 : 400,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          whiteSpace:    "nowrap",
                          color:         newAnnual === v ? "var(--noir)" : "var(--grey)",
                          background:    newAnnual === v ? "var(--white)" : "none",
                          border:        "none",
                          padding:       "6px 14px",
                          cursor:        "pointer",
                          transition:    "all 0.18s",
                          boxShadow:     newAnnual === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          flex:          1,
                          textAlign:     "center",
                        }}
                      >
                        {v ? "Chaque an" : "Une fois"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={addManual}
                    className="admin-btn-primary"
                    style={{ ...btnPrimary, padding: "0 20px", fontSize: "11px", flexShrink: 0 }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {manual.length === 0 ? (
                <p style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize:   "12px",
                  color:      "rgba(0,0,0,0.28)",
                  fontStyle:  "italic",
                  margin:     0,
                }}>Aucune date ajoutée pour le moment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {manual.map((m, i) => (
                    <div key={m.id} style={{
                      display:        "flex",
                      alignItems:     "flex-start",
                      justifyContent: "space-between",
                      gap:            "12px",
                      padding:        "13px 0",
                      borderBottom:   i < manual.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", minWidth: 0 }}>
                        <span style={{
                          fontFamily:    "var(--font-dm-sans)",
                          fontSize:      "13px",
                          fontWeight:    500,
                          color:         "var(--noir)",
                          textTransform: "capitalize",
                        }}>{fmtDate(m.date, m.annual)}</span>
                        <span style={{
                          fontFamily:    "var(--font-dm-sans)",
                          fontSize:      "9px",
                          fontWeight:    700,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          whiteSpace:    "nowrap",
                          color:         m.annual ? "var(--lavender-dark)" : "var(--grey)",
                          background:    m.annual ? "var(--lavender-light)" : "rgba(0,0,0,0.05)",
                          padding:       "3px 8px",
                        }}>
                          {m.annual ? "Chaque année" : "Une fois"}
                        </span>
                      </div>
                      <button
                        onClick={() => removeManual(m.id)}
                        className="admin-btn-remove"
                        style={{
                          fontFamily:    "var(--font-dm-sans)",
                          fontSize:      "10px",
                          fontWeight:    700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          whiteSpace:    "nowrap",
                          flexShrink:    0,
                          color:         "var(--grey)",
                          background:    "none",
                          border:        "none",
                          cursor:        "pointer",
                          padding:       "4px 0",
                          transition:    "color 0.2s",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Save ──────────────────────────────────────────────── */}
            <div style={{
              display:     "flex",
              alignItems:  "center",
              gap:         "20px",
              paddingTop:  "40px",
              borderTop:   "1px solid rgba(0,0,0,0.08)",
              marginTop:   "8px",
            }}>
              <button
                onClick={save}
                className="admin-btn-primary"
                style={{ ...btnPrimary }}
              >
                Enregistrer
              </button>
              {saved && (
                <span style={{
                  fontFamily:    "var(--font-dm-sans)",
                  fontSize:      "11px",
                  fontWeight:    700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color:         "var(--lavender-dark)",
                  animation:     "adminFadeIn 0.3s ease",
                }}>
                  ✓ Sauvegardé
                </span>
              )}
            </div>
          </div>
        )}

        {/* ══ STATS TAB ════════════════════════════════════════════════ */}
        {tab === "stats" && (() => {
          const appts    = monthAppts(statYear, statMonth);
          const totalRev = appts.reduce((s, a) => s + a.price, 0);

          // Données filtrées selon la plage du graphe
          const sectionAppts = rangeAppts(chartRange);
          const sectionRev   = sectionAppts.reduce((s, a) => s + a.price, 0);
          const sectionSvcs  = SERVICES.map(s => ({
            ...s,
            count:   sectionAppts.filter(a => a.service === s.key).length,
            revenue: sectionAppts.filter(a => a.service === s.key).reduce((sum, a) => sum + a.price, 0),
          })).sort((a, b) => b.count - a.count);

          const bars    = getChartBars(chartRange);
          const maxRev  = Math.max(...bars.map(b => b.revenue), 1);

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>

              {/* ── Navigation mois ─────────────────────────────────── */}
              <div style={{
                background:     "var(--white)",
                border:         "1px solid rgba(0,0,0,0.07)",
                padding:        "20px 40px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                marginBottom:   "2px",
              }}>
                <button onClick={prevMonth} className="admin-nav-btn">← Précédent</button>
                <p style={{
                  fontFamily:    "var(--font-dm-sans)",
                  fontSize:      "18px",
                  fontWeight:    700,
                  letterSpacing: "-0.02em",
                  color:         "var(--noir)",
                  margin:        0,
                  textTransform: "capitalize",
                }}>{MONTHS[statMonth - 1]} {statYear}</p>
                <button onClick={nextMonth} className="admin-nav-btn">Suivant →</button>
              </div>

              {/* ── Cartes résumé ───────────────────────────────────── */}
              <div style={{
                display:             "grid",
                gridTemplateColumns: "1fr 1fr",
                gap:                 "2px",
                marginBottom:        "2px",
              }}>
                {[
                  { label: "Clientes", value: String(appts.length), sub: "ce mois" },
                  { label: "Revenus",  value: fmtFCFA(totalRev),    sub: "ce mois" },
                ].map(card => (
                  <div key={card.label} style={{
                    background: "var(--white)",
                    border:     "1px solid rgba(0,0,0,0.07)",
                    padding:    "28px 32px",
                  }}>
                    <p style={{
                      fontFamily:    "var(--font-dm-sans)",
                      fontSize:      "10px",
                      fontWeight:    700,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color:         "var(--grey)",
                      margin:        "0 0 12px",
                    }}>{card.label}</p>
                    <p style={{
                      fontFamily:    "var(--font-dm-sans)",
                      fontSize:      "clamp(18px, 2.5vw, 26px)",
                      fontWeight:    700,
                      letterSpacing: "-0.03em",
                      color:         "var(--noir)",
                      margin:        "0 0 4px",
                      lineHeight:    1,
                    }}>{card.value}</p>
                    <p style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize:   "11px",
                      color:      "var(--grey)",
                      margin:     0,
                    }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Prestations (filtrées selon la plage) ───────────── */}
              <div style={{ background: "var(--white)", border: "1px solid rgba(0,0,0,0.07)", padding: "32px 40px", marginBottom: "2px" }}>
                <p style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--grey)",
                  display: "flex", alignItems: "center", gap: "12px", margin: "0 0 24px",
                }}>
                  <span style={{ width: "20px", height: "1px", background: "var(--grey-light)" }} />
                  Prestations
                </p>

                {sectionAppts.length === 0 ? (
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "rgba(0,0,0,0.28)", fontStyle: "italic", margin: 0 }}>
                    Aucune prestation sur cette période.
                  </p>
                ) : (
                  <>
                    {/* Résumé par type */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "20px" }}>
                      {sectionSvcs.filter(s => s.count > 0).map(s => (
                        <div key={s.key} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "11px 14px", background: "var(--cream)",
                        }}>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 600, color: "var(--noir)" }}>
                            {s.label}
                          </span>
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 700, color: "var(--noir)" }}>
                            {fmtFCFA(s.revenue)}
                          </span>
                        </div>
                      ))}
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 14px", borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "2px",
                      }}>
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)" }}>
                          Total
                        </span>
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 700, color: "var(--noir)", letterSpacing: "-0.02em" }}>
                          {fmtFCFA(sectionRev)}
                        </span>
                      </div>
                    </div>

                    {/* Historique individuel */}
                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
                      <p style={{
                        fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
                        letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--grey)",
                        display: "flex", alignItems: "center", gap: "10px", margin: "0 0 14px",
                      }}>
                        <span style={{ width: "16px", height: "1px", background: "var(--grey-light)" }} />
                        Historique des prestations
                      </p>
                      {(() => {
                        // Groupes par créneau, dans l'ordre d'insertion (= ordre de réservation)
                        const slotGroups = new Map<string, Appointment[]>();
                        sectionAppts.forEach(a => {
                          if (!a.time) return;
                          const key = `${a.date}|${a.time}`;
                          const group = slotGroups.get(key) ?? [];
                          group.push(a);
                          slotGroups.set(key, group);
                        });
                        const sorted = [...sectionAppts].sort((a, b) => b.date.localeCompare(a.date));
                        return sorted.map((a, i) => {
                        const svc = SERVICES.find(s => s.key === a.service);
                        const isSwiped = swipedId === a.id;
                        const isDeleting = deletingId === a.id;
                        const slotKey = a.time ? `${a.date}|${a.time}` : null;
                        const group = slotKey ? (slotGroups.get(slotKey) ?? []) : [];
                        const posInGroup = group.findIndex(ap => ap.id === a.id);
                        const showBadge = posInGroup >= 1;
                        const prevName = posInGroup >= 2 ? (group[posInGroup - 1].nom ?? "—") : null;
                        return (
                          <div key={a.id} style={{
                            position: "relative", overflow: "hidden",
                            maxHeight: isDeleting ? "0px" : "120px",
                            transition: isDeleting ? "max-height 0.28s ease 0.18s" : "none",
                            borderBottom: i < sectionAppts.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                          }}>
                            {/* Bouton suppression révélé au swipe (mobile) */}
                            <div
                              className="swipe-delete-btn"
                              onClick={() => handleDelete(a.id)}
                              style={{
                                position: "absolute", right: 0, top: 0, bottom: 0, width: "72px",
                                background: "#e74c3c", display: "flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer",
                              }}
                            >
                              <span style={{ color: "white", fontSize: "22px", lineHeight: 1 }}>×</span>
                            </div>

                            {/* Contenu de la ligne */}
                            <div
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 0", background: "var(--white)",
                                transform: isDeleting
                                  ? "translateX(-110%)"
                                  : isSwiped ? "translateX(-72px)" : "translateX(0)",
                                transition: isDeleting
                                  ? "transform 0.22s ease"
                                  : "transform 0.25s ease",
                              }}
                              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                              onTouchEnd={(e) => {
                                const dx = touchStartX.current - e.changedTouches[0].clientX;
                                if (dx > 40) setSwipedId(a.id);
                                else if (dx < -10) setSwipedId(null);
                              }}
                              onClick={() => { if (isSwiped) setSwipedId(null); }}
                            >
                              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "var(--grey)", width: "54px", flexShrink: 0 }}>
                                  {new Date(a.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                  {a.time && <span style={{ display: "block", fontSize: "10px" }}>{a.time}</span>}
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 600, color: "var(--noir)" }}>
                                      {a.nom ?? "—"}
                                    </span>
                                    {showBadge && (
                                      <span style={{
                                        display: "inline-flex", alignItems: "center", gap: "4px",
                                        background: "#fff3cd", color: "#a07800",
                                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
                                        padding: "2px 7px", textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                      }}>
                                        <UsersThree size={11} weight="fill" />
                                        n°{posInGroup + 1}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "var(--grey)" }}>
                                    {svc?.label ?? a.service}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 600, color: "var(--lavender-dark)" }}>
                                  {fmtFCFA(a.price)}
                                </span>
                                {/* × visible uniquement sur desktop */}
                                <button onClick={() => handleDelete(a.id)} className="admin-btn-remove admin-delete-desktop" style={{
                                  fontFamily: "var(--font-dm-sans)", fontSize: "13px",
                                  color: "rgba(0,0,0,0.2)", background: "none", border: "none",
                                  cursor: "pointer", padding: "0 2px", lineHeight: 1, transition: "color 0.2s",
                                }}>×</button>
                              </div>
                            </div>
                          </div>
                        );
                      });})()}
                    </div>
                  </>
                )}
              </div>

              {/* ── Graphique ───────────────────────────────────────── */}
              <div style={{ background: "var(--white)", border: "1px solid rgba(0,0,0,0.07)", padding: "32px 40px" }}>

                {/* Header + sélecteur de plage */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                  <p style={{
                    fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
                    letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--grey)",
                    display: "flex", alignItems: "center", gap: "12px", margin: 0,
                  }}>
                    <span style={{ width: "20px", height: "1px", background: "var(--grey-light)" }} />
                    Graphique
                  </p>
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", padding: "3px", overflowX: "auto", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"] }}>
                    {([
                      ["semaine", "Semaine"],
                      ["mois",    "Mois"],
                      ["3mois",   "3 mois"],
                      ["6mois",   "6 mois"],
                      ["annee",   "Année"],
                    ] as const).map(([val, label]) => (
                      <button key={val} onClick={() => setChartRange(val)} style={{
                        fontFamily:    "var(--font-dm-sans)",
                        fontSize:      "11px",
                        fontWeight:    chartRange === val ? 700 : 400,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        whiteSpace:    "nowrap",
                        color:         chartRange === val ? "var(--noir)" : "var(--grey)",
                        background:    chartRange === val ? "var(--white)" : "none",
                        border:        "none",
                        padding:       "6px 14px",
                        cursor:        "pointer",
                        boxShadow:     chartRange === val ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        transition:    "all 0.18s",
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Courbe SVG */}
                {(() => {
                  const VW = 800, VH = 220, PX = 16, PY = 30;
                  const cW = VW - PX * 2;
                  const cH = VH - PY * 2;
                  const pts = bars.map((b, i) => ({
                    x: bars.length === 1 ? VW / 2 : PX + (i / (bars.length - 1)) * cW,
                    y: PY + cH - (b.revenue / maxRev) * cH,
                    ...b,
                  }));
                  let linePath = "";
                  if (pts.length >= 2) {
                    linePath = `M ${pts[0].x} ${pts[0].y}`;
                    for (let i = 1; i < pts.length; i++) {
                      const p0 = pts[i - 1], p1 = pts[i];
                      const cpx = (p0.x + p1.x) / 2;
                      linePath += ` C ${cpx},${p0.y} ${cpx},${p1.y} ${p1.x},${p1.y}`;
                    }
                  }
                  const fillPath = linePath
                    ? linePath + ` L ${pts[pts.length-1].x},${PY+cH} L ${pts[0].x},${PY+cH} Z`
                    : "";
                  const dotDelay = (i: number) => `${0.55 + i * (0.3 / Math.max(pts.length - 1, 1))}s`;
                  return (
                    <svg key={chartRange} viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "auto", display: "block", marginBottom: "10px", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="lgFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#C9A8E0" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#C9A8E0" stopOpacity="0.01" />
                        </linearGradient>
                      </defs>
                      {/* Grid */}
                      {[0.25, 0.5, 0.75].map(t => (
                        <line key={t} x1={PX} y1={PY + cH*(1-t)} x2={VW-PX} y2={PY + cH*(1-t)}
                          stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                      ))}
                      {/* Fill — apparaît après la courbe */}
                      {fillPath && (
                        <path d={fillPath} fill="url(#lgFill)"
                          style={{ opacity: 0, animation: "chartFadeIn 0.4s ease 0.6s forwards" }} />
                      )}
                      {/* Courbe — se trace de gauche à droite */}
                      {linePath && (
                        <path d={linePath} fill="none" stroke="#C9A8E0" strokeWidth="3"
                          strokeLinecap="round" strokeLinejoin="round"
                          pathLength="1" strokeDasharray="1" strokeDashoffset="1"
                          style={{ animation: "drawCurve 0.7s cubic-bezier(0.4,0,0.2,1) forwards" }} />
                      )}
                      {/* Dots + zone de clic — en cascade après la courbe */}
                      {pts.map((p, i) => (
                        <g key={i}
                          style={{ cursor: "pointer", opacity: 0, animation: `chartFadeIn 0.25s ease ${dotDelay(i)} forwards` }}
                          onMouseEnter={() => setActivePoint(i)}
                          onMouseLeave={() => setActivePoint(null)}
                          onPointerDown={(e) => { if (e.pointerType === "touch") setActivePoint(activePoint === i ? null : i); }}
                        >
                          <circle cx={p.x} cy={p.y} r={18} fill="transparent" />
                          <circle cx={p.x} cy={p.y}
                            r={activePoint === i ? 7 : (p.isCurrent ? 6 : 4.5)}
                            fill={p.isCurrent ? "#9B72C8" : "#C9A8E0"}
                            stroke="white" strokeWidth="2.5"
                            style={{ transition: "r 0.15s" }}
                          />
                        </g>
                      ))}
                      {/* Tooltip */}
                      {activePoint !== null && (() => {
                        const p = pts[activePoint];
                        const tw = 110, th = 32;
                        const tx = Math.min(Math.max(p.x - tw / 2, PX), VW - PX - tw);
                        const ty = p.y - th - 14;
                        return (
                          <g style={{ pointerEvents: "none" }}>
                            <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="#1a1a1a" />
                            <text x={tx + tw / 2} y={ty + th / 2 + 5} textAnchor="middle"
                              fill="white" fontSize="13" fontFamily="DM Sans, sans-serif" fontWeight="600">
                              {p.clients} client{p.clients > 1 ? "s" : ""}
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  );
                })()}

                {/* Labels axe X */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "28px" }}>
                  {bars.map((b, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <span style={{
                        fontFamily:    "var(--font-dm-sans)",
                        fontSize:      bars.length > 6 ? "8px" : "9px",
                        fontWeight:    b.isCurrent ? 700 : 400,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color:         b.isCurrent ? "var(--noir)" : "var(--grey)",
                      }}>{b.label}</span>
                    </div>
                  ))}
                </div>

                {/* Tableau récap sous le graphe */}
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
                  {bars.filter(b => b.clients > 0).map((b, i, arr) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    }}>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: b.isCurrent ? 700 : 500, color: b.isCurrent ? "var(--noir)" : "var(--noir)", width: "90px", textTransform: "capitalize" }}>{b.label}</span>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "var(--grey)" }}>{b.clients} cliente{b.clients > 1 ? "s" : ""}</span>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 700, color: "var(--lavender-dark)" }}>{fmtFCFA(b.revenue)}</span>
                    </div>
                  ))}
                  {bars.every(b => b.clients === 0) && (
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "rgba(0,0,0,0.28)", fontStyle: "italic", margin: 0 }}>
                      Aucune prestation sur cette période.
                    </p>
                  )}
                </div>
              </div>

            </div>
          );
        })()}

        {/* ══ RESERVATIONS TAB ═════════════════════════════════════════ */}
      </main>

      <style>{`
        @keyframes adminPageIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes drawCurve {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes chartFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .admin-btn-primary { transition: background 0.25s ease, transform 0.2s ease !important; }
        .admin-btn-primary:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
        .admin-btn-secondary { transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease !important; }
        .admin-btn-secondary:hover { background: var(--noir) !important; color: var(--white) !important; transform: translateY(-2px); }
        .admin-btn-remove:hover { color: #c0392b !important; }
        .admin-nav-btn {
          font-family: var(--font-dm-sans); font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--grey);
          background: none; border: none; cursor: pointer; padding: 0;
          transition: color 0.2s;
        }
        .admin-nav-btn:hover { color: var(--noir); }
        .admin-conges-row { display: flex; gap: 10px; margin-bottom: 16px; align-items: stretch; width: 100%; box-sizing: border-box; }
        .admin-conges-controls { display: flex; gap: 10px; align-items: stretch; }
        .swipe-delete-btn { display: none; }
        @media (max-width: 768px) {
          .swipe-delete-btn { display: flex; }
          .admin-delete-desktop { display: none !important; }
        }
        @media (max-width: 600px) {
          .admin-section { padding: 24px 20px !important; overflow: hidden; }
          .admin-section-content { padding-left: 0 !important; }
          .admin-day-row { gap: 12px !important; }
          .admin-time-input { width: 90px !important; font-size: 12px !important; padding: 6px 4px 6px 8px !important; }
          .admin-conges-row { flex-direction: column; gap: 8px; }
          .admin-conges-row input[type="date"] { width: 100% !important; box-sizing: border-box; min-height: 44px; display: block; }
          .admin-conges-controls { justify-content: space-between; width: 100%; box-sizing: border-box; }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-section" style={{
      background:   "var(--white)",
      border:       "1px solid rgba(0,0,0,0.07)",
      padding:      "36px 40px",
      marginBottom: "2px",
    }}>
      <p style={{
        fontFamily:    "var(--font-dm-sans)",
        fontSize:      "10px",
        fontWeight:    700,
        letterSpacing: "0.26em",
        textTransform: "uppercase",
        color:         "var(--grey)",
        display:       "flex",
        alignItems:    "center",
        gap:           "12px",
        margin:        "0 0 6px",
      }}>
        <span style={{ width: "20px", height: "1px", background: "var(--grey-light)", flexShrink: 0 }} />
        {label}
      </p>
      {description && (
        <p style={{
          fontFamily:  "var(--font-dm-sans)",
          fontSize:    "12px",
          color:       "var(--grey)",
          margin:      "0 0 28px",
          lineHeight:  1.7,
          paddingLeft: "32px",
        }}>{description}</p>
      )}
      <div className="admin-section-content" style={{ paddingLeft: "32px" }}>{children}</div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? "Désactiver" : "Activer"}
      style={{
        width:      "38px",
        height:     "20px",
        borderRadius: "10px",
        border:     "none",
        cursor:     "pointer",
        padding:    "2px",
        background: on ? "var(--noir)" : "rgba(0,0,0,0.12)",
        transition: "background 0.22s ease",
        flexShrink: 0,
      }}
    >
      <span style={{
        display:      "block",
        width:        "16px",
        height:       "16px",
        borderRadius: "50%",
        background:   "var(--white)",
        boxShadow:    "0 1px 3px rgba(0,0,0,0.25)",
        transform:    on ? "translateX(18px)" : "translateX(0)",
        transition:   "transform 0.22s ease",
      }} />
    </button>
  );
}

function TimeInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className}
      style={{
        fontFamily:    "var(--font-dm-sans)",
        fontSize:      "13px",
        fontWeight:    600,
        color:         "var(--noir)",
        background:    "var(--cream)",
        border:        "1.5px solid rgba(0,0,0,0.1)",
        padding:       "7px 6px 7px 10px",
        outline:       "none",
        width:         "120px",
        cursor:        "pointer",
        letterSpacing: "0.04em",
        boxSizing:     "border-box",
      }}
    />
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ pwd, setPwd, error, onSubmit }: {
  pwd:      string;
  setPwd:   (v: string) => void;
  error:    boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  function goHome() {
    sessionStorage.setItem("anto-skip-preloader", "1");
    router.push("/#hero");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", position: "relative" }}>

      {/* Grille qui s'estompe depuis le coin haut gauche */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(to right, #d1d5db 1px, transparent 1px),
          linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
        maskImage: "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
      }} />

      <div style={{ position: "fixed", top: "24px", left: "clamp(20px, 5vw, 48px)", zIndex: 10 }}>
        <Link href="/" style={{ display: "block" }}>
          <Image src="/logo-anto.png" alt="Anto Nail" width={110} height={46}
            style={{ objectFit: "contain", display: "block" }} />
        </Link>
      </div>

      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "100vh",
        padding:        "100px clamp(20px, 5vw, 48px) 60px",
        position:       "relative",
        zIndex:         1,
      }}>
        <div style={{ maxWidth: "440px", width: "100%" }}>

          <div style={{ marginBottom: "40px" }}>
            <CrownSimple size={48} weight="fill" color="var(--lavender)" />
          </div>

          <p style={{
            fontFamily:    "var(--font-dm-sans)",
            fontSize:      "10px",
            fontWeight:    700,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color:         "var(--grey)",
            display:       "flex",
            alignItems:    "center",
            gap:           "12px",
            margin:        "0 0 20px",
          }}>
            Espace administrateur
          </p>

          <h1 style={{
            fontFamily:    "var(--font-dm-sans)",
            fontSize:      "clamp(52px, 10vw, 72px)",
            fontWeight:    700,
            letterSpacing: "-0.04em",
            lineHeight:    0.95,
            color:         "var(--noir)",
            margin:        "0 0 52px",
          }}>
            Bienvenue,<br />
            <span style={{ color: "var(--lavender-dark)" }}>Anto.</span>
          </h1>

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: "16px" }}>
              {/* Input wrapper for eye toggle */}
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  autoFocus
                  style={{
                    fontFamily:  "var(--font-dm-sans)",
                    fontSize:    "14px",
                    color:       "var(--noir)",
                    background:  "var(--white)",
                    border:      error ? "1.5px solid rgba(192,57,43,0.5)" : "1.5px solid rgba(0,0,0,0.12)",
                    padding:     "14px 48px 14px 18px",
                    outline:     "none",
                    width:       "100%",
                    transition:  "border-color 0.2s",
                    boxSizing:   "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  style={{
                    position:   "absolute",
                    right:      "14px",
                    top:        "50%",
                    transform:  "translateY(-50%)",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    padding:    "4px",
                    color:      "var(--grey)",
                    display:    "flex",
                    alignItems: "center",
                  }}
                >
                  {showPwd
                    ? <EyeClosed size={18} weight="light" />
                    : <Eye size={18} weight="light" />
                  }
                </button>
              </div>

              {error && (
                <p style={{
                  fontFamily:    "var(--font-dm-sans)",
                  fontSize:      "11px",
                  fontWeight:    700,
                  letterSpacing: "0.06em",
                  color:         "#c0392b",
                  margin:        "8px 0 0",
                }}>Mot de passe incorrect.</p>
              )}
            </div>

            <button
              type="submit"
              className="admin-btn-primary"
              style={{ ...btnPrimary, width: "100%", textAlign: "center" }}
            >
              Accéder
            </button>
          </form>

          <button
            type="button"
            onClick={goHome}
            style={{
              display:       "inline-block",
              marginTop:     "28px",
              fontFamily:    "var(--font-dm-sans)",
              fontSize:      "11px",
              fontWeight:    700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         "rgba(0,0,0,0.28)",
              background:    "none",
              border:        "none",
              cursor:        "pointer",
              padding:       0,
              transition:    "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--grey)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,0,0,0.28)")}
          >
            ← Retour au site
          </button>
        </div>
      </div>

      <style>{`
        .admin-btn-primary { transition: background 0.25s ease, transform 0.2s ease !important; }
        .admin-btn-primary:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
