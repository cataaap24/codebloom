import { useState, useEffect } from "react";
import { Flower2, Sparkles, BookOpen, Share2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Flower SVG Components (4 types) ────────────────────────────────────────

const FLOWER_COLORS = [
  { petals: "#f9a8d4", center: "#fbbf24", stem: "#86efac" },  // pink
  { petals: "#c4b5fd", center: "#fde68a", stem: "#6ee7b7" },  // lavender
  { petals: "#93c5fd", center: "#fcd34d", stem: "#a7f3d0" },  // blue
  { petals: "#6ee7b7", center: "#fbbf24", stem: "#86efac" },  // mint
  { petals: "#fca5a5", center: "#fde68a", stem: "#6ee7b7" },  // red-pink
  { petals: "#fdba74", center: "#fbbf24", stem: "#a7f3d0" },  // peach
];

// Rosette - 8 petals
function RosetteSVG({ type, isNew, size = 120 }: { type: number; isNew?: boolean; size?: number }) {
  const colors = FLOWER_COLORS[(type - 1) % FLOWER_COLORS.length];
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    } else {
      setAnimated(true);
    }
  }, [isNew]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("transition-all duration-700", animated ? "opacity-100 scale-100" : "opacity-0 scale-0")}
      style={{ transformOrigin: "center bottom" }}
    >
      <defs>
        <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Stem */}
      <line x1="60" y1="110" x2="60" y2="55" stroke={colors.stem} strokeWidth="4" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="48" cy="80" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(-35 48 80)" />
      <ellipse cx="72" cy="75" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(35 72 75)" />

      {/* Petals - 8 petals rosette */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx={60 + 18 * Math.cos((angle * Math.PI) / 180)}
          cy={60 + 18 * Math.sin((angle * Math.PI) / 180)}
          rx="12"
          ry="7"
          fill={colors.petals}
          opacity="0.95"
          filter={`url(#glow-${type})`}
          transform={`rotate(${angle} ${60 + 18 * Math.cos((angle * Math.PI) / 180)} ${60 + 18 * Math.sin((angle * Math.PI) / 180)})`}
          className="animate-garden-sway"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}

      {/* Center gradient */}
      <circle cx="60" cy="60" r="12" fill={colors.center} filter={`url(#glow-${type})`} />
      <circle cx="60" cy="60" r="6" fill="white" opacity="0.4" />
    </svg>
  );
}

// Daisy - 14 fine petals
function DaisySVG({ type, isNew, size = 120 }: { type: number; isNew?: boolean; size?: number }) {
  const colors = FLOWER_COLORS[(type - 1) % FLOWER_COLORS.length];
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    } else {
      setAnimated(true);
    }
  }, [isNew]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("transition-all duration-700", animated ? "opacity-100 scale-100" : "opacity-0 scale-0")}
      style={{ transformOrigin: "center bottom" }}
    >
      <defs>
        <filter id={`glow-daisy-${type}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Stem */}
      <line x1="60" y1="110" x2="60" y2="55" stroke={colors.stem} strokeWidth="4" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="48" cy="80" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(-35 48 80)" />
      <ellipse cx="72" cy="75" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(35 72 75)" />

      {/* Petals - 14 fine petals */}
      {Array.from({ length: 14 }, (_, i) => (i * 360) / 14).map((angle, i) => (
        <ellipse
          key={i}
          cx={60 + 16 * Math.cos((angle * Math.PI) / 180)}
          cy={60 + 16 * Math.sin((angle * Math.PI) / 180)}
          rx="5"
          ry="14"
          fill={colors.petals}
          opacity="0.9"
          filter={`url(#glow-daisy-${type})`}
          transform={`rotate(${angle} ${60 + 16 * Math.cos((angle * Math.PI) / 180)} ${60 + 16 * Math.sin((angle * Math.PI) / 180)})`}
          className="animate-garden-sway"
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}

      {/* Center */}
      <circle cx="60" cy="60" r="10" fill={colors.center} filter={`url(#glow-daisy-${type})`} />
      <circle cx="60" cy="60" r="5" fill="white" opacity="0.4" />
    </svg>
  );
}

