"use client";

import { useState } from "react";
import { CalendarPicker } from "./CalendarPicker";
import { WarningCircle, CalendarX, CheckFat, Timer } from "@phosphor-icons/react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const SERVICES = [
  "Pose Gel, dès39 000 FCFA",
  "Nail Art, dès52 000 FCFA",
  "Baby Boomer, dès49 000 FCFA",
  "Dépose & Soin, dès23 000 FCFA",
  "Manucure, dès30 000 FCFA",
  "Semi-Permanent, dès33 000 FCFA",
];

type Status = "idle" | "loading" | "success" | "error";
type ConflictInfo = { count: number; date: string; time: string };

function PonctualiteBanner() {
  return (
    <div style={{
      position: "relative",
      border: "1px solid rgba(155, 114, 200, 0.22)",
      padding: "22px 22px 22px 22px",
      background: "linear-gradient(135deg, rgba(201,168,224,0.07) 0%, transparent 70%)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Icône */}
        <div style={{
          width: "40px", height: "40px", flexShrink: 0,
          background: "rgba(155, 114, 200, 0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Timer size={20} weight="duotone" color="#9B72C8" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Label + badge */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "8px", marginBottom: "10px",
          }}>
            <p style={{
              fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--grey)", margin: 0,
            }}>
              Politique de ponctualité
            </p>
            <span style={{
              fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.06em", color: "#9B72C8",
              background: "rgba(155, 114, 200, 0.10)",
              padding: "3px 10px", whiteSpace: "nowrap",
            }}>
              +1 000FCFA
            </span>
          </div>

          {/* Texte */}
          <p style={{
            fontFamily: "var(--font-dm-sans)", fontSize: "12.5px",
            lineHeight: 1.75, color: "var(--grey)", margin: 0,
          }}>
            Tout retard non signalé entraîne automatiquement un supplément de{" "}
            <strong style={{ color: "var(--noir)", fontWeight: 600, whiteSpace: "nowrap" }}>1 000FCFA</strong>{" "}
            sur le tarif de votre séance. Merci de me prévenir dès que possible en cas d&apos;empêchement.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactSection() {
  const [form, setForm] = useState({
    nom: "",
    prestation: "",
    message: "",
  });
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [booking, setBooking] = useState({ date: "", time: "" });
  const [confirmed, setConfirmed] = useState<{ prestation: string; date: string; time: string; withConflict?: boolean } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  function resizeAndEncode(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas
            .getContext("2d")!
            .drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function doSubmit(withConflict = false) {
    setConflict(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          whatsapp: phone ?? "",
          date: booking.date,
          time: booking.time,
          image: imageBase64,
        }),
      });
      if (res.ok) {
        setConfirmed({ prestation: form.prestation.split(",")[0], date: booking.date, time: booking.time, withConflict });
        setStatus("success");
        setForm({ nom: "", prestation: "", message: "" });
        setPhone(undefined);
        setBooking({ date: "", time: "" });
        setImagePreview(null);
        setImageBase64(null);
        setAccepted(false);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!accepted) {
      setCheckError(true);
      return;
    }
    setCheckError(false);

    // Vérification de conflit si date + heure sélectionnées
    if (booking.date && booking.time) {
      try {
        const res = await fetch(`/api/appointments?date=${booking.date}&time=${encodeURIComponent(booking.time)}`);
        const { count } = await res.json();
        if (count > 0) {
          setConflict({ count, date: booking.date, time: booking.time });
          return;
        }
      } catch {
        // En cas d'erreur réseau, on laisse passer
      }
    }

    await doSubmit();
  };

  return (
    <section
      id="contact"
      className="contact-section"
      style={{
        background: "var(--white)",
        padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 48px)",
        position: "relative",
        zIndex: 30,
      }}
    >
      <div
        className="contact-grid"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "start",
        }}
      >
        {/* Left — heading */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--grey)",
              margin: "0 0 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "1px",
                background: "var(--grey-light)",
                flexShrink: 0,
              }}
            />
            Rendez-vous
          </p>

          <h2
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "clamp(36px, 4.5vw, 64px)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.035em",
              color: "var(--noir)",
              margin: "0 0 28px",
            }}
          >
            Réservez
            <br />
            votre séance
          </h2>

          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.8,
              color: "var(--grey)",
              margin: "0 0 40px",
              maxWidth: "340px",
            }}
          >
            Remplissez le formulaire et je vous recontacte sur WhatsApp pour
            confirmer votre créneau.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {["Dakar, Sénégal", "Sur rendez-vous uniquement"].map((label) => (
              <p
                key={label}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "var(--grey)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    background: "var(--lavender)",
                    flexShrink: 0,
                  }}
                />
                {label}
              </p>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div>
          {status === "success" ? (
            <div style={{
              background: "var(--cream)",
              borderLeft: "3px solid var(--lavender)",
              padding: "44px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              animation: "fadeConfirm 0.4s ease both",
            }}>
              {/* Label */}
              <p style={{
                fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--grey)",
                display: "flex", alignItems: "center", gap: "12px", margin: "0 0 28px",
              }}>
                <span style={{ width: "20px", height: "1px", background: "var(--grey-light)", flexShrink: 0 }} />
                Confirmation
              </p>

              {/* Headline */}
              <h3 style={{
                fontFamily: "var(--font-dm-sans)", fontSize: "clamp(32px, 4vw, 44px)",
                fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.0,
                color: "var(--noir)", margin: "0 0 28px",
              }}>
                Demande<br />bien reçue.
              </h3>

              {/* Récap créneau si choisi */}
              {confirmed?.date && (
                <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "var(--noir)", fontWeight: 600, margin: 0 }}>
                    {new Date(confirmed.date + "T12:00:00").toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                    {confirmed.time ? ` à ${confirmed.time}` : ""}
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "var(--grey)", margin: 0 }}>
                    {confirmed.prestation}
                  </p>
                </div>
              )}

              {/* Message */}
              <p style={{
                fontFamily: "var(--font-dm-sans)", fontSize: "13.5px",
                lineHeight: 1.75, color: "var(--grey)", margin: "0 0 32px",
              }}>
                {confirmed?.withConflict
                  ? "Je vous ferai signe sur WhatsApp dès que la séance précédente est terminée et que c'est votre tour."
                  : "Je vous recontacte sur WhatsApp dans les meilleurs délais pour confirmer votre créneau."}
              </p>

              {/* CTA */}
              <button
                onClick={() => { setStatus("idle"); setConfirmed(null); }}
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "var(--noir)", background: "none", border: "none",
                  cursor: "pointer", padding: 0,
                  borderBottom: "1px solid var(--noir)",
                  paddingBottom: "2px",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.5")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Faire une nouvelle demande →
              </button>

              <style>{`.fadeConfirm { } @keyframes fadeConfirm { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Nom */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  htmlFor="nom"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--noir)",
                  }}
                >
                  Nom et prénom{" "}
                  <span style={{ color: "var(--lavender-dark)" }}>*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Votre nom et prénom"
                  className="contact-input"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "var(--noir)",
                    background: "var(--cream)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "14px 16px",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>

              {/* WhatsApp */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--noir)",
                  }}
                >
                  Numéro WhatsApp <span style={{ color: "var(--lavender-dark)" }}>*</span>
                </label>
                <PhoneInput
                  international
                  defaultCountry="SN"
                  value={phone}
                  onChange={setPhone}
                  className="phone-input-wrapper"
                />
              </div>

              {/* Prestation */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  htmlFor="prestation"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--noir)",
                  }}
                >
                  Prestation souhaitée{" "}
                  <span style={{ color: "var(--lavender-dark)" }}>*</span>
                </label>
                <select
                  id="prestation"
                  name="prestation"
                  required
                  value={form.prestation}
                  onChange={handleChange}
                  className="contact-input"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: form.prestation ? "var(--noir)" : "var(--grey)",
                    background: "var(--cream)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "14px 16px",
                    outline: "none",
                    width: "100%",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled>
                    Choisir une prestation
                  </option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendrier */}
              <CalendarPicker
                value={booking}
                onChange={(date, time) => setBooking({ date, time })}
              />
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  color: "var(--grey)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Les jours grisés correspondent à mes indisponibilités et les
                horaires affichés correspondent à mes créneaux disponibles.
              </p>

              {/* Message */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  htmlFor="message"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--noir)",
                  }}
                >
                  Précisions{" "}
                  <span
                    style={{
                      color: "var(--grey-light)",
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    optionnel
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Inspirations, longueur souhaitée, questions…"
                  rows={4}
                  className="contact-input"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "var(--noir)",
                    background: "var(--cream)",
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "14px 16px",
                    outline: "none",
                    width: "100%",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Import image inspiration */}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--grey)",
                    margin: "0 0 10px",
                    lineHeight: 1.6,
                  }}
                >
                  Vous avez un modèle en tête ? Importez une image de référence{" "}
                  <span style={{ color: "var(--grey-light)" }}>
                    (optionnel)
                  </span>
                </p>
                <input
                  type="file"
                  id="inspiration"
                  name="inspiration"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const b64 = await resizeAndEncode(file);
                      setImageBase64(b64);
                      setImagePreview(b64);
                    }
                  }}
                />
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <label
                    htmlFor="inspiration"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--noir)",
                      border: "1px solid rgba(0,0,0,0.15)",
                      padding: "10px 16px",
                      background: "var(--cream)",
                      transition:
                        "border-color 0.2s ease, background 0.2s ease",
                      flexShrink: 0,
                    }}
                    className="upload-btn"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span id="inspiration-label">Importer une image</span>
                  </label>

                  {imagePreview && (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2d7a3a"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div
                        className="img-preview-wrap"
                        style={{
                          position: "relative",
                          height: "39px",
                          width: "39px",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          style={{
                            height: "39px",
                            width: "39px",
                            objectFit: "cover",
                            border: "1px solid rgba(0,0,0,0.10)",
                            display: "block",
                          }}
                        />
                        <button
                          type="button"
                          className="img-remove-btn"
                          onClick={() => {
                            setImagePreview(null);
                            setImageBase64(null);
                            const input = document.getElementById(
                              "inspiration",
                            ) as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: "var(--noir)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                          }}
                          aria-label="Supprimer l'image"
                        >
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 10 10"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <line x1="2" y1="2" x2="8" y2="8" />
                            <line x1="8" y1="2" x2="2" y2="8" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bannière ponctualité */}
              <PonctualiteBanner />

              {/* Checkbox */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked);
                      if (e.target.checked) setCheckError(false);
                    }}
                    style={{
                      width: "16px",
                      height: "16px",
                      flexShrink: 0,
                      marginTop: "2px",
                      cursor: "pointer",
                      accentColor: "var(--noir)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: "var(--grey)",
                    }}
                  >
                    J&apos;ai lu et j&apos;accepte la politique de ponctualité :
                    tout retard non signalé entraîne un supplément de 1 000
                    FCFA.
                  </span>
                </label>

                {checkError && (
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#c0392b",
                      margin: 0,
                    }}
                  >
                    Veuillez accepter la politique de ponctualité avant
                    d&apos;envoyer votre demande.
                  </p>
                )}
              </div>

              {status === "error" && (
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "13px",
                    color: "#c0392b",
                    margin: 0,
                  }}
                >
                  Une erreur est survenue. Réessayez ou contactez-moi sur
                  Instagram.
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="contact-submit"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--white)",
                  background: "var(--noir)",
                  border: "none",
                  padding: "18px 32px",
                  cursor: status === "loading" ? "wait" : "pointer",
                  alignSelf: "flex-start",
                  opacity: status === "loading" ? 0.6 : 1,
                  transition: "background 0.25s ease, opacity 0.25s ease",
                }}
              >
                {status === "loading"
                  ? "Envoi en cours…"
                  : "Envoyer ma demande"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal conflit de créneau */}
      {conflict && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
          animation: "conflictIn 0.25s ease",
        }}>
          <div style={{
            background: "var(--white)",
            maxWidth: "480px", width: "100%",
            padding: "40px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            animation: "conflictSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            {/* Icône + titre */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
              <WarningCircle size={36} weight="duotone" color="var(--lavender-dark)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--lavender-dark)",
                  margin: "0 0 6px",
                }}>Créneau partagé</p>
                <h3 style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "22px", fontWeight: 700,
                  letterSpacing: "-0.02em", color: "var(--noir)", margin: 0, lineHeight: 1.1,
                }}>
                  {conflict.count === 1
                    ? "1 personne a déjà ce créneau"
                    : `${conflict.count} personnes ont déjà ce créneau`}
                </h3>
              </div>
            </div>

            {/* Corps */}
            <div style={{
              background: "var(--cream)", padding: "20px 22px",
              marginBottom: "28px",
            }}>
              <p style={{
                fontFamily: "var(--font-dm-sans)", fontSize: "14px",
                lineHeight: 1.75, color: "var(--grey)", margin: "0 0 10px",
              }}>
                Vous serez la{" "}
                <strong style={{ color: "var(--noir)" }}>
                  {conflict.count + 1}ème
                </strong>{" "}
                personne à réserver le{" "}
                <strong style={{ color: "var(--noir)" }}>
                  {new Date(conflict.date + "T12:00:00").toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long",
                  })} à {conflict.time}
                </strong>.
              </p>
              <p style={{
                fontFamily: "var(--font-dm-sans)", fontSize: "13px",
                lineHeight: 1.7, color: "var(--grey)", margin: 0,
              }}>
                Votre heure de début sera décalée le temps que la séance précédente se termine.
                Si vous confirmez, je vous ferai signe sur WhatsApp dès que je serai disponible pour vous accueillir.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => doSubmit(true)}
                style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "var(--white)", background: "var(--noir)",
                  border: "none", padding: "16px 24px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--lavender-dark)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--noir)")}
              >
                <CheckFat size={16} weight="fill" />
                Confirmer mon rendez-vous
              </button>
              <button
                onClick={() => setConflict(null)}
                style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 600,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--grey)", background: "none",
                  border: "1px solid rgba(0,0,0,0.15)", padding: "14px 24px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--noir)"; e.currentTarget.style.borderColor = "var(--noir)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--grey)"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; }}
              >
                <CalendarX size={16} />
                Choisir un autre créneau
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .phone-input-wrapper { display: flex; align-items: center; background: var(--cream); border: 1px solid rgba(0,0,0,0.12); }
        .phone-input-wrapper:focus-within { border-color: var(--lavender-dark); }
        .phone-input-wrapper .PhoneInputCountry { padding: 0 10px 0 14px; border-right: 1px solid rgba(0,0,0,0.10); }
        .phone-input-wrapper .PhoneInputCountrySelect { background: transparent; border: none; outline: none; cursor: pointer; font-size: 14px; }
        .phone-input-wrapper .PhoneInputInput { font-family: var(--font-dm-sans); font-size: 14px; font-weight: 400; color: var(--noir); background: transparent; border: none; outline: none; padding: 14px 16px; width: 100%; }
        .phone-input-wrapper .PhoneInputInput::placeholder { color: var(--grey-light); }
        .contact-input:focus { border-color: var(--lavender-dark) !important; }
        .contact-input::placeholder { color: var(--grey-light); }
        .upload-btn:hover { border-color: var(--lavender-dark) !important; background: var(--lavender-light) !important; }
        .img-remove-btn { opacity: 0; transition: opacity 0.2s ease; }
        .img-preview-wrap:hover .img-remove-btn { opacity: 1; }
        @media (max-width: 1023px) { .img-remove-btn { opacity: 1 !important; } }
        .contact-submit:hover { background: var(--lavender-dark) !important; }
        @keyframes conflictIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes conflictSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
