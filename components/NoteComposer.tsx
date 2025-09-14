"use client";

import { useState } from "react";
import { Save, X, Pin, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ColorSwatch } from "@/components/ColorSwatch";
import type { Note } from "@/lib/supabase"; // types only
import { useToast } from "@/hooks/use-toast";

interface NoteComposerProps {
  // parent (page.tsx) will actually create the note and handle Supabase
  onSave: (input: {
    title: string | null;
    content: string;
    color: Note["color"];
    pinned: boolean;
  }) => void;
  onCancel: () => void;
}

// Map hex (if your ColorSwatch returns hex) -> schema color names
const hexToName: Record<string, Note["color"]> = {
  "#ffffff": "default",
  "#fefce8": "yellow",
  "#f0fdf4": "green",
  "#eff6ff": "blue",
  "#fdf2f8": "pink",
  "#faf5ff": "purple",
};

export function NoteComposer({ onSave, onCancel }: NoteComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // ColorSwatch in your scaffold likely returns a hex string; keep as string here and convert on save
  const [color, setColor] = useState<string>("");
  const [pinned, setPinned] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "Empty note",
        description: "Please add a title or content",
        variant: "destructive",
      });
      return;
      console.log("composer onSave payload", {
        title: title.trim() ? title.trim() : null,
        content: content.trim(),
        color,
        pinned,
      });
      
    }

    // Convert hex -> name (or default)
    const colorName: Note["color"] =
      hexToName[color?.toLowerCase?.() || ""] || "default";

    // Delegate creation to parent (page.tsx) which does optimistic UI + Supabase call
    onSave({
      title: title.trim() ? title.trim() : null,
      content: content.trim(),
      color: colorName,
      pinned: Boolean(pinned),
    });

    // local reset
    setTitle("");
    setContent("");
    setColor("");
    setPinned(false);
    setShowColorPicker(false);
    setIsExpanded(false);
  };

  const handleFocus = () => setIsExpanded(true);

  return (
    <Card
      className="relative transition-all duration-200"
      // keep the inline preview so the card reflects the selected color while composing
      style={{ backgroundColor: color || undefined }}
    >
      <div className="p-4">
        {!isExpanded ? (
          <Textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            className="min-h-[60px] resize-none border-none bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
          />
        ) : (
          <>
            <div className="space-y-3">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none bg-transparent p-0 text-base font-medium placeholder:text-muted-foreground focus-visible:ring-0"
              />

              <Textarea
                placeholder="Take a note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none border-none bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  variant={pinned ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPinned(!pinned)}
                  className="h-8 w-8 p-0"
                  title={pinned ? "Unpin" : "Pin"}
                >
                  <Pin className="h-4 w-4" />
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="h-8 w-8 p-0"
                    title="Color"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>

                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-2 z-10">
                      <ColorSwatch
                        selectedColor={color}
                        onColorSelect={(newColor) => {
                          setColor(newColor);
                          setShowColorPicker(false);
                        }}
                        onClose={() => setShowColorPicker(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