// Cherry Blossom - 5 wide petals
function CherryBlossomSVG({ type, isNew, size = 120 }: { type: number; isNew?: boolean; size?: number }) {
  const colors = FLOWER_COLORS[(type - 1) % FLOWER_COLORS.length];
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    } else {
      setAnimated(true);
    }
  }, [isNew]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("transition-all duration-700", animated ? "opacity-100 scale-100" : "opacity-0 scale-0")}
      style={{ transformOrigin: "center bottom" }}
    >
      <defs>
        <filter id={`glow-cherry-${type}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Stem */}
      <line x1="60" y1="110" x2="60" y2="55" stroke={colors.stem} strokeWidth="4" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="48" cy="80" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(-35 48 80)" />
      <ellipse cx="72" cy="75" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(35 72 75)" />

      {/* Petals - 5 wide petals */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={60 + 17 * Math.cos((angle * Math.PI) / 180)}
          cy={60 + 17 * Math.sin((angle * Math.PI) / 180)}
          rx="14"
          ry="9"
          fill={colors.petals}
          opacity="0.95"
          filter={`url(#glow-cherry-${type})`}
          transform={`rotate(${angle} ${60 + 17 * Math.cos((angle * Math.PI) / 180)} ${60 + 17 * Math.sin((angle * Math.PI) / 180)})`}
          className="animate-garden-sway"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}

      {/* Center */}
      <circle cx="60" cy="60" r="11" fill={colors.center} filter={`url(#glow-cherry-${type})`} />
      <circle cx="60" cy="60" r="5" fill="white" opacity="0.5" />
    </svg>
  );
}

// Sunflower - double ring style
function SunflowerSVG({ type, isNew, size = 120 }: { type: number; isNew?: boolean; size?: number }) {
  const colors = FLOWER_COLORS[(type - 1) % FLOWER_COLORS.length];
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    } else {
      setAnimated(true);
    }
  }, [isNew]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("transition-all duration-700", animated ? "opacity-100 scale-100" : "opacity-0 scale-0")}
      style={{ transformOrigin: "center bottom" }}
    >
      <defs>
        <filter id={`glow-sunflower-${type}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Stem */}
      <line x1="60" y1="110" x2="60" y2="55" stroke={colors.stem} strokeWidth="4" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="48" cy="80" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(-35 48 80)" />
      <ellipse cx="72" cy="75" rx="10" ry="6" fill={colors.stem} opacity="0.7" transform="rotate(35 72 75)" />

      {/* Outer ring - 8 petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={`outer-${i}`}
          cx={60 + 20 * Math.cos((angle * Math.PI) / 180)}
          cy={60 + 20 * Math.sin((angle * Math.PI) / 180)}
          rx="11"
          ry="6"
          fill={colors.petals}
          opacity="0.85"
          filter={`url(#glow-sunflower-${type})`}
          transform={`rotate(${angle} ${60 + 20 * Math.cos((angle * Math.PI) / 180)} ${60 + 20 * Math.sin((angle * Math.PI) / 180)})`}
          className="animate-garden-sway"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}

      {/* Inner ring - 8 petals */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
        <ellipse
          key={`inner-${i}`}
          cx={60 + 12 * Math.cos((angle * Math.PI) / 180)}
          cy={60 + 12 * Math.sin((angle * Math.PI) / 180)}
          rx="8"
          ry="5"
          fill={colors.petals}
          opacity="0.7"
          filter={`url(#glow-sunflower-${type})`}
          transform={`rotate(${angle} ${60 + 12 * Math.cos((angle * Math.PI) / 180)} ${60 + 12 * Math.sin((angle * Math.PI) / 180)})`}
          className="animate-garden-sway"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}

      {/* Center */}
      <circle cx="60" cy="60" r="10" fill={colors.center} filter={`url(#glow-sunflower-${type})`} />
      <circle cx="60" cy="60" r="5" fill="white" opacity="0.4" />
    </svg>
  );
}

function getFlowerSVG(type: number, isNew?: boolean, size?: number) {
  const typeIndex = type % 4;
  switch (typeIndex) {
    case 1:
      return <RosetteSVG type={type} isNew={isNew} size={size} />;
    case 2:
      return <DaisySVG type={type} isNew={isNew} size={size} />;
    case 3:
      return <CherryBlossomSVG type={type} isNew={isNew} size={size} />;
    case 0:
      return <SunflowerSVG type={type} isNew={isNew} size={size} />;
    default:
      return <RosetteSVG type={type} isNew={isNew} size={size} />;
  }
}

