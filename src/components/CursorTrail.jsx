"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorTrail() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed w-8 h-8 rounded-full bg-[#0AFA92] mix-blend-screen opacity-50 blur-xl z-9999"
      style={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
      }}
    />
  );
}
