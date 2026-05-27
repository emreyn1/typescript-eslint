"use client";

import React from "react";
import { StarsBackground } from "@/components/herostars-withlogo/stars"; // ShadCN ile gelen dosya
// {globals.css ile yapildi} import "./index.css"; // CSS dosyasını içe aktar"

const HeroStarsWithLogo = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true); // client-side render
  }, []);

  if (!mounted) return null; // SSR’de render yok

  return (
    <section className="hero-section">
      <StarsBackground starColor="#fff" speed={50} pointerEvents={false} />
      {/* Overlay layer */}
      <div className="hero-overlay">
        {Array.from({ length: 20 }).map((_, index) => {
          const logoOffsetX = Math.random() * 20 - 10;
          const logoOffsetY = Math.random() * 20 - 10;
          const randomDelay = Math.random() * 5;

          return (
            <div
              key={index}
              className="star"
              style={{
                top: Math.random() * window.innerHeight,
                left: Math.random() * window.innerWidth,
              }}
            >
              {/* V harfi */}
              <div className="trail"></div>
              <div className="trail"></div>
              <div className="trail"></div>

              {/* Sübliminal logo */}
              <div
                className="subliminal-logo"
                style={{
                  top: logoOffsetY,
                  left: logoOffsetX,
                  "--random-delay": `${randomDelay}s`,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path
                    d="M5,15 L10,5 L15,15 M8,10 L12,10"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroStarsWithLogo;