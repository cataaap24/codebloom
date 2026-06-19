import { useState, useEffect } from "react";
import { Flower2, Sparkles, BookOpen, Share2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Flower SVG Components ────────────────────────────────────────────────────

const FLOWER_COLORS = [
  { petals: "#f9a8d4", center: "#fbbf24", stem: "#86efac" },  // pink
  { petals: "#c4b5fd", center: "#fde68a", stem: "#6ee7b7" },  // lavender
  { petals: "#93c5fd", center: "#fcd34d", stem: "#a7f3d0" },  // blue
  { petals: "#6ee7b7", center: "#fbbf24", stem: "#86efac" },  // mint
  { petals: "#fca5a5", center: "#fde68a", stem: "#6ee7b7" },  // red-pink
  { petals: "#fdba74", center: "#fbbf24", stem: "#a7f3d0" },  // peach
];

function FlowerSVG({ type, isNew, size = 80 }: { type: number; isNew?: boolean; size?: number }) {
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
      viewBox="0 0 80 80"
      className={cn("transition-all duration-700", animated ? "opacity-100 scale-100" : "opacity-0 scale-0")}
      style={{ transformOrigin: "center bottom" }}
    >
      {/* Stem */}
      <line x1="40" y1="75" x2="40" y2="45" stroke={colors.stem} strokeWidth="3" strokeLinecap="round" />
      {/* Leaves */}
      <ellipse cx="33" cy="60" rx="7" ry="4" fill={colors.stem} opacity="0.8" transform="rotate(-30 33 60)" />
      <ellipse cx="47" cy="55" rx="7" ry="4" fill={colors.stem} opacity="0.8" transform="rotate(30 47 55)" />

      {/* Petals - 6 petals */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx={40 + 13 * Math.cos((angle * Math.PI) / 180)}
          cy={40 + 13 * Math.sin((angle * Math.PI) / 180)}
          rx="8"
          ry="5"
          fill={colors.petals}
          opacity="0.9"
          transform={`rotate(${angle} ${40 + 13 * Math.cos((angle * Math.PI) / 180)} ${40 + 13 * Math.sin((angle * Math.PI) / 180)})`}
          className={isNew ? "animate-petal-sway" : ""}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}

      {/* Center */}
      <circle cx="40" cy="40" r="8" fill={colors.center} />
      <circle cx="40" cy="40" r="4" fill="white" opacity="0.5" />
    </svg>
  );
}

