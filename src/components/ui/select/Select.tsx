
import * as React from 'react'
import { ChevronDown } from 'lucide-react'

// Context to manage state across components
const SelectContext = React.createContext<{
  value: any
  onValueChange: (value: any) => void
  open: boolean
  setOpen: (open: boolean) => void
  labelMap: Record<string, any>
  registerOption: (value: string, label: any) => void
} | null>(null)

export const Select = ({ value, onValueChange, children }: any) => {
  const [open, setOpen] = React.useState(false)
  const [labelMap, setLabelMap] = React.useState<Record<string, any>>({})

  const registerOption = React.useCallback((val: string, label: any) => {
    setLabelMap(prev => ({ ...prev, [val]: label }))
  }, [])

  const contextValue = React.useMemo(() => ({
    value, onValueChange, open, setOpen, labelMap, registerOption
  }), [value, onValueChange, open, labelMap, registerOption])

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ children, className = '', ...props }: any) => {
  const context = React.useContext(SelectContext)
  if (!context) return null // Should be used within Select
  const { open, setOpen } = context

  // Filter out non-dom props just in case
  const { onValueChange, value, asChild, ...domProps } = props

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...domProps}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export const SelectContent = ({ children }: any) => {
  const context = React.useContext(SelectContext)
  if (!context || !context.open) return null

  return (
    <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full rounded-md border border-gray-200 bg-white text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95">
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

export const SelectItem = ({ value, children, className = '' }: any) => {
  const context = React.useContext(SelectContext)

  // Register label for display
  // Register label for display
  React.useEffect(() => {
    if (context?.registerOption) {
      context.registerOption(value?.toString(), children)
    }
  }, [value, children, context?.registerOption])

  if (!context) return null
  const { setOpen, onValueChange, value: selectedValue } = context

  const isSelected = selectedValue?.toString() === value?.toString()

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onValueChange(value)
        setOpen(false)
      }}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 ${isSelected ? 'bg-gray-100 font-medium' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export const SelectValue = ({ placeholder }: any) => {
  const context = React.useContext(SelectContext)
  const displayValue = context?.value ? (context.labelMap[context.value?.toString()] || context.value) : placeholder

  return (
    <span className="block truncate">
      {displayValue}
    </span>
  )
}
