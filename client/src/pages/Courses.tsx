import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2, CheckCircle, PauseCircle, PlayCircle, X, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

type CourseStatus = "active" | "completed" | "paused";

const COURSE_COLORS = [
  "#c4b5fd", "#f9a8d4", "#93c5fd", "#6ee7b7", "#fcd34d", "#fb923c",
];
const COURSE_EMOJIS = ["🌸", "💻", "🎨", "🚀", "⚡", "🌿", "🦋", "🌙", "✨", "🎯"];
const CATEGORIES = ["Frontend", "Backend", "Diseño", "DevOps", "Data Science", "Mobile", "IA/ML", "Otro"];

const STATUS_CONFIG: Record<CourseStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Activo", color: "bg-emerald-100 text-emerald-700", icon: PlayCircle },
  completed: { label: "Completado", color: "bg-primary/10 text-primary", icon: CheckCircle },
  paused: { label: "Pausado", color: "bg-amber-100 text-amber-700", icon: PauseCircle },
};

type FormData = {
  name: string;
  description: string;
  category: string;
  progress: number;
  status: CourseStatus;
  color: string;
  emoji: string;
};

export default function Courses() {
  const utils = trpc.useUtils();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();
  const createMutation = trpc.courses.create.useMutation({
    onSuccess: () => { utils.courses.list.invalidate(); utils.stats.dashboard.invalidate(); toast.success("¡Curso creado! 🌱"); setShowForm(false); reset(); },
    onError: () => toast.error("Error al crear el curso"),
  });
  const updateMutation = trpc.courses.update.useMutation({
    onSuccess: (_, vars) => {
      utils.courses.list.invalidate();
      utils.stats.dashboard.invalidate();
      utils.garden.flowers.invalidate();
      utils.stats.achievements.invalidate();
      if (vars.status === "completed") {
        toast.success("¡Curso completado! 🌸", { description: "Una nueva flor ha brotado en tu jardín" });
      } else {
        toast.success("Curso actualizado ✨");
      }
      setEditId(null);
      setShowForm(false);
      reset();
    },
    onError: () => toast.error("Error al actualizar"),
  });
  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => { utils.courses.list.invalidate(); utils.stats.dashboard.invalidate(); toast.success("Curso eliminado"); },
    onError: () => toast.error("Error al eliminar"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<CourseStatus | "all">("all");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: "", description: "", category: "", progress: 0, status: "active", color: "#c4b5fd", emoji: "🌸" },
  });
  const watchColor = watch("color");
  const watchEmoji = watch("emoji");

  const openCreate = () => { reset({ name: "", description: "", category: "", progress: 0, status: "active", color: "#c4b5fd", emoji: "🌸" }); setEditId(null); setShowForm(true); };
  const openEdit = (course: NonNullable<typeof courses>[0]) => {
    reset({ name: course.name, description: course.description ?? "", category: course.category ?? "", progress: course.progress, status: course.status, color: course.color ?? "#c4b5fd", emoji: course.emoji ?? "🌸" });
    setEditId(course.id);
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (editId) {
      updateMutation.mutate({ id: editId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = (courses ?? []).filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.8} />
            Mis Cursos
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{courses?.length ?? 0} cursos en total</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nuevo curso
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "completed", "paused"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn("px-3 py-2 rounded-xl text-xs font-semibold transition-bloom", filterStatus === s ? "bg-primary text-white shadow-bloom" : "bg-white text-muted-foreground hover:bg-muted border border-border")}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-foreground mb-2">No hay cursos</h3>
          <p className="text-sm text-muted-foreground mb-4">Comienza agregando tu primer curso</p>
          <button onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
            Agregar curso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((course) => {
            const StatusIcon = STATUS_CONFIG[course.status].icon;
            return (
              <div key={course.id} className="bg-white rounded-2xl p-5 shadow-bloom transition-bloom hover:shadow-bloom-lg hover:-translate-y-0.5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${course.color}22` }}>
                      {course.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">{course.name}</h3>
                      {course.category && <p className="text-xs text-muted-foreground mt-0.5">{course.category}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-bloom">
                    <button onClick={() => openEdit(course)} className="p-1.5 rounded-lg hover:bg-muted transition-bloom">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
                    </button>
                    <button onClick={() => { if (confirm("¿Eliminar este curso?")) deleteMutation.mutate({ id: course.id }); }} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-bloom">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {course.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                )}

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Progreso</span>
                    <span className="font-bold text-primary">{Math.round(course.progress)}%</span>
                  </div>
                  <div className="progress-bloom">
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold", STATUS_CONFIG[course.status].color)}>
                    <StatusIcon className="w-3 h-3" strokeWidth={2} />
                    {STATUS_CONFIG[course.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{course.totalHours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-3xl p-6 shadow-bloom-lg w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-foreground">{editId ? "Editar curso" : "Nuevo curso"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-muted transition-bloom">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Emoji & Color */}
              <div className="flex gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COURSE_EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => setValue("emoji", e)}
                        className={cn("w-8 h-8 rounded-lg text-base transition-bloom", watchEmoji === e ? "bg-primary/15 ring-2 ring-primary" : "hover:bg-muted")}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COURSE_COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setValue("color", c)}
                        className={cn("w-7 h-7 rounded-lg transition-bloom", watchColor === c ? "ring-2 ring-offset-1 ring-foreground" : "")}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nombre *</label>
                <input {...register("name", { required: true })} placeholder="Ej: React desde cero" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                {errors.name && <p className="text-xs text-destructive mt-1">El nombre es requerido</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Descripción</label>
                <textarea {...register("description")} rows={2} placeholder="¿De qué trata este curso?" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Categoría</label>
                  <select {...register("category")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                    <option value="">Seleccionar</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Estado</label>
                  <select {...register("status")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Progreso: {watch("progress")}%</label>
                <input type="range" min={0} max={100} {...register("progress", { valueAsNumber: true })} className="w-full accent-primary" />
              </div>

              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-bloom transition-bloom hover:bg-primary/90 disabled:opacity-60">
                {createMutation.isPending || updateMutation.isPending ? "Guardando..." : editId ? "Guardar cambios" : "Crear curso"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
