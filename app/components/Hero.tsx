"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { btnPrimary } from "../lib/hooks";

// Flip text — animation lettre par lettre au hover (adapté de vaib215/flip-links)
function FlipText({ text }: { text: string }) {
  return (
    <span
      className="flip-word"
      style={{ display: "block", position: "relative", overflow: "hidden" }}
    >
      {/* Texte visible — monte au hover */}
      <span className="flip-front" style={{ display: "flex" }}>
        {text.split("").map((ch, i) => (
          <span
            key={i}
            style={{ display: "inline-block", transitionDelay: `${i * 22}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
      {/* Texte dupliqué — monte depuis le bas au hover */}
      <span
        className="flip-back"
        style={{ position: "absolute", inset: 0, display: "flex" }}
      >
        {text.split("").map((ch, i) => (
          <span
            key={i}
            style={{ display: "inline-block", transitionDelay: `${i * 22}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Hero({ ready = false }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);
  const logoVisible = useRef(true);

  // Logo — scroll bas → disparaît, scroll haut → réapparaît (partout sur la page)
  useLenis(({ direction }) => {
    if (direction === 1 && logoVisible.current) {
      gsap.to(logoRef.current, { opacity: 0, y: -12, duration: 0.4, ease: "power2.in", overwrite: true });
      logoVisible.current = false;
    } else if (direction === -1 && !logoVisible.current) {
      gsap.to(logoRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", overwrite: true });
      logoVisible.current = true;
    }
  });

  // Entrance animation — déclenché après le preloader
  useEffect(() => {
    if (!ready || animatedRef.current) return;
    animatedRef.current = true;

    const ctx = gsap.context(() => {
      gsap.set(headlineRef.current, { y: 48 });
      gsap.set(bottomRef.current, { y: 28 });

      const tl = gsap.timeline({ delay: 0.15 });

      tl.to(logoRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
      tl.to(
        headlineRef.current,
        { opacity: 1, y: 0, duration: 1.0, ease: "power4.out" },
        "-=0.5",
      );
      tl.to(
        bottomRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.55",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [ready]);

  return (
    <>
      {/* Logo — fixe, aligné avec le bouton menu (top: 0, height: 72px) */}
      <div
        ref={logoRef}
        className="hero-logo"
        style={{
          position: "fixed",
          top: "20px",
          left: "clamp(20px, 4vw, 48px)",
          zIndex: 50,
          opacity: 0,
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              background: "#FFFFFF",
              height: "72px",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 20px rgba(0,0,0,0.10)",
            }}
          >
            <Image
              src="/logo-anto.png"
              alt="Anto Nail — retour à l'accueil"
              width={140}
              height={36}
              style={{ height: "36px", width: "auto", display: "block" }}
            />
          </div>
        </a>
      </div>

      <section
        id="hero"
        ref={sectionRef}
        className="hero-section"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "40px clamp(20px, 5vw, 48px) 52px",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("/hero.png")',
            backgroundSize: "cover",
            backgroundPosition: "center top",
            zIndex: 0,
          }}
        />

        {/* Gradient bas */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,6,6,0.72) 0%, rgba(10,6,6,0.2) 50%, transparent 75%)",
            zIndex: 1,
          }}
        />

        {/* Headline flip — haut gauche */}
        <div
          style={{
            position: "relative",
            zIndex: 5,
            maxWidth: "min(90vw, 1200px)",
            marginTop: "80px",
          }}
        >
          <h1
            ref={headlineRef}
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "clamp(72px, 12vw, 240px)",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "var(--white)",
              margin: 0,
              cursor: "default",
              opacity: 0,
            }}
          >
            <FlipText text="Sublimez" />
            <FlipText text="vos mains" />
          </h1>
        </div>

        {/* Bas — texte gauche + bouton droite */}
        <div
          ref={bottomRef}
          className="hero-bottom"
          style={{
            position: "relative",
            zIndex: 5,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            opacity: 0,
            gap: "40px",
          }}
        >
          {/* Texte introductif — bas gauche */}
          <div style={{ maxWidth: "440px" }}>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "1px",
                  background: "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              />
              Prothésiste ongulaire · Dakar
            </p>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.82)",
                margin: 0,
              }}
            >
              Anto Nail, c&apos;est l&apos;art de transformer vos ongles en
              véritable signature. Anto façonne chaque pose comme une œuvre : gel
              sculptural, nail art sur‑mesure, baby boomer naturel. Un
              savoir‑faire précis, une esthétique exigeante, pour des mains qui se
              remarquent et des ongles qui durent.
            </p>
          </div>

          {/* Bouton — bas droite */}
          <a
            href="#contact"
            style={{ ...btnPrimary, flexShrink: 0 }}
            className="hero-btn-cta"
          >
            Prendre Rendez-vous
          </a>
        </div>

        <style>{`
          /* Flip text animation */
          .flip-front span,
          .flip-back span {
            transition: transform 0.3s ease-in-out;
          }
          .flip-front span { transform: translateY(0); }
          .flip-word:hover .flip-front span { transform: translateY(-110%); }
          .flip-back span { transform: translateY(110%); }
          .flip-word:hover .flip-back span { transform: translateY(0); }

          .hero-btn-cta { transition: background 0.25s ease, transform 0.2s ease !important; }
          .hero-btn-cta:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
          @media (max-width: 768px) {
            .hero-bottom { flex-direction: column; align-items: flex-start !important; gap: 24px !important; }
          }
        `}</style>
      </section>
    </>
  );
}
