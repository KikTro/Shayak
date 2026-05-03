export function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] mix-blend-overlay"
      style={{ opacity: 0.015 }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="sahayak-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sahayak-noise)" />
      </svg>
    </div>
  );
}
