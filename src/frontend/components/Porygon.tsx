type Variant = "solid" | "wireframe" | "pixel" | "blueprint";

const BLUE = "#3C8DFF";
const DEEP = "#1554B8";
const CYAN = "#00D9FF";
const PINK = "#F2A9D8";

/* Facet polygons of an original low-poly bird, drawn beak-right. */
function Facets({ strokeOnly = false }: { strokeOnly?: boolean }) {
  const fill = (c: string) => (strokeOnly ? "none" : c);
  const stroke = strokeOnly ? BLUE : "none";
  const sw = strokeOnly ? 1.5 : 0;
  return (
    <g stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      {/* tail */}
      <polygon points="18,128 74,104 74,142" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      {/* crest */}
      <polygon points="150,58 168,28 182,60" fill={fill(PINK)} stroke={stroke} strokeWidth={sw} />
      {/* head */}
      <polygon points="150,58 206,80 206,106 170,122 138,96" fill={fill(BLUE)} stroke={stroke} strokeWidth={sw} />
      {/* beak */}
      <polygon points="206,80 230,93 206,106" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      {/* upper body */}
      <polygon points="138,96 170,122 160,158 98,150" fill={fill(BLUE)} stroke={stroke} strokeWidth={sw} />
      {/* rear body */}
      <polygon points="74,104 138,96 98,150 60,142" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      {/* belly */}
      <polygon points="98,150 160,158 122,182 78,166" fill={fill(BLUE)} stroke={stroke} strokeWidth={sw} />
      {/* wing */}
      <polygon points="138,96 170,122 150,148 112,130" fill={fill(CYAN)} stroke={stroke} strokeWidth={sw} opacity={strokeOnly ? 1 : 0.85} />
      {/* legs + feet */}
      <polygon points="106,180 116,180 116,194 106,194" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      <polygon points="100,194 122,194 122,200 100,200" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      <polygon points="132,182 142,182 142,196 132,196" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      <polygon points="126,196 148,196 148,202 126,202" fill={fill(DEEP)} stroke={stroke} strokeWidth={sw} />
      {/* eye */}
      <rect x="182" y="82" width="11" height="11" fill={CYAN} />
    </g>
  );
}

const PIXEL_ROWS = [
  "....XXXX......",
  "...XXXXXX.....",
  "..XXXXXXXX....",
  "..XXWXXXXX....",
  ".XXXXXXXXXX...",
  ".XXXXXXXXXX...",
  "..XXXXXXXX....",
  "...XXXXXX.....",
  "....XXXX......",
  "...XX..XX.....",
  "...X....X.....",
];

function PixelBird() {
  const cells: React.ReactNode[] = [];
  PIXEL_ROWS.forEach((row, y) => {
    row.split("").forEach((c, x) => {
      if (c === ".") return;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x * 10}
          y={y * 10}
          width={10}
          height={10}
          fill={c === "W" ? CYAN : (x + y) % 2 === 0 ? BLUE : DEEP}
        />,
      );
    });
  });
  return <g>{cells}</g>;
}

/**
 * Porygon — original geometric bird mascot for PoryFlux.
 * variant: solid (hero) | wireframe (technical) | pixel (playful) | blueprint (construction)
 */
export function Porygon({
  variant = "solid",
  className = "",
  label,
}: {
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  if (variant === "pixel") {
    return (
      <svg viewBox="0 0 140 110" className={`pixelated ${className}`} role="img" aria-label={label ?? "Porygon pixel"}>
        <PixelBird />
      </svg>
    );
  }
  if (variant === "blueprint") {
    return (
      <svg viewBox="0 0 260 220" className={className} role="img" aria-label={label ?? "Porygon blueprint"}>
        <circle cx="130" cy="115" r="98" fill="none" stroke={BLUE} strokeWidth="1" strokeDasharray="4 5" opacity="0.6" />
        <circle cx="130" cy="115" r="62" fill="none" stroke={BLUE} strokeWidth="1" opacity="0.35" />
        <line x1="0" y1="115" x2="260" y2="115" stroke={BLUE} strokeWidth="1" opacity="0.3" />
        <line x1="130" y1="0" x2="130" y2="220" stroke={BLUE} strokeWidth="1" opacity="0.3" />
        <g transform="translate(8,12)">
          <Facets strokeOnly />
        </g>
        <text x="14" y="208" fill={BLUE} fontSize="9" fontFamily="monospace" letterSpacing="2">
          PORYGON // 137 — FIG.01
        </text>
        <text x="196" y="24" fill={BLUE} fontSize="9" fontFamily="monospace">
          +
        </text>
        <text x="14" y="24" fill={BLUE} fontSize="9" fontFamily="monospace">
          +
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 248 212" className={className} role="img" aria-label={label ?? "Porygon"}>
      {variant === "wireframe" ? <Facets strokeOnly /> : <Facets />}
    </svg>
  );
}