// Cloud with animation
function AnimatedCloud({ delay, duration }: { delay: number; duration: number }) {
  return (
    <div
      className="absolute animate-cloud-drift"
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <svg width="120" height="50" viewBox="0 0 120 50">
        <path
          d="M 10 30 Q 20 15 40 15 Q 50 5 65 10 Q 75 8 85 20 Q 95 18 105 25 L 105 35 Q 95 40 85 38 Q 75 42 65 38 Q 50 42 40 35 Q 20 38 10 35 Z"
          fill="white"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}

// Sky sparkles
function SkySparkles() {
  const sparkles = Array.from({ length: 13 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 50,
    symbol: ["✦", "✧", "⋆"][i % 3],
  }));

  return (
    <>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute animate-sparkle-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: "16px",
            color: "#fbbf24",
            opacity: 0.6,
            animationDelay: `${s.id * 0.3}s`,
          }}
        >
          {s.symbol}
        </div>
      ))}
    </>
  );
}

function FlowerCard({ flower, isNew }: {
  flower: { id: number; courseName: string; flowerType: number; bloomedAt: Date; positionX: number; positionY: number };
  isNew?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn("flex flex-col items-center gap-2 cursor-pointer group", isNew && "animate-bloom-in")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={cn("transition-bloom", hovered && "animate-float-up")}>
        {getFlowerSVG(flower.flowerType, isNew, 100)}
      </div>

      {/* Rich tooltip */}
      {hovered && (
        <div className="absolute z-10 backdrop-blur-md bg-white/90 rounded-xl p-3 shadow-lg border border-white/50 text-center min-w-max">
          <p className="text-xs font-bold text-foreground">{flower.courseName}</p>
          <p className="text-xs text-muted-foreground mt-1">{format(new Date(flower.bloomedAt), "d MMM yy", { locale: es })}</p>
        </div>
      )}

      {/* Always visible name below */}
      {!hovered && (
        <p className="text-xs font-semibold text-muted-foreground max-w-24 text-center leading-tight truncate">
          {flower.courseName.slice(0, 14)}{flower.courseName.length > 14 ? "…" : ""}
        </p>
      )}
    </div>
  );
}

