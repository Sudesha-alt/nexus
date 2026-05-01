import { useEffect, useRef } from "react";

export function ConfettiBurst({ fire }: { fire: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const particles = Array.from({ length: 90 }, () => ({
      x: canvas.offsetWidth / 2,
      y: canvas.offsetHeight / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.9) * 10,
      life: 40 + Math.random() * 20,
      c: Math.random() > 0.5 ? "#00FF88" : "#00D4FF",
    }));

    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 1;
        ctx.globalAlpha = Math.max(0, p.life / 60);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      if (frame > 70) window.clearInterval(id);
    }, 16);

    return () => window.clearInterval(id);
  }, [fire]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
      aria-hidden
    />
  );
}
