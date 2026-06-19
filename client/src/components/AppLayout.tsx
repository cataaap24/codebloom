import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  Flower2,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/courses", label: "Cursos", icon: BookOpen },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/notes", label: "Notas", icon: FileText },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/garden", label: "Jardín", icon: Flower2 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("¡Hasta pronto! 🌸");
      window.location.href = "/";
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bloom-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-soft">
            <Flower2 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium text-sm">Cargando CodeBloom...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bloom-gradient flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-bloom-lg max-w-sm w-full text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Flower2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">CodeBloom</h2>
          <p className="text-muted-foreground text-sm mb-6">Inicia sesión para acceder a tu jardín de aprendizaje</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center justify-center w-full py-3 px-6 rounded-2xl bg-primary text-white font-semibold text-sm transition-bloom hover:bg-primary/90 hover:shadow-bloom"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "CB";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border",
        mobile ? "w-72" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <Flower2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-foreground leading-none">CodeBloom</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tu jardín de aprendizaje</p>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-bloom"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-bloom group",
                active
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5 flex-shrink-0 transition-bloom",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/60">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-bloom flex-shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 animate-slide-in-up">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-bloom"
          >
            <Menu className="w-5 h-5 text-foreground" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-primary" />
            <span className="font-extrabold text-foreground">CodeBloom</span>
          </div>
          <div className="ml-auto w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
