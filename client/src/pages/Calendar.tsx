import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CalendarDays, Plus, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";

type EventType = "study" | "deadline" | "reminder" | "other";

const EVENT_COLORS: Record<EventType, string> = {
  study: "bg-lavender-light text-primary border-primary/30",
  deadline: "bg-pink-light text-pink-600 border-pink-200",
  reminder: "bg-sky-light text-sky-600 border-sky-200",
  other: "bg-beige text-amber-700 border-amber-200",
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  study: "Estudio",
  deadline: "Entrega",
  reminder: "Recordatorio",
  other: "Otro",
};

type FormData = {
  title: string;
  description: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  courseId: string;
  color: string;
};

export default function Calendar() {
  const utils = trpc.useUtils();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: events, isLoading } = trpc.calendar.list.useQuery({
    startDate: weekStart,
    endDate: weekEnd,
  });
  const { data: courses } = trpc.courses.list.useQuery();

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => { utils.calendar.list.invalidate(); toast.success("Evento creado 📅"); setShowForm(false); reset(); },
    onError: () => toast.error("Error al crear el evento"),
  });
  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => { utils.calendar.list.invalidate(); toast.success("Evento eliminado"); },
  });

  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: { title: "", description: "", eventType: "study", startTime: "", endTime: "", courseId: "", color: "#c4b5fd" },
  });

  const onSubmit = (data: FormData) => {
    if (!data.startTime) { toast.error("La hora de inicio es requerida"); return; }
    createMutation.mutate({
      title: data.title,
      description: data.description || undefined,
      eventType: data.eventType,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      courseId: data.courseId ? parseInt(data.courseId) : undefined,
      color: data.color,
    });
  };

  const openFormForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setValue("startTime", `${dateStr}T09:00`);
    setValue("endTime", `${dateStr}T10:00`);
    setSelectedDate(date);
    setShowForm(true);
  };

  const eventsByDay = useMemo(() => {
    const map = new Map<string, typeof events>();
    weekDays.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map.set(key, (events ?? []).filter((e) => isSameDay(new Date(e.startTime), day)));
    });
    return map;
  }, [events, weekDays]);

  const today = new Date();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-500" strokeWidth={1.8} />
            Calendario
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(weekStart, "d MMM", { locale: es })} — {format(weekEnd, "d MMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="p-2 rounded-xl bg-white border border-border hover:bg-muted transition-bloom shadow-sm">
            <ChevronLeft className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
          <button onClick={() => setCurrentWeek(new Date())} className="px-3 py-2 rounded-xl bg-white border border-border text-xs font-semibold hover:bg-muted transition-bloom shadow-sm">
            Hoy
          </button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="p-2 rounded-xl bg-white border border-border hover:bg-muted transition-bloom shadow-sm">
            <ChevronRight className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
          <button onClick={() => { reset(); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Evento
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="bg-white rounded-2xl shadow-bloom overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={day.toISOString()} className={cn("p-3 text-center border-r border-border last:border-r-0", isToday && "bg-primary/5")}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {format(day, "EEE", { locale: es })}
                </p>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-bold", isToday ? "bg-primary text-white" : "text-foreground")}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-7 min-h-64">
          {weekDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(key) ?? [];
            const isToday = isSameDay(day, today);

            return (
              <div
                key={key}
                onClick={() => openFormForDay(day)}
                className={cn("p-2 border-r border-border last:border-r-0 min-h-32 cursor-pointer hover:bg-muted/30 transition-bloom", isToday && "bg-primary/3")}
              >
                {isLoading ? (
                  <div className="h-8 rounded-lg bg-muted animate-pulse" />
                ) : (
                  <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn("px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-default group relative", EVENT_COLORS[event.eventType as EventType])}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="truncate flex-1">{event.title}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: event.id }); }}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-bloom"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 opacity-70">
                          <Clock className="w-2.5 h-2.5" strokeWidth={2} />
                          <span>{format(new Date(event.startTime), "HH:mm")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {dayEvents.length === 0 && !isLoading && (
                  <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-bloom">
                    <Plus className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
          <div key={type} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border", EVENT_COLORS[type])}>
            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
            {label}
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-bloom-lg w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-foreground">
                Nuevo evento
                {selectedDate && <span className="text-sm font-normal text-muted-foreground ml-2">— {format(selectedDate, "d MMM", { locale: es })}</span>}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-muted transition-bloom">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Título *</label>
                <input {...register("title", { required: true })} placeholder="Nombre del evento" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tipo</label>
                <select {...register("eventType")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                  <option value="study">Sesión de estudio</option>
                  <option value="deadline">Fecha de entrega</option>
                  <option value="reminder">Recordatorio</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Inicio *</label>
                  <input type="datetime-local" {...register("startTime")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Fin</label>
                  <input type="datetime-local" {...register("endTime")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Curso relacionado</label>
                <select {...register("courseId")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                  <option value="">Sin curso</option>
                  {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-bloom transition-bloom hover:bg-primary/90 disabled:opacity-60">
                {createMutation.isPending ? "Creando..." : "Crear evento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
