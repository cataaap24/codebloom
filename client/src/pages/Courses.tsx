import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2, CheckCircle, PauseCircle, PlayCircle, X, Search, ExternalLink } from "lucide-react";
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
  courseLink?: string;
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
    defaultValues: { name: "", description: "", category: "", progress: 0, status: "active", color: "#c4b5fd", emoji: "🌸", courseLink: "" },
  });
  const watchColor = watch("color");
  const watchEmoji = watch("emoji");

  const openCreate = () => { reset({ name: "", description: "", category: "", progress: 0, status: "active", color: "#c4b5fd", emoji: "🌸", courseLink: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (course: NonNullable<typeof courses>[0]) => {
    reset({ name: course.name, description: course.description ?? "", category: course.category ?? "", progress: course.progress, status: course.status, color: course.color ?? "#c4b5fd", emoji: course.emoji ?? "🌸", courseLink: course.courseLink ?? "" });
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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" strokeWidth={1.8} />
            Mis Cursos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} {filtered.length === 1 ? "curso" : "cursos"}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white font-semibold text-sm transition-bloom hover:shadow-bloom active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo curso
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "completed", "paused"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2.5 rounded-2xl font-semibold text-sm transition-bloom",
                filterStatus === status
                  ? "bg-primary text-white shadow-bloom"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {status === "all" ? "Todos" : status === "active" ? "Activo" : status === "completed" ? "Completado" : "Pausado"}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-bloom-lg animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-foreground">{editId ? "Editar curso" : "Nuevo curso"}</h2>
              <button onClick={() => { setShowForm(false); reset(); }} className="p-1.5 rounded-lg hover:bg-muted transition-bloom">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Nombre del curso</label>
                <input {...register("name", { required: true })} placeholder="Ej: React Avanzado" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Descripción</label>
                <textarea {...register("description")} placeholder="Detalles del curso..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom resize-none h-20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Categoría</label>
                  <select {...register("category")} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom">
                    <option value="">Seleccionar</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Estado</label>
                  <select {...register("status")} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom">
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">Link del curso (opcional)</label>
                <input {...register("courseLink")} type="url" placeholder="https://ejemplo.com/curso" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COURSE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setValue("color", color)}
                        className={cn("w-8 h-8 rounded-lg transition-bloom", watchColor === color ? "ring-2 ring-offset-2 ring-foreground" : "hover:scale-110")}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Emoji</label>
                  <select {...register("emoji")} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom">
                    {COURSE_EMOJIS.map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Progreso: {watch("progress")}%</label>
                <input {...register("progress", { valueAsNumber: true })} type="range" min="0" max="100" className="w-full" />
              </div>

              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold transition-bloom hover:shadow-bloom active:scale-95 disabled:opacity-50">
                {editId ? "Actualizar" : "Crear"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse-soft text-muted-foreground">Cargando cursos...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 animate-slide-in-up">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium mb-4">No hay cursos</p>
          <button onClick={openCreate} className="px-4 py-2.5 rounded-2xl bg-primary text-white font-semibold text-sm transition-bloom hover:shadow-bloom">
            Agregar curso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((course) => {
            const StatusIcon = STATUS_CONFIG[course.status].icon;
            return (
              <div
                key={course.id}
                className="group relative rounded-2xl bg-white border border-border p-5 shadow-sm hover:shadow-bloom transition-bloom overflow-hidden"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: course.color || "#c4b5fd",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{course.emoji || "🌸"}</span>
                      <h3 className="font-bold text-foreground text-sm line-clamp-2">{course.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{course.category || "Sin categoría"}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-bloom">
                    <button onClick={() => openEdit(course)} className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-bloom">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate({ id: course.id })} className="p-1.5 rounded-lg bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-bloom">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {course.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{course.progress}%</span>
                    <span className="text-xs text-muted-foreground">{course.totalHours}h</span>
                  </div>
                  <Progress value={course.progress} className="h-2 rounded-full progress-bloom" />
                </div>

                {/* Status & Link */}
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold", STATUS_CONFIG[course.status].color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {STATUS_CONFIG[course.status].label}
                  </div>
                  {course.courseLink && (
                    <a
                      href={course.courseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-bloom"
                      title="Abrir enlace del curso"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
