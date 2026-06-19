import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { CheckSquare, Plus, Trash2, X, Search, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type TaskLabel = "course" | "project" | "practice";
type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "pending" | "in_progress" | "completed";

const LABEL_CONFIG: Record<TaskLabel, { label: string; color: string }> = {
  course: { label: "Curso", color: "bg-lavender-light text-primary border-primary/20" },
  project: { label: "Proyecto", color: "bg-pink-light text-pink-600 border-pink-200" },
  practice: { label: "Práctica", color: "bg-sky-light text-sky-600 border-sky-200" },
};
const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string }> = {
  high: { label: "Alta", dot: "bg-red-400" },
  medium: { label: "Media", dot: "bg-amber-400" },
  low: { label: "Baja", dot: "bg-emerald-400" },
};

type FormData = {
  title: string;
  description: string;
  label: TaskLabel;
  priority: TaskPriority;
  dueDate: string;
  courseId: string;
};

export default function Tasks() {
  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.stats.dashboard.invalidate(); toast.success("Tarea creada ✅"); setShowForm(false); reset(); },
    onError: () => toast.error("Error al crear la tarea"),
  });
  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.stats.dashboard.invalidate(); },
    onError: () => toast.error("Error al actualizar"),
  });
  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); utils.stats.dashboard.invalidate(); toast.success("Tarea eliminada"); },
  });

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLabel, setFilterLabel] = useState<TaskLabel | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [showCompleted, setShowCompleted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { title: "", description: "", label: "course", priority: "medium", dueDate: "", courseId: "" },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate({
      title: data.title,
      description: data.description || undefined,
      label: data.label,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      courseId: data.courseId ? parseInt(data.courseId) : undefined,
    });
  };

  const toggleComplete = (task: NonNullable<typeof tasks>[0]) => {
    const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
    updateMutation.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () => {
          if (newStatus === "completed") {
            toast.success("¡Tarea completada! ✅", { description: task.title });
          } else {
            toast.info("Tarea marcada como pendiente");
          }
        },
      }
    );
  };

  const filtered = (tasks ?? []).filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchLabel = filterLabel === "all" || t.label === filterLabel;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchCompleted = showCompleted || t.status !== "completed";
    return matchSearch && matchLabel && matchPriority && matchCompleted;
  });

  const pending = filtered.filter((t) => t.status !== "completed");
  const completed = filtered.filter((t) => t.status === "completed");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-pink-500" strokeWidth={1.8} />
            Mis Tareas
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pending.length} pendientes · {completed.length} completadas
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nueva tarea
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar tareas..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "course", "project", "practice"] as const).map((l) => (
            <button key={l} onClick={() => setFilterLabel(l)} className={cn("px-3 py-2 rounded-xl text-xs font-semibold transition-bloom", filterLabel === l ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted border border-border")}>
              {l === "all" ? "Todas" : LABEL_CONFIG[l].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "high", "medium", "low"] as const).map((p) => (
            <button key={p} onClick={() => setFilterPriority(p)} className={cn("px-3 py-2 rounded-xl text-xs font-semibold transition-bloom", filterPriority === p ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted border border-border")}>
              {p === "all" ? "Prioridad" : PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Pendientes ({pending.length})</h2>
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-bloom text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-foreground">¡Todo completado! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2 stagger-children">
                {pending.map((task) => (
                  <TaskCard key={task.id} task={task} onToggle={toggleComplete} onDelete={(id) => deleteMutation.mutate({ id })} />
                ))}
              </div>
            )}
          </div>

          {/* Completed toggle */}
          {completed.length > 0 && (
            <div>
              <button onClick={() => setShowCompleted(!showCompleted)} className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-foreground transition-bloom">
                Completadas ({completed.length}) {showCompleted ? "▲" : "▼"}
              </button>
              {showCompleted && (
                <div className="space-y-2 opacity-60">
                  {completed.map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={toggleComplete} onDelete={(id) => deleteMutation.mutate({ id })} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-bloom-lg w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-foreground">Nueva tarea</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-muted transition-bloom">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Título *</label>
                <input {...register("title", { required: true })} placeholder="¿Qué necesitas hacer?" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                {errors.title && <p className="text-xs text-destructive mt-1">El título es requerido</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Descripción</label>
                <textarea {...register("description")} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Etiqueta</label>
                  <select {...register("label")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                    <option value="course">Curso</option>
                    <option value="project">Proyecto</option>
                    <option value="practice">Práctica</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Prioridad</label>
                  <select {...register("priority")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Fecha límite</label>
                  <input type="date" {...register("dueDate")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Curso</label>
                  <select {...register("courseId")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                    <option value="">Sin curso</option>
                    {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-bloom transition-bloom hover:bg-primary/90 disabled:opacity-60">
                {createMutation.isPending ? "Creando..." : "Crear tarea"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type TaskCardItem = { id: number; userId: number; courseId: number | null; title: string; description: string | null; label: TaskLabel; priority: TaskPriority; status: TaskStatus; dueDate: Date | null; completedAt: Date | null; createdAt: Date; updatedAt: Date; };
function TaskCard({ task, onToggle, onDelete }: {
  task: TaskCardItem;
  onToggle: (task: TaskCardItem) => void;
  onDelete: (id: number) => void;
}) {
  const completed = task.status === "completed";
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-2xl bg-white shadow-bloom transition-bloom hover:shadow-bloom-lg group", completed && "opacity-60")}>
      <button onClick={() => onToggle(task)} className="mt-0.5 flex-shrink-0 transition-bloom hover:scale-110">
        {completed
          ? <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2} />
          : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" strokeWidth={1.8} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold text-sm text-foreground", completed && "line-through")}>{task.title}</p>
        {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={cn("text-xs px-2 py-0.5 rounded-lg font-semibold border", LABEL_CONFIG[task.label].color)}>
            {LABEL_CONFIG[task.label].label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={cn("w-2 h-2 rounded-full", PRIORITY_CONFIG[task.priority].dot)} />
            {PRIORITY_CONFIG[task.priority].label}
          </span>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              📅 {format(new Date(task.dueDate), "d MMM", { locale: es })}
            </span>
          )}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-bloom flex-shrink-0">
        <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.8} />
      </button>
    </div>
  );
}
