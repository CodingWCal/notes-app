"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Pin, PinOff, Palette } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ColorSwatch } from "@/components/ColorSwatch"
import { updateNote, deleteNote, type Note } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const colorBg: Record<Note["color"], string> = {
  default: "bg-white",
  yellow:  "bg-yellow-50",
  green:   "bg-green-50",
  blue:    "bg-blue-50",
  pink:    "bg-pink-50",
  purple:  "bg-purple-50",
};

const hexToName: Record<string, Note["color"]> = {
  "#ffffff": "default",
  "#fefce8": "yellow",
  "#f0fdf4": "green",
  "#eff6ff": "blue",
  "#fdf2f8": "pink",
  "#faf5ff": "purple",
};


interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onUpdate: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NoteCard({ note, onEdit, onUpdate, onDelete }: NoteCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { toast } = useToast()

  const handlePin = async () => {
    try {
      const updatedNote = await updateNote(note.id, { pinned: !note.pinned })
      onUpdate(updatedNote)
      toast({
        title: note.pinned ? "Note unpinned" : "Note pinned",
        description: note.pinned ? "Note removed from top" : "Note moved to top",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  const handleColorChange = async (color: string) => {
    try {
      const nextColor =
        (["default","yellow","green","blue","pink","purple"] as const).includes(color as any)
          ? (color as Note["color"])
          : (hexToName[color?.toLowerCase?.()] ?? "default");
  
      const updatedNote = await updateNote(note.id, { color: nextColor });
      onUpdate(updatedNote);
      setShowColorPicker(false);
      toast({ title: "Color updated", description: "Note color has been changed" });
    } catch {
      toast({ title: "Error", description: "Failed to update note color", variant: "destructive" });
    }
  };
  

  const handleDelete = async () => {
    try {
      await deleteNote(note.id)
      onDelete(note.id)
      toast({
        title: "Note deleted",
        description: "Note has been permanently deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <Card
    className={`group relative cursor-pointer transition-all hover:shadow-md ${colorBg[note.color]}`}
    onClick={() => onEdit(note)}
  >
  
      <div className="p-4">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
        {note.title && <h3 className="font-medium text-card-foreground line-clamp-2 text-balance">{note.title ?? ""}</h3>}

          <div className="flex items-center gap-1">
            {note.pinned && (
              <Badge variant="secondary" className="text-xs">
                <Pin className="h-3 w-3" />
              </Badge>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(note)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePin()
                  }}
                >
                  {note.pinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowColorPicker(!showColorPicker)
                  }}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Color
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        {note.content && (
          <p className="text-sm text-card-foreground/80 whitespace-pre-wrap line-clamp-6 text-pretty">{note.content}</p>
        )}

        {/* Footer with date */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
        </div>

        {/* Color Picker */}
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-2 z-10" onClick={(e) => e.stopPropagation()}>
            <ColorSwatch
              selectedColor={note.color}
              onColorSelect={handleColorChange}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        )}
      </div>
    </Card>
  )
}
