import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Plus, Pencil, Trash2, X, Search, Code2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "CSS", "HTML", "SQL", "Bash", "JSON", "Otro"];

type FormData = {
  title: string;
  content: string;
  courseId: string;
  isSnippet: boolean;
  language: string;
  tags: string;
};

export default function Notes() {
  const utils = trpc.useUtils();
  const { data: notes, isLoading } = trpc.notes.list.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: () => { utils.notes.list.invalidate(); toast.success("Nota guardada 📝"); setShowForm(false); reset(); },
    onError: () => toast.error("Error al guardar la nota"),
  });
  const updateMutation = trpc.notes.update.useMutation({
    onSuccess: () => { utils.notes.list.invalidate(); toast.success("Nota actualizada ✨"); setEditId(null); setShowForm(false); reset(); },
    onError: () => toast.error("Error al actualizar"),
  });
  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => { utils.notes.list.invalidate(); toast.success("Nota eliminada"); },
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "note" | "snippet">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { title: "", content: "", courseId: "", isSnippet: false, language: "", tags: "" },
  });
  const watchIsSnippet = watch("isSnippet");

  const openCreate = () => { reset(); setEditId(null); setShowForm(true); };
  const openEdit = (note: NonNullable<typeof notes>[0]) => {
    reset({
      title: note.title,
      content: note.content ?? "",
      courseId: note.courseId?.toString() ?? "",
      isSnippet: note.isSnippet,
      language: note.language ?? "",
      tags: note.tags ?? "",
    });
    setEditId(note.id);
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      title: data.title,
      content: data.content || undefined,
      courseId: data.courseId ? parseInt(data.courseId) : undefined,
      isSnippet: data.isSnippet,
      language: data.language || undefined,
      tags: data.tags || undefined,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = (notes ?? []).filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.content ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (n.tags ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || (filterType === "snippet" ? n.isSnippet : !n.isSnippet);
    return matchSearch && matchType;
  });

  const getCourse = (courseId: number | null) => courses?.find((c) => c.id === courseId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-slide-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" strokeWidth={1.8} />
            Notas & Snippets
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{notes?.length ?? 0} notas guardadas</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nueva nota
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar notas..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
        </div>
        <div className="flex gap-2">
          {(["all", "note", "snippet"] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={cn("px-3 py-2 rounded-xl text-xs font-semibold transition-bloom flex items-center gap-1.5", filterType === t ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted border border-border")}>
              {t === "snippet" && <Code2 className="w-3.5 h-3.5" strokeWidth={2} />}
              {t === "all" ? "Todas" : t === "note" ? "Notas" : "Snippets"}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-foreground mb-2">No hay notas</h3>
          <p className="text-sm text-muted-foreground mb-4">Empieza a capturar tus aprendizajes</p>
          <button onClick={openCreate} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-bloom transition-bloom hover:bg-primary/90">
            Crear nota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((note) => {
            const course = getCourse(note.courseId);
            const isExpanded = expandedId === note.id;
            return (
              <div key={note.id} className={cn("bg-white rounded-2xl p-5 shadow-bloom transition-bloom hover:shadow-bloom-lg group", note.isSnippet && "border-l-4 border-primary/40")}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {note.isSnippet ? (
                      <Code2 className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.8} />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={1.8} />
                    )}
                    <h3 className="font-bold text-sm text-foreground truncate">{note.title}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-bloom flex-shrink-0">
                    <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg hover:bg-muted transition-bloom">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
                    </button>
                    <button onClick={() => { if (confirm("¿Eliminar esta nota?")) deleteMutation.mutate({ id: note.id }); }} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-bloom">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {note.content && (
                  <div className="mb-3">
                    {note.isSnippet ? (
                      <pre className={cn("code-snippet p-3 text-xs overflow-x-auto", !isExpanded && "max-h-24 overflow-hidden")}>
                        <code>{note.content}</code>
                      </pre>
                    ) : (
                      <p className={cn("text-xs text-muted-foreground leading-relaxed", !isExpanded && "line-clamp-3")}>
                        {note.content}
                      </p>
                    )}
                    {note.content.length > 150 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : note.id)} className="text-xs text-primary font-semibold mt-1 hover:underline">
                        {isExpanded ? "Ver menos" : "Ver más"}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {course && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-lavender-light text-primary font-semibold">
                        {course.emoji} {course.name}
                      </span>
                    )}
                    {note.isSnippet && note.language && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-muted text-muted-foreground font-mono font-semibold">
                        {note.language}
                      </span>
                    )}
                    {note.tags && note.tags.split(",").slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-lg bg-beige text-amber-700 font-semibold flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(note.updatedAt), "d MMM", { locale: es })}
                  </span>
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
          <div className="relative bg-white rounded-3xl p-6 shadow-bloom-lg w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-foreground">{editId ? "Editar nota" : "Nueva nota"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-muted transition-bloom">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2">
                <button type="button" onClick={() => setValue("isSnippet", false)} className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-bloom flex items-center justify-center gap-2", !watchIsSnippet ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  <FileText className="w-4 h-4" strokeWidth={1.8} /> Nota
                </button>
                <button type="button" onClick={() => setValue("isSnippet", true)} className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-bloom flex items-center justify-center gap-2", watchIsSnippet ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  <Code2 className="w-4 h-4" strokeWidth={1.8} /> Snippet
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Título *</label>
                <input {...register("title", { required: true })} placeholder={watchIsSnippet ? "Ej: Función debounce" : "Título de la nota"} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
                {errors.title && <p className="text-xs text-destructive mt-1">El título es requerido</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  {watchIsSnippet ? "Código" : "Contenido"}
                </label>
                <textarea
                  {...register("content")}
                  rows={watchIsSnippet ? 8 : 5}
                  placeholder={watchIsSnippet ? "// Tu código aquí..." : "Escribe tu nota..."}
                  className={cn("w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom resize-none", watchIsSnippet && "font-mono text-xs bg-slate-950 text-slate-100 border-slate-700")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Curso</label>
                  <select {...register("courseId")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                    <option value="">Sin curso</option>
                    {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                {watchIsSnippet && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Lenguaje</label>
                    <select {...register("language")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom bg-white">
                      <option value="">Seleccionar</option>
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Etiquetas (separadas por coma)</label>
                <input {...register("tags")} placeholder="react, hooks, estado" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-bloom" />
              </div>

              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-bloom transition-bloom hover:bg-primary/90 disabled:opacity-60">
                {createMutation.isPending || updateMutation.isPending ? "Guardando..." : editId ? "Guardar cambios" : "Crear nota"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