// Sparkle particles for new bloom
function BloomSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 16 }, (_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-sparkle"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            backgroundColor: ["#f9a8d4", "#c4b5fd", "#fbbf24", "#93c5fd"][i % 4],
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Garden() {
  const { data: flowers, isLoading } = trpc.garden.flowers.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();
  const shareMutation = trpc.garden.share.useMutation({
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}/garden-public/${data.shareToken}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("Enlace copiado al portapapeles", { description: fullUrl });
    },
    onError: () => toast.error("Error al generar enlace de compartir"),
  });
  const [newFlowerIds, setNewFlowerIds] = useState<Set<number>>(new Set());
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  // Detect new flowers
  useEffect(() => {
    if (!flowers) return;
    if (flowers.length > prevCount && prevCount > 0) {
      const newIds = flowers.slice(-1).map((f) => f.id);
      setNewFlowerIds(new Set(newIds));
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 3000);
      setTimeout(() => setNewFlowerIds(new Set()), 2000);
    }
    setPrevCount(flowers.length);
  }, [flowers?.length]);

  const completedCourses = (courses ?? []).filter((c) => c.status === "completed");
  const totalCourses = courses?.length ?? 0;
  const completionPercentage = totalCourses > 0 ? Math.round((completedCourses.length / totalCourses) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Flower2 className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Digital Garden 🌸
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cada curso completado hace florecer una flor. ¡Sigue cultivando!
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/20 to-pink-200/20 border border-primary/30">
          <Sparkles className="w-5 h-5 text-primary" strokeWidth={2} />
          <span className="text-sm font-bold text-primary">{flowers?.length ?? 0}/8 flores</span>
        </div>
      </div>

      {/* Main Garden */}
      <div className="relative bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 rounded-3xl shadow-xl overflow-hidden mb-6" style={{ minHeight: "580px" }}>
        {/* Atmospheric sky gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, oklch(0.88 0.08 240) 0%, oklch(0.90 0.06 280) 20%, oklch(0.91 0.05 200) 40%, oklch(0.88 0.12 140) 60%, oklch(0.85 0.14 130) 100%)"
        }} />

        {/* Pulsing sun with halo */}
        <div className="absolute top-12 right-16 z-10">
          <div className="absolute w-20 h-20 rounded-full bg-yellow-200 animate-pulse" style={{ boxShadow: "0 0 40px rgba(253,224,71,0.7), 0 0 80px rgba(253,224,71,0.3)" }} />
          <div className="absolute w-16 h-16 top-2 left-2 rounded-full bg-yellow-300/60" style={{ boxShadow: "inset 0 0 20px rgba(255,255,255,0.5)" }} />
        </div>

        {/* Animated clouds */}
        <AnimatedCloud delay={0} duration={20} />
        <AnimatedCloud delay={5} duration={25} />
        <AnimatedCloud delay={10} duration={22} />

        {/* Sky sparkles */}
        <SkySparkles />

        {/* Ground layer */}
        <div className="absolute bottom-0 left-0 right-0 h-40 rounded-b-3xl" style={{
          background: "linear-gradient(180deg, oklch(0.72 0.14 130) 0%, oklch(0.62 0.16 130) 100%)"
        }} />

        {/* Grass blades animation */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-around px-4">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="w-1 rounded-full animate-garden-sway" style={{
              height: `${14 + Math.random() * 18}px`,
              backgroundColor: `oklch(${0.50 + Math.random() * 0.12} 0.17 130)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2.5 + Math.random() * 2.5}s`,
            }} />
          ))}
        </div>

        {/* Bloom sparkles for new flowers */}
        {showSparkles && <BloomSparkles />}

        {/* Flowers section */}
        {isLoading ? (
          <div className="absolute bottom-40 left-0 right-0 flex items-end justify-start gap-6 px-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse" />
                <div className="w-16 h-3 rounded bg-white/20 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (flowers ?? []).length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-10 shadow-2xl max-w-md">
              <Flower2 className="w-16 h-16 text-primary/50 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-bold text-xl text-foreground mb-2">Tu jardín está vacío</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Completa tu primer curso para plantar una flor aquí. Cada curso completado hace crecer una flor única.
              </p>
              <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg transition-bloom hover:bg-primary/90">
                <BookOpen className="w-4 h-4" strokeWidth={2} />
                Ver mis cursos
              </Link>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-32 left-0 right-0 px-8 z-20">
            <div className="flex flex-wrap items-end justify-start gap-8">
              {(flowers ?? []).map((flower) => (
                <FlowerCard
                  key={flower.id}
                  flower={flower}
                  isNew={newFlowerIds.has(flower.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics bar */}
      {(flowers ?? []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-4 border border-pink-200/50">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Flores Bloomed</p>
            <p className="text-3xl font-black text-pink-600">{flowers?.length ?? 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-200/50">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Cursos Activos</p>
            <p className="text-3xl font-black text-purple-600">{Math.max(0, totalCourses - completedCourses.length)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Completados</p>
            <p className="text-3xl font-black text-blue-600">{completedCourses.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50">
            <p className="text-xs text-muted-foreground font-semibold mb-1">Progreso</p>
            <p className="text-3xl font-black text-emerald-600">{completionPercentage}%</p>
          </div>
        </div>
      )}

      {/* Flower legend */}
      {(flowers ?? []).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
          <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" strokeWidth={1.8} />
            Flores del Jardín ({flowers?.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(flowers ?? []).map((flower) => (
              <div key={flower.id} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-md transition-bloom border border-slate-200/50">
                <div className="flex-shrink-0 pt-1">
                  {getFlowerSVG(flower.flowerType, false, 48)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{flower.courseName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(flower.bloomedAt), "d MMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-100/20 border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">💡 ¿Cómo hacer crecer flores?</p>
          <p className="text-xs text-muted-foreground">
            Ve a <strong>Cursos</strong>, marca un curso como completado y una nueva flor aparecerá automáticamente con una animación mágica.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/20 border border-amber-200/50">
          <p className="text-sm font-semibold text-foreground mb-2">🌱 Compartir tu jardín</p>
          <button
            onClick={() => shareMutation.mutate()}
            disabled={shareMutation.isPending}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
          >
            {shareMutation.isPending ? "Generando..." : "Genera un enlace público →"}
          </button>
        </div>
      </div>
    </div>
  );
}
