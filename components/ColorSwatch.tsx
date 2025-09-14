"use client"

import { Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ColorSwatchProps {
  selectedColor?: string
  onColorSelect: (color: string) => void
  onClose: () => void
}

type NoteColor = 'default' | 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

const NOTE_COLORS = [
  { name: "Default", value: "#ffffff", colorName: "default" as NoteColor },
  { name: "Yellow", value: "#fefce8", colorName: "yellow" as NoteColor },
  { name: "Green", value: "#f0fdf4", colorName: "green" as NoteColor },
  { name: "Blue", value: "#eff6ff", colorName: "blue" as NoteColor },
  { name: "Pink", value: "#fdf2f8", colorName: "pink" as NoteColor },
  { name: "Purple", value: "#faf5ff", colorName: "purple" as NoteColor },
]

const hexToName = (hex: string): NoteColor => {
  const map: Record<string, NoteColor> = {
    "#ffffff": "default",
    "#fefce8": "yellow",
    "#f0fdf4": "green",
    "#eff6ff": "blue",
    "#fdf2f8": "pink",
    "#faf5ff": "purple",
  };
  return map[hex?.toLowerCase()] || "default";
};

export function ColorSwatch({ selectedColor = "", onColorSelect, onClose }: ColorSwatchProps) {
  // Convert selectedColor to named color for comparison
  const selectedColorName = selectedColor.startsWith('#') ? hexToName(selectedColor) : selectedColor;
  
  return (
    <Card className="p-3 shadow-lg">
      <div className="grid grid-cols-3 gap-2">
        {NOTE_COLORS.map((color) => (
          <Button
            key={color.name}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border-2 border-border hover:border-primary"
            style={{ backgroundColor: color.value }}
            onClick={() => onColorSelect(color.colorName)}
            title={color.name}
          >
            {selectedColorName === color.colorName && <Check className="h-4 w-4 text-primary" />}
          </Button>
        ))}
      </div>
    </Card>
  )
}
