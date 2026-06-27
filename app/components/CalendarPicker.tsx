"use client";

import { useState, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type DaySchedule = { enabled: boolean; open: string; close: string };
type ApiData     = { schedule: Record<string, DaySchedule>; blocked: string[] };

// ─── Constants ──────────────────────────────────────────────────────────────

const MONTHS  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAY_KEYS = ["dim","lun","mar","mer","jeu","ven","sam"]; // index 0 = dimanche (JS)
const SLOT_MIN = 90; // durée d'un créneau en minutes

const DEFAULT_API: ApiData = {
  schedule: {
    lun: { enabled: true,  open: "09:00", close: "18:00" },
    mar: { enabled: true,  open: "09:00", close: "18:00" },
    mer: { enabled: true,  open: "09:00", close: "18:00" },
    jeu: { enabled: true,  open: "09:00", close: "18:00" },
    ven: { enabled: true,  open: "09:00", close: "18:00" },
    sam: { enabled: true,  open: "09:00", close: "17:00" },
    dim: { enabled: false, open: "09:00", close: "18:00" },
  },
  blocked: [],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getSlots(open: string, close: string): string[] {
  const parse = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const slots: string[] = [];
  for (let t = parse(open); t + SLOT_MIN <= parse(close); t += SLOT_MIN)
    slots.push(`${String(Math.floor(t / 60)).padStart(2,"0")}:${String(t % 60).padStart(2,"0")}`);
  return slots;
}

function isBlocked(iso: string, patterns: string[]): boolean {
  const mmdd = iso.slice(5);
  return patterns.some(p => p === iso || p === mmdd);
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dow = first.getDay(); // 0=Sun
  const offset = dow === 0 ? 6 : dow - 1; // décalage pour semaine lun-dim
  const grid: (Date | null)[] = Array(offset).fill(null);
  for (let i = 1; i <= totalDays; i++) grid.push(new Date(year, month, i));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CalendarPicker({
  value,
  onChange,
}: {
  value: { date: string; time: string };
  onChange: (date: string, time: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [api,       setApi]       = useState<ApiData>(DEFAULT_API);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then(r => r.json())
      .then((d: ApiData) => { setApi(d); setLoading(false); })
      .catch(() => { setApi(DEFAULT_API); setLoading(false); });
  }, []);

  function isAvailable(d: Date): boolean {
    if (d < today) return false;
    const ds = api.schedule[DAY_KEYS[d.getDay()]];
    if (!ds?.enabled) return false;
    return !isBlocked(toISO(d), api.blocked);
  }

  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const grid = buildGrid(viewYear, viewMonth);

  // Créneaux pour la date sélectionnée
  const selectedKey = value.date ? DAY_KEYS[new Date(value.date + "T12:00:00").getDay()] : null;
  const selectedDS  = selectedKey ? api.schedule[selectedKey] : null;
  const slots       = selectedDS ? getSlots(selectedDS.open, selectedDS.close) : [];

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
    letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--grey)", margin: 0,
  };

  return (
    <div>
      {/* ── En-tête section ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <span style={{ width: "28px", height: "1px", background: "rgba(0,0,0,0.14)", flexShrink: 0 }} />
        <p style={labelStyle}>Date & horaire</p>
      </div>

      <div style={{ border: "1.5px solid rgba(0,0,0,0.10)", background: "#fff" }}>

        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "var(--grey)", letterSpacing: "0.1em" }}>
              Chargement des disponibilités…
            </span>
          </div>
        ) : (
          <>
            {/* Navigation mois */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 20px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)",
            }}>
              <button
                type="button" onClick={prevMonth} disabled={!canGoPrev}
                style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "18px", lineHeight: 1,
                  background: "none", border: "none",
                  color: canGoPrev ? "var(--noir)" : "rgba(0,0,0,0.15)",
                  cursor: canGoPrev ? "pointer" : "default",
                  padding: "4px 10px",
                }}
              >‹</button>

              <span style={{
                fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--noir)",
              }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>

              <button
                type="button" onClick={nextMonth}
                style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "18px", lineHeight: 1,
                  background: "none", border: "none",
                  color: "var(--noir)", cursor: "pointer", padding: "4px 10px",
                }}
              >›</button>
            </div>

            {/* En-têtes jours */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              padding: "12px 12px 6px",
            }}>
              {["L","M","M","J","V","S","D"].map((d, i) => (
                <div key={i} style={{
                  textAlign: "center",
                  fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: i >= 5 ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.4)",
                  paddingBottom: "6px",
                }}>{d}</div>
              ))}
            </div>

            {/* Grille des jours */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              padding: "0 12px 16px", gap: "2px",
            }}>
              {grid.map((day, i) => {
                if (!day) return <div key={i} />;
                const iso       = toISO(day);
                const available = isAvailable(day);
                const selected  = value.date === iso;
                const isToday   = iso === todayISO;
                const isWE      = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!available}
                    onClick={() => onChange(selected ? "" : iso, "")}
                    style={{
                      fontFamily: "var(--font-dm-sans)", fontSize: "13px",
                      fontWeight: selected ? 700 : 400,
                      color: !available
                        ? "rgba(0,0,0,0.18)"
                        : selected ? "#fff"
                        : isToday  ? "var(--lavender-dark)"
                        : isWE     ? "rgba(0,0,0,0.45)"
                        : "var(--noir)",
                      background:  selected ? "var(--noir)"     : "transparent",
                      border:     !selected && isToday ? "1px solid var(--lavender)" : "1px solid transparent",
                      padding:    "10px 4px",
                      cursor:     available ? "pointer" : "default",
                      textAlign:  "center",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    className={available && !selected ? "cal-day-btn" : ""}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Créneaux horaires */}
            {value.date && slots.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", padding: "18px 20px 20px" }}>
                <p style={{ ...labelStyle, marginBottom: "12px" }}>Choisir un horaire</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {slots.map(slot => {
                    const sel = value.time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => onChange(value.date, slot)}
                        style={{
                          fontFamily: "var(--font-dm-sans)", fontSize: "13px",
                          fontWeight: sel ? 700 : 400,
                          color:      sel ? "#fff" : "var(--noir)",
                          background: sel ? "var(--noir)" : "#fff",
                          border:     "1px solid rgba(0,0,0,0.14)",
                          padding:    "9px 18px",
                          cursor:     "pointer",
                          transition: "background 0.12s, color 0.12s",
                          letterSpacing: "0.04em",
                        }}
                        className={!sel ? "cal-slot-btn" : ""}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message si aucun créneau dispo ce jour-là */}
            {value.date && slots.length === 0 && (
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", padding: "18px 20px 20px" }}>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "var(--grey)", margin: 0 }}>
                  Aucun créneau disponible ce jour-là.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .cal-day-btn:hover  { background: var(--lavender-light) !important; color: var(--noir) !important; }
        .cal-slot-btn:hover { background: var(--lavender-light) !important; }
      `}</style>
    </div>
  );
}
