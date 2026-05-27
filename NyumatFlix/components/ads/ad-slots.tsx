"use client";

import { useEffect } from "react";

const popZone = process.env.NEXT_PUBLIC_AD_POP_ZONE || "";
const nativeZone = process.env.NEXT_PUBLIC_AD_NATIVE_ZONE || "";

export function PopunderScript() {
  useEffect(() => {
    if (!popZone) return;
    const s = document.createElement("script");
    s.src = `//www.highperformanceformat.com/${popZone}/invoke.js`;
    s.async = true;
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return null;
}

export function NativeBannerScript() {
  useEffect(() => {
    if (!nativeZone) return;
    const s = document.createElement("script");
    s.src = `//www.highperformanceformat.com/${nativeZone}/invoke.js`;
    s.async = true;
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return null;
}
