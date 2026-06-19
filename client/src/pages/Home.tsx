import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { BookOpen, BarChart3, CheckSquare, Flower2, Sparkles, Star } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bloom-gradient flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-soft">
          <Flower2 className="w-5 h-5 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-gradient overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-soft/30 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-light/40 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-lavender-light/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/80 shadow-bloom flex items-center justify-center">
              <Flower2 className="w-5 h-5 text-primary" />
            </div>
            <span className="font-extrabold text-xl text-foreground">CodeBloom</span>
          </div>
          <a
            href={getLoginUrl()}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white font-semibold text-sm shadow-bloom transition-bloom hover:bg-primary/90 hover:shadow-bloom-lg"
          >
            Comenzar
          </a>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="animate-slide-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 shadow-bloom text-sm font-semibold text-primary mb-8">
              <Sparkles className="w-4 h-4" />
              Tu jardín de aprendizaje personal
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Aprende con{" "}
              <span className="text-primary">amor</span>
              <br />y{" "}
              <span className="text-pink-500">floreciendo</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Organiza tus cursos de programación, registra tu progreso y ve crecer tu jardín digital
              con cada logro que alcanzas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={getLoginUrl()}
                className="px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-bloom-lg transition-bloom hover:bg-primary/90 hover:shadow-bloom-lg hover:-translate-y-0.5"
              >
                🌸 Empezar a florecer
              </a>
              <a
                href={getLoginUrl()}
                className="px-8 py-4 rounded-2xl bg-white/80 text-foreground font-bold text-base shadow-bloom transition-bloom hover:bg-white hover:shadow-bloom-lg hover:-translate-y-0.5"
              >
                Ver demo
              </a>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20 stagger-children">
            {[
              { icon: BookOpen, title: "Cursos", desc: "Organiza y sigue tu progreso", color: "bg-lavender-light text-primary" },
              { icon: CheckSquare, title: "Tareas", desc: "Gestiona con prioridades", color: "bg-pink-light text-pink-500" },
              { icon: BarChart3, title: "Estadísticas", desc: "Visualiza tu dedicación", color: "bg-sky-light text-sky-500" },
              { icon: Flower2, title: "Jardín", desc: "Flores por cada logro", color: "bg-mint/30 text-emerald-500" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-bloom text-left transition-bloom hover:shadow-bloom-lg hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-muted-foreground">
          <p>Hecho con <Star className="w-3.5 h-3.5 inline text-yellow-400 fill-yellow-400" /> y mucho café ☕</p>
        </footer>
      </div>
    </div>
  );
}
