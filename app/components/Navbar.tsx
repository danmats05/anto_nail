"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useLenis } from "lenis/react";
import { btnPrimary } from "../lib/hooks";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

const navLinks = [
  { label: "Services", href: "#prestations", shape: "1" },
  { label: "Galerie", href: "#galerie", shape: "2" },
  { label: "Avis", href: "#avis", shape: "3" },
  { label: "Contact", href: "#contact", shape: "4" },
];

function FlipText({ text }: { text: string }) {
  return (
    <span style={{ display: "block", position: "relative", overflow: "hidden" }}>
      <span className="flip-front" style={{ display: "flex" }}>
        {text.split("").map((ch, i) => (
          <span key={i} style={{ display: "inline-block", transitionDelay: `${i * 22}ms` }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
      <span className="flip-back" style={{ position: "absolute", inset: 0, display: "flex" }}>
        {text.split("").map((ch, i) => (
          <span key={i} style={{ display: "inline-block", transitionDelay: `${i * 22}ms` }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Navbar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnWrapRef = useRef<HTMLDivElement>(null);
  const labelSpanRef = useRef<HTMLSpanElement>(null);
  const btnVisible = useRef(true);
  const labelIsDark = useRef(true);
  const darkEls = useRef<Element[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cache les éléments des sections sombres une fois montés
  useEffect(() => {
    darkEls.current = [
      document.querySelector(".hero-section"),
      document.getElementById("contact"),
    ].filter(Boolean) as Element[];
  }, []);

  // Applique la couleur du label selon le fond réel derrière le bouton
  const syncLabelColor = useCallback((forceDark?: boolean) => {
    const overDark =
      forceDark ??
      darkEls.current.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < 92 && r.bottom > 0;
      });
    if (overDark !== labelIsDark.current) {
      labelIsDark.current = overDark;
      gsap.to(labelSpanRef.current, {
        color: overDark ? "#FFFFFF" : "#1A1A1A",
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }, []);

  // Bouton menu — visibilité + couleur label
  useLenis(({ direction }) => {
    if (!isOpenRef.current) syncLabelColor();

    if (isOpenRef.current) return;
    if (direction === 1 && btnVisible.current) {
      gsap.to(btnWrapRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.4,
        ease: "power2.in",
        overwrite: true,
      });
      btnVisible.current = false;
    } else if (direction === -1 && !btnVisible.current) {
      gsap.to(btnWrapRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: true,
      });
      btnVisible.current = true;
    }
  });

  // Shape hover effects
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
      gsap.defaults({ ease: "main", duration: 0.7 });
    } catch {
      gsap.defaults({ ease: "power2.out", duration: 0.7 });
    }

    const ctx = gsap.context(() => {
      const menuItems = containerRef.current!.querySelectorAll(
        ".menu-list-item[data-shape]",
      );
      const shapesContainer = containerRef.current!.querySelector(
        ".ambient-background-shapes",
      );

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute("data-shape");
        const shape =
          shapesContainer?.querySelector(`.bg-shape-${shapeIndex}`) ?? null;
        if (!shape) return;
        const shapeEls = shape.querySelectorAll(".shape-element");

        const onEnter = () => {
          shapesContainer
            ?.querySelectorAll(".bg-shape")
            .forEach((s) => s.classList.remove("active"));
          shape.classList.add("active");
          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, rotation: -10 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "back.out(1.7)",
              overwrite: "auto",
            },
          );
        };
        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => shape.classList.remove("active"),
            overwrite: "auto",
          });
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);
        (item as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
          item.removeEventListener("mouseenter", onEnter);
          item.removeEventListener("mouseleave", onLeave);
        };
      });
    }, containerRef);

    return () => {
      ctx.revert();
      containerRef.current
        ?.querySelectorAll(".menu-list-item[data-shape]")
        .forEach((item: any) => {
          item._cleanup?.();
        });
    };
  }, []);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef = useRef(false);

  const getEls = () => {
    const c = containerRef.current!;
    return {
      navWrap: c.querySelector(".nav-overlay-wrapper"),
      overlay: c.querySelector(".overlay"),
      bgPanels: c.querySelectorAll(".backdrop-layer"),
      menuLinks: c.querySelectorAll(".nav-link"),
      fadeTargets: c.querySelectorAll("[data-menu-fade]"),
      menuBtnIcon: c.querySelector(".menu-button-icon"),
    };
  };

  const animateOpen = useCallback(() => {
    if (!containerRef.current) return;
    tlRef.current?.kill();
    const { navWrap, overlay, bgPanels, menuLinks, fadeTargets, menuBtnIcon } =
      getEls();
    navWrap?.setAttribute("data-nav", "open");
    const tl = gsap.timeline();
    tlRef.current = tl;
    tl.set(navWrap, { display: "block" })
      .fromTo(menuBtnIcon ?? {}, { rotate: 0 }, { rotate: 315, duration: 0.5 })
      .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, "<")
      .fromTo(
        bgPanels,
        { xPercent: 101 },
        { xPercent: 0, stagger: 0.12, duration: 0.575 },
        "<",
      )
      .fromTo(
        menuLinks,
        { yPercent: 140, rotate: 10 },
        { yPercent: 0, rotate: 0, stagger: 0.05, duration: 0.5 },
        "<+=0.35",
      );
    // Panneau crème entièrement affiché à t≈0.82s → texte noir
    tl.call(
      () => {
        labelIsDark.current = false;
        gsap.to(labelSpanRef.current, {
          color: "#1A1A1A",
          duration: 0.25,
          ease: "power2.out",
        });
      },
      [],
      0.82,
    );
    if (fadeTargets.length) {
      tl.fromTo(
        fadeTargets,
        { autoAlpha: 0, yPercent: 50 },
        { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: "transform,opacity,visibility" },
        "<+=0.2",
      );
    }
  }, []);

  const animateClose = useCallback(() => {
    if (!containerRef.current) return;
    tlRef.current?.kill();
    const { navWrap, overlay, bgPanels, menuLinks, fadeTargets, menuBtnIcon } =
      getEls();
    navWrap?.setAttribute("data-nav", "closed");
    const tl = gsap.timeline({
      onComplete: () => gsap.set(navWrap, { display: "none" }),
    });
    tlRef.current = tl;
    tl.to(fadeTargets, {
      autoAlpha: 0,
      yPercent: 30,
      stagger: 0.04,
      duration: 0.3,
    })
      .to(
        menuLinks,
        {
          yPercent: 140,
          rotate: 10,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.in",
        },
        "<+=0.05",
      )
      .to(
        bgPanels,
        {
          xPercent: 101,
          stagger: { each: 0.12, from: "end" },
          duration: 0.575,
        },
        "<+=0.15",
      )
      .to(overlay, { autoAlpha: 0, duration: 0.4 }, "<")
      .to(menuBtnIcon ?? {}, { rotate: 0, duration: 0.4 }, "<");
    // Panneau crème entièrement sorti à t≈0.78s → restaurer la couleur selon la section réelle
    tl.call(
      () => {
        const isDark = darkEls.current.some((el) => {
          const r = el.getBoundingClientRect();
          return r.top < 92 && r.bottom > 0;
        });
        labelIsDark.current = isDark;
        gsap.to(labelSpanRef.current, {
          color: isDark ? "#FFFFFF" : "#1A1A1A",
          duration: 0.25,
          ease: "power2.out",
        });
      },
      [],
      0.78,
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenRef.current) {
        isOpenRef.current = false;
        setIsMenuOpen(false);
        animateClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [animateClose]);

  const toggle = () => {
    const next = !isOpenRef.current;
    isOpenRef.current = next;
    setIsMenuOpen(next);
    if (next) animateOpen();
    else animateClose();
  };

  const close = () => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    setIsMenuOpen(false);
    animateClose();
  };

  return (
    <div ref={containerRef}>
      {/* ── Bouton fixe coin supérieur droit ── */}
      <div
        ref={btnWrapRef}
        className="nav-btn-wrap"
        style={{
          position: "fixed",
          top: "20px",
          right: "clamp(20px, 4vw, 48px)",
          zIndex: 300,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Label à gauche du bouton */}
        <span
          ref={labelSpanRef}
          className="nav-menu-label"
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            paddingRight: "16px",
            whiteSpace: "nowrap",
          }}
        >
          {isMenuOpen
            ? "Cliquez pour cacher le menu"
            : "Cliquez pour afficher le menu"}
        </span>

        {/* Bouton carré lavande — icône seulement */}
        <button
          onClick={toggle}
          aria-label="Menu"
          className="nav-toggle-btn"
          style={{
            width: "72px",
            height: "72px",
            background: "var(--lavender)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            viewBox="0 0 16 16"
            fill="none"
            className="menu-button-icon"
            style={{ color: "var(--white)" }}
          >
            <path
              d="M7.33333 16L7.33333 0L8.66667 0L8.66667 16L7.33333 16Z"
              fill="currentColor"
            />
            <path
              d="M16 8.66667L0 8.66667L0 7.33333L16 7.33333L16 8.66667Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* ── Fullscreen menu ── */}
      <section
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          pointerEvents: "none",
        }}
      >
        <div
          data-nav="closed"
          className="nav-overlay-wrapper"
          style={{ display: "none", position: "absolute", inset: 0 }}
        >
          {/* Overlay sombre */}
          <div
            className="overlay"
            onClick={close}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,8,8,0.55)",
              opacity: 0,
            }}
          />

          {/* Panel menu */}
          <nav
            className="menu-content"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "min(520px, 100vw)",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Backdrop layers */}
            <div style={{ position: "absolute", inset: 0 }}>
              <div
                className="backdrop-layer"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--lavender-dark)",
                }}
              />
              <div
                className="backdrop-layer"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--lavender)",
                }}
              />
              <div
                className="backdrop-layer"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--cream)",
                }}
              />

              {/* Ambient shapes */}
              <div
                className="ambient-background-shapes"
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <svg
                  className="bg-shape bg-shape-1"
                  viewBox="0 0 400 600"
                  fill="none"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                  }}
                >
                  <circle
                    className="shape-element"
                    cx="80"
                    cy="150"
                    r="60"
                    fill="rgba(201,168,224,0.2)"
                  />
                  <circle
                    className="shape-element"
                    cx="320"
                    cy="100"
                    r="80"
                    fill="rgba(155,114,200,0.14)"
                  />
                  <circle
                    className="shape-element"
                    cx="200"
                    cy="400"
                    r="100"
                    fill="rgba(242,200,216,0.12)"
                  />
                </svg>
                <svg
                  className="bg-shape bg-shape-2"
                  viewBox="0 0 400 600"
                  fill="none"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                  }}
                >
                  <path
                    className="shape-element"
                    d="M0 250 Q150 100, 300 250 T 600 250"
                    stroke="rgba(201,168,224,0.2)"
                    strokeWidth="80"
                    fill="none"
                  />
                  <path
                    className="shape-element"
                    d="M0 400 Q150 250, 300 400 T 600 400"
                    stroke="rgba(212,168,83,0.12)"
                    strokeWidth="50"
                    fill="none"
                  />
                </svg>
                <svg
                  className="bg-shape bg-shape-3"
                  viewBox="0 0 400 600"
                  fill="none"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                  }}
                >
                  {[60, 160, 260, 360].flatMap((x) =>
                    [80, 200, 320, 440].map((y) => (
                      <circle
                        key={`${x}-${y}`}
                        className="shape-element"
                        cx={x}
                        cy={y}
                        r="8"
                        fill="rgba(201,168,224,0.28)"
                      />
                    )),
                  )}
                </svg>
                <svg
                  className="bg-shape bg-shape-4"
                  viewBox="0 0 400 600"
                  fill="none"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                  }}
                >
                  <path
                    className="shape-element"
                    d="M80 120 Q140 60, 200 120 Q260 180, 200 240 Q140 300, 80 240 Q20 180, 80 120"
                    fill="rgba(201,168,224,0.16)"
                  />
                  <path
                    className="shape-element"
                    d="M240 300 Q300 240, 360 300 Q300 360, 240 300"
                    fill="rgba(242,200,216,0.13)"
                  />
                </svg>
              </div>
            </div>

            {/* Contenu */}
            <div
              className="nav-panel-inner"
              style={{
                position: "relative",
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                padding: "100px clamp(24px, 5vw, 64px) 64px",
                overflow: "hidden",
              }}
            >
              <ul
                className="menu-list"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {navLinks.map((link) => (
                  <li
                    key={link.href}
                    className="menu-list-item"
                    data-shape={link.shape}
                    style={{
                      overflow: "hidden",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={close}
                      className="nav-link menu-nav-link"
                      style={{
                        display: "block",
                        textDecoration: "none",
                        padding: "22px 0",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "clamp(40px, 6vw, 72px)",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        color: "var(--noir)",
                        lineHeight: 1,
                      }}
                    >
                      <FlipText text={link.label} />
                    </a>
                  </li>
                ))}
              </ul>

              <div
                data-menu-fade
                style={{
                  marginTop: "96px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--grey)",
                    margin: 0,
                    letterSpacing: "0.06em",
                  }}
                >
                  Dakar · Sur rendez-vous uniquement
                </p>
                <a
                  href="#contact"
                  onClick={close}
                  className="nav-reserve-btn"
                  style={{ ...btnPrimary, alignSelf: "flex-start" }}
                >
                  Réserver
                </a>
              </div>
            </div>
          </nav>
        </div>
      </section>

      <style>{`
        .nav-overlay-wrapper[data-nav="open"] { pointer-events: auto; }
        .nav-overlay-wrapper[data-nav="closed"] { pointer-events: none; }
        .bg-shape { opacity: 0; }
        .bg-shape.active { opacity: 1; }
        .flip-front span, .flip-back span { transition: transform 0.3s ease-in-out; }
        .flip-front span { transform: translateY(0); }
        .flip-back span { transform: translateY(110%); }
        .menu-nav-link:hover .flip-front span { transform: translateY(-110%); }
        .menu-nav-link:hover .flip-back span { transform: translateY(0); }
        .menu-nav-link:hover { color: var(--lavender-dark) !important; }
        .nav-toggle-btn { transition: background 0.25s ease, transform 0.2s ease !important; }
        .nav-toggle-btn:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
        .nav-reserve-btn { transition: background 0.25s ease, transform 0.2s ease !important; }
        .nav-reserve-btn:hover { background: var(--lavender-dark) !important; transform: translateY(-2px); }
        @media (max-width: 768px) {
          .nav-menu-label { display: none !important; }
        }
      `}</style>
    </div>
  );
}