function FlowerCard({ flower, isNew }: {
  flower: { id: number; courseName: string; flowerType: number; bloomedAt: Date; positionX: number; positionY: number };
  isNew?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn("flex flex-col items-center gap-1 cursor-pointer group", isNew && "animate-bloom-in")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={cn("transition-bloom", hovered && "animate-float-up")}>
        <FlowerSVG type={flower.flowerType} isNew={isNew} size={72} />
      </div>

      {/* Tooltip */}
      <div className={cn("text-center transition-bloom", hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1")}>
        <p className="text-xs font-bold text-foreground max-w-20 text-center leading-tight">{flower.courseName}</p>
        <p className="text-xs text-muted-foreground">{format(new Date(flower.bloomedAt), "d MMM yy", { locale: es })}</p>
      </div>

      {/* Always visible name below */}
      {!hovered && (
        <p className="text-xs font-semibold text-muted-foreground max-w-20 text-center leading-tight truncate">
          {flower.courseName.slice(0, 12)}{flower.courseName.length > 12 ? "…" : ""}
        </p>
      )}
    </div>
  );
}

// Sparkle particles for new bloom
function BloomSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }, (_, i) => (
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Flower2 className="w-6 h-6 text-primary" strokeWidth={1.8} />
            Mi Jardín Digital
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {flowers?.length ?? 0} flores · cada una representa un curso completado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => shareMutation.mutate()}
            disabled={shareMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {shareMutation.isPending ? "Generando..." : "Compartir"}
          </button>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Completa cursos para hacer crecer flores
          </div>
        </div>
      </div>

      {/* Garden area */}
      <div className="relative bg-white rounded-3xl shadow-bloom-lg overflow-hidden mb-6" style={{ minHeight: "480px" }}>
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, oklch(0.92 0.05 220) 0%, oklch(0.94 0.04 160) 40%, oklch(0.88 0.08 130) 70%, oklch(0.82 0.10 130) 100%)"
        }} />

        {/* Clouds */}
        <div className="absolute top-6 left-12 w-20 h-8 bg-white/60 rounded-full blur-sm animate-float-up" style={{ animationDuration: "6s" }} />
        <div className="absolute top-10 left-24 w-14 h-6 bg-white/50 rounded-full blur-sm animate-float-up" style={{ animationDuration: "8s", animationDelay: "1s" }} />
        <div className="absolute top-8 right-20 w-24 h-8 bg-white/60 rounded-full blur-sm animate-float-up" style={{ animationDuration: "7s", animationDelay: "2s" }} />
        <div className="absolute top-14 right-36 w-16 h-6 bg-white/50 rounded-full blur-sm animate-float-up" style={{ animationDuration: "9s", animationDelay: "0.5s" }} />

        {/* Sun */}
        <div className="absolute top-8 right-12 w-14 h-14 rounded-full bg-yellow-200/80 shadow-lg animate-pulse-soft" style={{ boxShadow: "0 0 30px rgba(253,224,71,0.5)" }} />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-32 rounded-b-3xl" style={{
          background: "linear-gradient(180deg, oklch(0.75 0.12 130) 0%, oklch(0.65 0.14 130) 100%)"
        }} />

        {/* Grass texture */}
        <div className="absolute bottom-28 left-0 right-0 flex justify-around">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="w-1 rounded-full animate-petal-sway" style={{
              height: `${12 + Math.random() * 16}px`,
              backgroundColor: `oklch(${0.55 + Math.random() * 0.1} 0.15 130)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }} />
          ))}
        </div>

        {/* Sparkles overlay for new bloom */}
        {showSparkles && <BloomSparkles />}

        {/* Flowers */}
        {isLoading ? (
          <div className="absolute bottom-24 left-0 right-0 flex items-end justify-center gap-8 px-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-white/30 animate-pulse" />
                <div className="w-12 h-3 rounded bg-white/30 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (flowers ?? []).length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-bloom max-w-sm">
              <Flower2 className="w-12 h-12 text-primary/40 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="font-bold text-foreground mb-2">Tu jardín está vacío</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Completa tu primer curso para plantar una flor aquí. Cada curso completado hace crecer una flor única.
              </p>
              <Link href="/courses" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
                <BookOpen className="w-4 h-4" strokeWidth={2} />
                Ver mis cursos
              </Link>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-24 left-0 right-0 px-8">
            <div className="flex flex-wrap items-end justify-start gap-6">
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

      {/* Flower legend */}
      {(flowers ?? []).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-bloom">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-amber-500" strokeWidth={1.8} />
            Flores del jardín ({flowers?.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 stagger-children">
            {(flowers ?? []).map((flower) => (
              <div key={flower.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-bloom">
                <FlowerSVG type={flower.flowerType} size={40} />
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-foreground truncate">{flower.courseName}</p>
                  <p className="text-xs text-muted-foreground">
                    🌸 {format(new Date(flower.bloomedAt), "d MMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-start gap-3">
        <Flower2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.8} />
        <div>
          <p className="text-sm font-semibold text-foreground">¿Cómo hacer crecer flores?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ve a la sección de <strong>Cursos</strong>, edita cualquier curso activo y cambia su estado a <strong>"Completado"</strong>. 
            Una nueva flor aparecerá automáticamente en tu jardín con una animación especial. 🌸
          </p>
        </div>
      </div>
    </div>
  );
}
