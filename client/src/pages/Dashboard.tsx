import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookOpen, CheckSquare, Clock, Flame, Flower2, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-600 border-red-200",
  medium: "bg-amber-100 text-amber-600 border-amber-200",
  low: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

const LABEL_COLORS = {
  course: "bg-lavender-light text-primary",
  project: "bg-pink-light text-pink-600",
  practice: "bg-sky-light text-sky-600",
};

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-primary/10 text-primary",
  paused: "bg-amber-100 text-amber-700",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.stats.dashboard.useQuery();
  const { data: courses, isLoading: coursesLoading } = trpc.courses.list.useQuery();
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.list.useQuery();
  const { data: achievements } = trpc.stats.achievements.useQuery();

  const activeCourses = courses?.filter((c) => c.status === "active").slice(0, 3) ?? [];
  const pendingTasks = tasks?.filter((t) => t.status !== "completed").slice(0, 5) ?? [];
  const recentAchievements = achievements?.slice(0, 3) ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 18) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="animate-slide-in-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {greeting()}, {user?.name?.split(" ")[0] || "Bloomie"}! 🌸
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90 hover:shadow-bloom-lg"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo curso
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          {
            label: "Cursos activos",
            value: statsLoading ? "—" : stats?.activeCourses ?? 0,
            icon: BookOpen,
            color: "bg-lavender-light text-primary",
            bg: "bg-white",
          },
          {
            label: "Tareas pendientes",
            value: statsLoading ? "—" : stats?.pendingTasks ?? 0,
            icon: CheckSquare,
            color: "bg-pink-light text-pink-500",
            bg: "bg-white",
          },
          {
            label: "Horas de estudio",
            value: statsLoading ? "—" : `${stats?.totalHours ?? 0}h`,
            icon: Clock,
            color: "bg-sky-light text-sky-500",
            bg: "bg-white",
          },
          {
            label: "Racha de días",
            value: statsLoading ? "—" : `${stats?.streak ?? 0}🔥`,
            icon: Flame,
            color: "bg-peach/40 text-orange-500",
            bg: "bg-white",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 shadow-bloom transition-bloom hover:shadow-bloom-lg hover:-translate-y-0.5`}>
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active courses */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-bloom">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-primary" strokeWidth={1.8} />
              Cursos activos
            </h2>
            <Link href="/courses" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-bloom">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {coursesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : activeCourses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground">No hay cursos activos</p>
              <Link href="/courses" className="text-sm text-primary font-semibold mt-2 inline-block">
                Agregar curso →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-bloom">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${course.color}22` }}
                  >
                    {course.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground truncate">{course.name}</p>
                      <span className="text-xs font-bold text-primary flex-shrink-0">{Math.round(course.progress)}%</span>
                    </div>
                    <div className="progress-bloom">
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                    {course.category && (
                      <p className="text-xs text-muted-foreground mt-1">{course.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Pending tasks */}
          <div className="bg-white rounded-2xl p-5 shadow-bloom">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-pink-500" strokeWidth={1.8} />
                Tareas pendientes
              </h2>
              <Link href="/tasks" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-bloom">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {tasksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">¡Todo al día! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted/40 transition-bloom">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", {
                      "bg-red-400": task.priority === "high",
                      "bg-amber-400": task.priority === "medium",
                      "bg-emerald-400": task.priority === "low",
                    })} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded-md font-medium", LABEL_COLORS[task.label])}>
                          {task.label}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.dueDate), "d MMM", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent achievements */}
          <div className="bg-white rounded-2xl p-5 shadow-bloom">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-amber-500" strokeWidth={1.8} />
                Logros recientes
              </h2>
              <Link href="/stats" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-bloom">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAchievements.length === 0 ? (
              <div className="text-center py-4">
                <Flower2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">Completa cursos para ganar logros</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAchievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/60">
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
