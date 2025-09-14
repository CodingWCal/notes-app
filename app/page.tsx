"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/NoteCard";
import { NoteComposer } from "@/components/NoteComposer";
import { NoteEditorDialog } from "@/components/NoteEditorDialog";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type Note,
} from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Always put pinned first, then newest created_at
const sortByPinnedCreated = (a: Note, b: Note) => {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
};

// If composer ever sends hex colors, normalize to our named palette
const hexToName = (hex?: string): Note["color"] => {
  const map: Record<string, Note["color"]> = {
    "#ffffff": "default",
    "#fefce8": "yellow",
    "#f0fdf4": "green",
    "#eff6ff": "blue",
    "#fdf2f8": "pink",
    "#faf5ff": "purple",
  };
  if (!hex) return "default";
  const k = hex.toLowerCase();
  return map[k] ?? "default";
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  // Load notes on mount
  useEffect(() => {
    (async () => {
      try {
        const fetched = await getNotes();
        setNotes(fetched.sort(sortByPinnedCreated));
      } catch {
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  // Filter + ensure sorted every render
  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) => (n.title ?? "").toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort(sortByPinnedCreated);
  }, [notes, searchQuery]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.pinned),
    [filteredNotes]
  );
  const otherNotes = useMemo(
    () => filteredNotes.filter((n) => !n.pinned),
    [filteredNotes]
  );

  // Create
  async function handleNoteCreate(input: any) {
    const temp: Note = {
      id: "temp-" + crypto.randomUUID(),
      title: input?.title ?? null,
      content: input?.content ?? "",
      color:
        typeof input?.color === "string"
          ? (["default","yellow","green","blue","pink","purple"].includes(input.color)
              ? (input.color as Note["color"])
              : hexToName(input.color))
          : "default",
      pinned: typeof input?.pinned === "boolean" ? input.pinned : Boolean(input?.is_pinned),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((curr) => [temp, ...curr].sort(sortByPinnedCreated));
    setShowComposer(false);

    try {
      const real = await createNote({
        title: temp.title,
        content: temp.content,
        color: temp.color,
        pinned: temp.pinned,
      });
      setNotes((curr) =>
        [real, ...curr.filter((n) => n.id !== temp.id)].sort(sortByPinnedCreated)
      );
      toast({ title: "Note created" });
    } catch {
      setNotes((curr) => curr.filter((n) => n.id !== temp.id).sort(sortByPinnedCreated));
      toast({ title: "Error", description: "Create failed", variant: "destructive" });
    }
  }

  // Update
  async function handleNoteUpdate(updated: any) {
    const id: string = updated?.id;
    if (!id) return;

    const fields: Partial<Note> = {};
    if ("title" in updated) fields.title = updated.title ?? null;
    if ("content" in updated) fields.content = updated.content ?? undefined;
    if ("pinned" in updated) fields.pinned = Boolean(updated.pinned);
    if ("is_pinned" in updated) fields.pinned = Boolean(updated.is_pinned);
    if ("color" in updated) {
      const c = updated.color;
      fields.color =
        typeof c === "string"
          ? (["default","yellow","green","blue","pink","purple"].includes(c)
              ? (c as Note["color"])
              : hexToName(c))
          : "default";
    }

    const prev = notes;
    setNotes((curr) => {
      const next = curr.map((n) => (n.id === id ? ({ ...n, ...fields } as Note) : n));
      return next.sort(sortByPinnedCreated);
    });

    try {
      const real = await updateNote(id, fields);
      setNotes((curr) => {
        const next = curr.map((n) => (n.id === id ? real : n));
        return next.sort(sortByPinnedCreated);
      });
      toast({ title: "Saved" });
    } catch {
      setNotes(prev);
      toast({ title: "Error", description: "Save failed", variant: "destructive" });
    }
  }

  // Delete
  async function handleNoteDelete(noteId: string) {
    const prev = notes;
    setNotes((curr) => curr.filter((n) => n.id !== noteId).sort(sortByPinnedCreated));
    try {
      await deleteNote(noteId);
      toast({ title: "Deleted" });
    } catch {
      setNotes(prev);
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Notes</h1>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search notes... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* New Note */}
            <Button onClick={() => setShowComposer(!showComposer)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-6">
        {/* Composer */}
        {showComposer && (
          <div className="mb-6">
            <NoteComposer onSave={handleNoteCreate} onCancel={() => setShowComposer(false)} />
          </div>
        )}

        {/* Grids */}
        {filteredNotes.length > 0 ? (
          <div className="space-y-8">
            {pinnedNotes.length > 0 && (
              <section>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Pinned</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={setEditingNote}
                      onUpdate={handleNoteUpdate}
                      onDelete={handleNoteDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              {pinnedNotes.length > 0 && (
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Others</h4>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={setEditingNote}
                    onUpdate={handleNoteUpdate}
                    onDelete={handleNoteDelete}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Create your first note to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowComposer(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Note
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Editor Dialog */}
      <NoteEditorDialog
        note={editingNote}
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        onSave={handleNoteUpdate}
        onDelete={handleNoteDelete}
      />
    </div>
  );
}