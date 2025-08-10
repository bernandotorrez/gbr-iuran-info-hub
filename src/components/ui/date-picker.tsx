"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  selected?: Date
  onSelect?: (date?: Date) => void
  className?: string
  closeOnSelect?: boolean
  disabledOption?: (date: Date) => boolean
}

export function DatePicker({ 
  selected, 
  onSelect, 
  className, 
  closeOnSelect = true,
  disabledOption
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date?: Date) => {
    if (onSelect) {
      onSelect(date)
    }
    if (closeOnSelect) {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={disabledOption}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
