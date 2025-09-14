"use client"

import { useState, useEffect } from "react"
import { Save, Pin, Palette, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { ColorSwatch } from "@/components/ColorSwatch"
import { updateNote, type Note } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface NoteEditorDialogProps {
  note: Note | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: Note) => void
  onDelete?: (id: string) => void
}

export function NoteEditorDialog({ note, open, onOpenChange, onSave, onDelete }: NoteEditorDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { toast } = useToast()

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setColor(note.color || "")
      setIsPinned(note.pinned)
    } else {
      setTitle("")
      setContent("")
      setColor("")
      setIsPinned(false)
    }
    setShowColorPicker(false)
  }, [note])

  const handleSave = async () => {
    if (!note) return

    if (!title.trim() && !content.trim()) {
      toast({
        title: "Empty note",
        description: "Please add a title or content",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedNote = await updateNote(note.id, {
        title: title.trim(),
        content: content.trim(),
        color,
        pinned: isPinned,
      })
      onSave(updatedNote)
      onOpenChange(false)
      toast({
        title: "Note updated",
        description: "Your changes have been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  if (!note) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden" style={{ backgroundColor: color || undefined }}>
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none bg-transparent p-0 text-lg font-medium placeholder:text-muted-foreground focus-visible:ring-0"
          />

          <Textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-none border-none bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant={isPinned ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsPinned(!isPinned)}
              className="gap-2"
            >
              <Pin className="h-4 w-4" />
              {isPinned ? "Pinned" : "Pin"}
            </Button>

            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowColorPicker(!showColorPicker)} className="gap-2">
                <Palette className="h-4 w-4" />
                Color
              </Button>

              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-10">
                  <ColorSwatch
                    selectedColor={color}
                    onColorSelect={(newColor) => {
                      setColor(newColor)
                      setShowColorPicker(false)
                    }}
                    onClose={() => setShowColorPicker(false)}
                  />
                </div>
              )}
            </div>

            {onDelete && note?.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete note?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      onDelete(note.id)
                      onOpenChange(false)
                    }}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
