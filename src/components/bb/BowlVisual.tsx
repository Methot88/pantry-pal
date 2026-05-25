import { useEffect, useState } from "react";

interface Props {
  fillFraction: number; // 0..1
  size?: number;
}

export function BowlVisual({ fillFraction, size = 240 }: Props) {
  const f = Math.max(0, Math.min(1, fillFraction));
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(f), 50);
    return () => clearTimeout(t);
  }, [f]);

  // Bowl is a U-shape. We render water from bottom up using clipPath.
  // Bowl SVG: viewBox 200x180. Bowl outer width 180, depth 130.
  // Water fills inside bowl interior (bowl walls thickness ~6).
  const empty = f <= 0.02;
  const low = f < 0.18;

  // Map fillFraction to water surface y (top of water).
  // Bowl interior: yTop=46 (rim line) to yBottom=160. Range 114 px.
  const yTop = 46;
  const yBottom = 160;
  const waterTop = yBottom - animated * (yBottom - yTop);

  return (
    <div className="relative grid place-items-center animate-bob" style={{ width: size, height: size * 0.9 }}>
      <svg viewBox="0 0 200 180" width={size} height={size * 0.9} aria-hidden="true">
        <defs>
          <linearGradient id="waterGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--water-top))" />
            <stop offset="100%" stopColor="hsl(var(--water-bottom))" />
          </linearGradient>
          <clipPath id="bowlInside">
            {/* Bowl interior shape: rounded U */}
            <path d="M22 46 Q22 162 100 162 Q178 162 178 46 L172 46 Q172 156 100 156 Q28 156 28 46 Z M28 46 L172 46 L172 50 L28 50 Z" />
            {/* Simpler: a filled bowl region */}
            <path d="M28 46 Q28 156 100 156 Q172 156 172 46 Z" />
          </clipPath>
          <filter id="softShadow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Saucer shadow */}
        <ellipse cx="100" cy="168" rx="78" ry="6" fill="hsl(var(--foreground) / 0.12)" />

        {/* Bowl back rim */}
        <ellipse cx="100" cy="46" rx="80" ry="14" fill="hsl(var(--bowl-rim))" />

        {/* Bowl body */}
        <path
          d="M20 46 Q20 164 100 164 Q180 164 180 46 Z"
          fill="hsl(var(--bowl))"
          stroke="hsl(var(--bowl-rim))"
          strokeWidth="2"
        />

        {/* Water clipped to interior */}
        <g clipPath="url(#bowlInside)">
          {!empty && (
            <>
              <rect
                x="0"
                y={waterTop}
                width="200"
                height={180 - waterTop}
                fill="url(#waterGrad)"
                style={{ transition: "y 0.8s var(--ease-spring), height 0.8s var(--ease-spring)" }}
              />
              {/* Wave on top of water */}
              <g style={{ transform: `translateY(${waterTop - 4}px)`, transition: "transform 0.8s var(--ease-spring)" }}>
                <g className="animate-wave">
                  <path
                    d="M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 T250 6 T300 6 T350 6 T400 6 V14 H0 Z"
                    fill="hsl(var(--water-top))"
                    opacity="0.55"
                  />
                </g>
              </g>
            </>
          )}
        </g>

        {/* Inner rim highlight */}
        <ellipse cx="100" cy="46" rx="78" ry="11" fill="none" stroke="hsl(0 0% 100% / 0.5)" strokeWidth="1.5" />

        {/* Empty / low warning line */}
        {low && (
          <line
            x1="40" y1="150" x2="160" y2="150"
            stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
