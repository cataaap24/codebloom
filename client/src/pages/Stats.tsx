import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart3, Clock, Flame, Trophy, BookOpen, Plus, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

type SessionForm = {
  courseId: string;
  durationMinutes: number;
  sessionDate: string;
  notes: string;
};

export default function Stats() {
  const utils = trpc.useUtils();
  const { data: stats } = trpc.stats.dashboard.useQuery();
  const { data: studyStats } = trpc.stats.study.useQuery();
  const { data: achievements } = trpc.stats.achievements.useQuery();
  const { data: sessions } = trpc.studySessions.list.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();

  const createSession = trpc.studySessions.create.useMutation({
    onSuccess: () => {
      utils.studySessions.list.invalidate();
      utils.stats.dashboard.invalidate();
      utils.stats.study.invalidate();
      toast.success("Sesión registrada ⏱️");
      setShowForm(false);
      reset();
    },
    onError: () => toast.error("Error al registrar la sesión"),
  });

  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<SessionForm>({
    defaultValues: { courseId: "", durationMinutes: 30, sessionDate: format(new Date(), "yyyy-MM-dd"), notes: "" },
  });

  const onSubmit = (data: SessionForm) => {
    createSession.mutate({
      courseId: data.courseId ? parseInt(data.courseId) : undefined,
      durationMinutes: Number(data.durationMinutes),
      sessionDate: data.sessionDate,
      notes: data.notes || undefined,
    });
  };

  // Build last 14 days chart data
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const daySessions = (sessions ?? []).filter((s) => {
      const sDate = typeof s.sessionDate === "string" ? s.sessionDate : format(new Date(s.sessionDate), "yyyy-MM-dd");
      return sDate === dateStr;
    });
    const minutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      date: format(date, "d MMM", { locale: es }),
      minutos: minutes,
      horas: Math.round((minutes / 60) * 10) / 10,
    };
  });

  // Sessions by course
  const courseStats = (courses ?? []).map((course) => {
    const courseSessions = (sessions ?? []).filter((s) => s.courseId === course.id);
    const totalMin = courseSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      name: `${course.emoji} ${course.name.slice(0, 15)}${course.name.length > 15 ? "…" : ""}`,
      horas: Math.round((totalMin / 60) * 10) / 10,
    };
  }).filter((c) => c.horas > 0).sort((a, b) => b.horas - a.horas).slice(0, 6);

  const totalHours = Math.round(((studyStats?.totalMinutes ?? 0) / 60) * 10) / 10;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-500" strokeWidth={1.8} />
            Estadísticas
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Tu progreso de aprendizaje</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Registrar sesión
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        {[
          { label: "Horas totales", value: `${totalHours}h`, icon: Clock, color: "bg-sky-light text-sky-500", sub: "de estudio acumulado" },
          { label: "Racha actual", value: `${studyStats?.streak ?? 0} días`, icon: Flame, color: "bg-peach/40 text-orange-500", sub: studyStats?.streak ? "¡Sigue así! 🔥" : "Estudia hoy para empezar" },
          { label: "Cursos completados", value: stats?.completedCourses ?? 0, icon: BookOpen, color: "bg-lavender-light text-primary", sub: "flores en tu jardín" },
          { label: "Logros ganados", value: achievements?.length ?? 0, icon: Trophy, color: "bg-amber-100 text-amber-600", sub: "reconocimientos" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-bloom transition-bloom hover:shadow-bloom-lg hover:-translate-y-0.5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily study chart */}
        <div className="bg-white rounded-2xl p-5 shadow-bloom">
          <h2 className="font-bold text-foreground mb-4">Minutos de estudio — últimos 14 días</h2>
          {(sessions ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Clock className="w-10 h-10 text-muted-foreground mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Registra sesiones para ver tu progreso</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last14Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ff" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "Nunito" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: "Nunito" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(196,181,253,0.2)", fontFamily: "Nunito", fontSize: "12px" }}
                  formatter={(value: number) => [`${value} min`, "Estudio"]}
                />
                <Bar dataKey="minutos" fill="#c4b5fd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Course hours */}
        <div className="bg-white rounded-2xl p-5 shadow-bloom">
          <h2 className="font-bold text-foreground mb-4">Horas por curso</h2>
          {courseStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mb-2" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Registra sesiones asociadas a cursos</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={courseStats} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ff" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fontFamily: "Nunito" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontFamily: "Nunito" }} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(196,181,253,0.2)", fontFamily: "Nunito", fontSize: "12px" }}
                  formatter={(value: number) => [`${value}h`, "Horas"]}
                />
                <Bar dataKey="horas" fill="#f9a8d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-5 shadow-bloom">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4.5 h-4.5 text-amber-500" strokeWidth={1.8} />
          Logros obtenidos
        </h2>
        {(achievements ?? []).length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Completa cursos para desbloquear logros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {(achievements ?? []).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="font-bold text-sm text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{format(new Date(a.earnedAt), "d MMM yyyy", { locale: es })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-bloom-lg w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-foreground">Registrar sesión de estudio</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-muted transition-bloom">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Curso (opcional)</label>
                <select {...register("courseId")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                  <option value="">Sin curso específico</option>
                  {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Duración (minutos)</label>
                  <input type="number" min={1} max={480} {...register("durationMinutes", { valueAsNumber: true })} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Fecha</label>
                  <input type="date" {...register("sessionDate")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Notas (opcional)</label>
                <textarea {...register("notes")} rows={2} placeholder="¿Qué aprendiste hoy?" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom resize-none" />
              </div>
              <button type="submit" disabled={createSession.isPending} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-bloom transition-bloom hover:bg-primary/90 disabled:opacity-60">
                {createSession.isPending ? "Registrando..." : "Registrar sesión"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
