"use client";

import { useState } from "react";

const SERVICES = [
  "Pose Gel, dès39 000 FCFA",
  "Nail Art, dès52 000 FCFA",
  "Baby Boomer, dès49 000 FCFA",
  "Dépose & Soin, dès23 000 FCFA",
  "Manucure, dès30 000 FCFA",
  "Semi-Permanent, dès33 000 FCFA",
];

type Status = "idle" | "loading" | "success" | "error";

function PonctualiteBanner() {
  return (
    <div
      style={{
        background: "var(--cream)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderLeft: "3px solid var(--amber)",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
      }}
    >
      {/* Left — chiffre */}
      <div
        style={{
          padding: "24px 28px",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          minWidth: "100px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "30px",
            fontWeight: 700,
            color: "var(--amber)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          +1 000
        </span>
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--amber)",
          }}
        >
          FCFA
        </span>
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--grey-light)",
            textAlign: "center",
            lineHeight: 1.4,
            marginTop: "4px",
          }}
        >
          SUPPLÉMENT
          <br />
          RETARD
        </span>
      </div>

      {/* Right — texte */}
      <div style={{ padding: "24px 28px" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--grey)",
            margin: "0 0 10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "20px",
              height: "1px",
              background: "var(--grey-light)",
              flexShrink: 0,
            }}
          />
          Règle importante
        </p>
        <h3
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "clamp(14px, 1.4vw, 17px)",
            fontWeight: 700,
            color: "var(--noir)",
            margin: "0 0 12px",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Politique de ponctualité
        </h3>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12.5px",
            fontWeight: 400,
            lineHeight: 1.8,
            color: "var(--grey)",
            margin: "0 0 6px",
          }}
        >
          Votre temps et celui des autres clientes sont précieux.
        </p>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12.5px",
            fontWeight: 600,
            lineHeight: 1.8,
            color: "var(--noir)",
            margin: "0 0 6px",
          }}
        >
          Tout retard non signalé entraîne automatiquement un supplément de 1
          000 FCFA sur le tarif de votre séance.
        </p>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12.5px",
            fontWeight: 400,
            lineHeight: 1.8,
            color: "var(--grey)",
            margin: 0,
          }}
        >
          Merci de me prévenir dès que possible en cas d&apos;empêchement.
        </p>
      </div>
    </div>
  );
}

export function ContactSection() {
  const [form, setForm] = useState({
    nom: "",
    whatsapp: "",
    prestation: "",
    message: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!accepted) {
      setCheckError(true);
      return;
    }
    setCheckError(false);
    setStatus("loading");
    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ nom: "", whatsapp: "", prestation: "", message: "" });
        setAccepted(false);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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
            Remplissez le formulaire et je vous recontacte sur WhatsApp
            pour confirmer votre créneau.
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
            <div
              style={{
                padding: "48px",
                background: "var(--cream)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <span style={{ fontSize: "32px" }}>✓</span>
              <h3
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--noir)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Demande envoyée !
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "var(--grey)",
                  margin: 0,
                }}
              >
                Je vous recontacte sur WhatsApp pour confirmer votre
                rendez-vous.
              </p>
              <button
                onClick={() => setStatus("idle")}
                style={{
                  marginTop: "8px",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--noir)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                  textDecoration: "underline",
                }}
              >
                Nouvelle demande
              </button>
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  htmlFor="whatsapp"
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--noir)",
                  }}
                >
                  Numéro WhatsApp{" "}
                  <span style={{ color: "var(--lavender-dark)" }}>*</span>
                  <span
                    style={{
                      color: "#b94040",
                      fontWeight: 500,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    {" "}
                    Précisez l&apos;indicatif téléphonique
                  </span>
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Exemple: +221 77 570 29 89"
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
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--grey)',
                  margin: '0 0 10px',
                  lineHeight: 1.6,
                }}>
                  Vous avez un modèle en tête ? Importez une image de référence <span style={{ color: 'var(--grey-light)' }}>(optionnel)</span>
                </p>
                <input
                  type="file"
                  id="inspiration"
                  name="inspiration"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImagePreview(URL.createObjectURL(file))
                    }
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label
                  htmlFor="inspiration"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--noir)',
                    border: '1px solid rgba(0,0,0,0.15)',
                    padding: '10px 16px',
                    background: 'var(--cream)',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                    flexShrink: 0,
                  }}
                  className="upload-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span id="inspiration-label">Importer une image</span>
                </label>

                {imagePreview && (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d7a3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <div className="img-preview-wrap" style={{ position: 'relative', height: '39px', width: '39px', flexShrink: 0 }}>
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        style={{
                          height: '39px',
                          width: '39px',
                          objectFit: 'cover',
                          border: '1px solid rgba(0,0,0,0.10)',
                          display: 'block',
                        }}
                      />
                      <button
                        type="button"
                        className="img-remove-btn"
                        onClick={() => {
                          setImagePreview(null)
                          const input = document.getElementById('inspiration') as HTMLInputElement
                          if (input) input.value = ''
                        }}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: 'var(--noir)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        aria-label="Supprimer l'image"
                      >
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
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

      <style>{`
        .contact-input:focus { border-color: var(--lavender-dark) !important; }
        .contact-input::placeholder { color: var(--grey-light); }
        .upload-btn:hover { border-color: var(--lavender-dark) !important; background: var(--lavender-light) !important; }
        .img-remove-btn { opacity: 0; transition: opacity 0.2s ease; }
        .img-preview-wrap:hover .img-remove-btn { opacity: 1; }
        @media (max-width: 1023px) { .img-remove-btn { opacity: 1 !important; } }
        .contact-submit:hover { background: var(--lavender-dark) !important; }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
