import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useCallback } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stillwood — a living forest to breathe with" },
      {
        name: "description",
        content:
          "An interactive, soundless green-nature scene: drifting fireflies, falling leaves, mist and god rays. Open it and just stare.",
      },
      { property: "og:title", content: "Stillwood — a living forest to breathe with" },
      {
        property: "og:description",
        content:
          "An interactive, soundless green-nature scene to open and stare at. Drifting fireflies, falling leaves, mist and god rays.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForestScene,
});

/* ---------- particle / scene types ---------- */
type Firefly = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseR: number;
  phase: number;
  speed: number;
  hue: number;
  life: number;
};

type Leaf = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  sway: number;
  swayPhase: number;
  hue: number;
  alpha: number;
};

type Spore = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  alpha: number;
};

type Sparkle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  hue: number;
};

/* ---------- component ---------- */
function ForestScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  const burstRef = useRef<Sparkle[]>([]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    pointer.current.x = e.clientX / window.innerWidth;
    pointer.current.y = e.clientY / window.innerHeight;
    pointer.current.active = true;
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const burst: Sparkle[] = [];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const sp = 0.6 + Math.random() * 2.4;
      burst.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.4,
        life: 0,
        maxLife: 60 + Math.random() * 50,
        r: 1 + Math.random() * 2.4,
        hue: 90 + Math.random() * 30,
      });
    }
    burstRef.current.push(...burst);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---- fireflies ---- */
    const flyCount = Math.round(Math.min(90, (w * h) / 22000));
    const fireflies: Firefly[] = Array.from({ length: flyCount }, () => {
      const baseR = 0.8 + Math.random() * 2.2;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.05 - Math.random() * 0.25,
        r: baseR,
        baseR,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.03,
        hue: 88 + Math.random() * 34,
        life: 1,
      };
    });

    /* ---- pollen / spores ---- */
    const sporeCount = Math.round(Math.min(70, (w * h) / 26000));
    const spores: Spore[] = Array.from({ length: sporeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.02 - Math.random() * 0.12,
      r: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    /* ---- leaves ---- */
    const leaves: Leaf[] = [];
    const spawnLeaf = () => {
      leaves.push({
        x: Math.random() * w,
        y: -40 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.02,
        size: 6 + Math.random() * 12,
        sway: 0.4 + Math.random() * 0.9,
        swayPhase: Math.random() * Math.PI * 2,
        hue: 120 + Math.random() * 50,
        alpha: 0.5 + Math.random() * 0.4,
      });
    };
    for (let i = 0; i < 12; i++) spawnLeaf();

    let raf = 0;
    let t = 0;

    const drawLeaf = (l: Leaf) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.alpha;
      ctx.fillStyle = `hsl(${l.hue} 45% 45%)`;
      ctx.beginPath();
      // simple leaf: two arcs meeting at tips
      ctx.moveTo(0, -l.size);
      ctx.quadraticCurveTo(l.size * 0.8, 0, 0, l.size);
      ctx.quadraticCurveTo(-l.size * 0.8, 0, 0, -l.size);
      ctx.fill();
      // vein
      ctx.strokeStyle = `hsl(${l.hue} 40% 30%)`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.lineTo(0, l.size);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const render = () => {
      t += 1;
      const px = pointer.current.x;
      const py = pointer.current.y;
      const parX = (px - 0.5) * 2; // -1..1
      const parY = (py - 0.5) * 2;

      // sky gradient (drawn on canvas as a base wash; CSS layers sit behind)
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "oklch(0.16 0.03 185)");
      sky.addColorStop(0.5, "oklch(0.22 0.05 165)");
      sky.addColorStop(0.82, "oklch(0.3 0.055 140)");
      sky.addColorStop(1, "oklch(0.4 0.06 125)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // soft horizon glow (follows pointer subtly)
      const glowX = w * 0.5 + parX * w * 0.12;
      const glowY = h * 0.74;
      const glow = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        Math.max(w, h) * 0.6,
      );
      glow.addColorStop(0, "rgba(220, 240, 160, 0.20)");
      glow.addColorStop(0.4, "rgba(180, 220, 140, 0.07)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // spores (behind fireflies)
      for (const s of spores) {
        s.x += s.vx + Math.sin(t * 0.01 + s.phase) * 0.15;
        s.y += s.vy;
        if (s.y < -10) {
          s.y = h + 10;
          s.x = Math.random() * w;
        }
        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;
        ctx.globalAlpha =
          s.alpha * (0.6 + 0.4 * Math.sin(t * 0.02 + s.phase));
        ctx.fillStyle = "rgba(214, 240, 196, 0.9)";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // fireflies
      for (const f of fireflies) {
        // gentle wander + drift toward pointer when active
        f.vx += (Math.random() - 0.5) * 0.02;
        f.vy += (Math.random() - 0.5) * 0.01;
        if (pointer.current.active) {
          const tx = px * w;
          const ty = py * h;
          const dx = tx - f.x;
          const dy = ty - f.y;
          const dist = Math.hypot(dx, dy) + 1;
          if (dist < 320) {
            f.vx += (dx / dist) * 0.012;
            f.vy += (dy / dist) * 0.012;
          }
        }
        // damping + bounds
        f.vx *= 0.98;
        f.vy *= 0.98;
        f.vx = Math.max(-1.1, Math.min(1.1, f.vx));
        f.vy = Math.max(-1.1, Math.min(1.1, f.vy));
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < -20) f.y = h + 20;
        if (f.y > h + 20) f.y = -20;

        f.phase += f.speed;
        const pulse = 0.5 + 0.5 * Math.sin(f.phase);
        const rad = f.baseR * (0.7 + pulse * 0.9);

        // glow halo
        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad * 7);
        grd.addColorStop(0, `hsla(${f.hue}, 90%, 75%, ${0.5 * pulse + 0.15})`);
        grd.addColorStop(0.3, `hsla(${f.hue}, 85%, 60%, ${0.18 * pulse})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad * 7, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.fillStyle = `hsla(${f.hue}, 100%, 92%, ${0.6 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // leaves
      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i]!;
        l.swayPhase += 0.02;
        l.x += l.vx + Math.sin(l.swayPhase) * l.sway * 0.5;
        l.y += l.vy;
        l.rot += l.vrot;
        // slight pointer push
        l.vx += parX * 0.002;
        l.vx *= 0.995;
        drawLeaf(l);
        if (l.y > h + 40) {
          leaves.splice(i, 1);
          spawnLeaf();
        }
      }

      // click sparkles
      for (let i = burstRef.current.length - 1; i >= 0; i--) {
        const s = burstRef.current[i];
        s.life += 1;
        s.vy += 0.01;
        s.vx *= 0.97;
        s.vy *= 0.97;
        s.x += s.vx;
        s.y += s.vy;
        const k = 1 - s.life / s.maxLife;
        if (k <= 0) {
          burstRef.current.splice(i, 1);
          continue;
        }
        const rad = s.r * (0.5 + k);
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad * 6);
        grd.addColorStop(0, `hsla(${s.hue}, 95%, 80%, ${0.7 * k})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, rad * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${s.hue}, 100%, 92%, ${k})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // top vignette
      const vig = ctx.createRadialGradient(
        w / 2,
        h * 0.45,
        Math.min(w, h) * 0.3,
        w / 2,
        h * 0.5,
        Math.max(w, h) * 0.75,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(4, 16, 12, 0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick);
    };
  }, [handlePointerMove, handleClick]);

  /* parallax offsets for SVG layers driven by pointer */
  const layerOffset = (depth: number) => {
    // applied via style with CSS var; we update a ref-less inline through state would cause rerenders.
    // Instead we use CSS variables on the container set by a lightweight effect below.
    return depth;
  };
  // keep referenced so linter doesn't drop
  void layerOffset;

  return (
    <div className="forest-root">
      <canvas ref={canvasRef} className="forest-canvas" aria-hidden="true" />

      {/* god rays */}
      <div className="forest-godrays" aria-hidden="true">
        <div className="forest-ray" style={{ left: "12%", width: "26vw", animationDelay: "0s" }} />
        <div className="forest-ray" style={{ left: "42%", width: "18vw", animationDelay: "-6s" }} />
        <div className="forest-ray" style={{ left: "66%", width: "30vw", animationDelay: "-12s" }} />
      </div>

      {/* mist layers */}
      <div className="forest-mist-band forest-mist-1" aria-hidden="true" />
      <div className="forest-mist-band forest-mist-2" aria-hidden="true" />

      {/* parallax tree silhouettes (driven by JS parallax effect) */}
      <ParallaxTrees />

      {/* foreground grass */}
      <ForestGrass />

      {/* vignette over layers but under text */}
      <div className="forest-vignette" aria-hidden="true" />

      {/* title */}
      <div className="forest-title-wrap">
        <h1 className="forest-title">Stillwood</h1>
        <p className="forest-sub">move to guide the fireflies · click to breathe light</p>
      </div>
    </div>
  );
}

/* ---------- parallax tree silhouettes ---------- */
function ParallaxTrees() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--px", String(cx));
      el.style.setProperty("--py", String(cy));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="forest-trees" ref={ref} aria-hidden="true">
      {/* far layer */}
      <svg
        className="forest-tree-layer forest-tree-far"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 400 L0 250 L60 230 L80 180 L130 210 L160 150 L210 200 L260 120 L320 190 L380 140 L440 200 L510 110 L580 190 L640 150 L710 210 L780 130 L860 200 L930 160 L1010 220 L1080 140 L1160 200 L1240 160 L1320 210 L1380 170 L1440 230 L1440 400 Z"
          fill="oklch(0.22 0.05 160)"
        />
      </svg>

      {/* mid layer */}
      <svg
        className="forest-tree-layer forest-tree-mid"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 420 L0 300 L40 260 L70 200 L120 250 L150 170 L210 240 L250 150 L300 230 L350 160 L420 250 L470 130 L540 240 L600 170 L670 250 L740 140 L820 240 L890 180 L970 260 L1040 150 L1120 240 L1190 170 L1270 250 L1340 180 L1410 250 L1440 220 L1440 420 Z"
          fill="oklch(0.16 0.045 158)"
        />
      </svg>

      {/* near layer — pine triangles */}
      <svg
        className="forest-tree-layer forest-tree-near"
        viewBox="0 0 1440 460"
        preserveAspectRatio="xMidYMax slice"
      >
        <g fill="oklch(0.11 0.035 155)">
          {PinePositions.map((p, i) => (
            <Pine key={i} x={p.x} baseY={460} h={p.h} w={p.w} />
          ))}
        </g>
      </svg>
    </div>
  );
}

const PinePositions = [
  { x: 40, h: 260, w: 90 },
  { x: 160, h: 320, w: 110 },
  { x: 280, h: 220, w: 80 },
  { x: 410, h: 360, w: 130 },
  { x: 560, h: 280, w: 100 },
  { x: 700, h: 340, w: 120 },
  { x: 850, h: 240, w: 85 },
  { x: 990, h: 370, w: 135 },
  { x: 1150, h: 300, w: 105 },
  { x: 1300, h: 350, w: 125 },
];

function Pine({
  x,
  baseY,
  h,
  w,
}: {
  x: number;
  baseY: number;
  h: number;
  w: number;
}) {
  const tiers = 4;
  const points: string[] = [];
  for (let i = 0; i < tiers; i++) {
    const yTop = baseY - h + (i * h) / (tiers + 0.4);
    const yBot = baseY - h + ((i + 1.1) * h) / (tiers + 0.4);
    const half = w / 2 - i * (w / (tiers * 3));
    points.push(`M ${x - half} ${yBot} L ${x} ${yTop} L ${x + half} ${yBot} Z`);
  }
  return <path d={points.join(" ")} />;
}

/* ---------- foreground grass ---------- */
function ForestGrass() {
  const blades = useRef(
    Array.from({ length: 46 }, (_, i) => ({
      left: (i / 46) * 100 + (Math.random() - 0.5) * 1.6,
      h: 60 + Math.random() * 130,
      delay: -Math.random() * 6,
      dur: 5 + Math.random() * 4,
      sway: -0.5 + Math.random(),
      hue: 125 + Math.random() * 40,
    })),
  ).current;

  return (
    <div className="forest-grass" aria-hidden="true">
      {blades.map((b, i) => (
        <span
          key={i}
          className="forest-blade"
          style={{
            left: `${b.left}%`,
            height: `${b.h}px`,
            background: `linear-gradient(to top, oklch(0.12 0.04 155), oklch(0.3 0.07 ${b.hue}))`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            transformOrigin: `bottom ${b.sway > 0 ? "right" : "left"}`,
          }}
        />
      ))}
    </div>
  );
}
