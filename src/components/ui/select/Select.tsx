
import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'

// Context to manage state across components
interface SelectContextValue {
  value: any
  onValueChange: (value: any) => void
  open: boolean
  setOpen: (open: boolean) => void
  optionsMap: Map<string, React.ReactNode>
  registerOption: (value: string, label: React.ReactNode) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export const Select = ({ value, onValueChange, children }: any) => {
  const [open, setOpen] = React.useState(false)
  // Use state for options to trigger re-render
  const [optionsMap, setOptionsMap] = React.useState<Map<string, React.ReactNode>>(new Map())
  const selectRef = React.useRef<HTMLDivElement>(null)

  const registerOption = React.useCallback((value: string, label: React.ReactNode) => {
    setOptionsMap(prev => {
      const next = new Map(prev)
      next.set(value, label)
      return next
    })
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const contextValue = {
    value, onValueChange, open, setOpen, optionsMap, registerOption
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ children, className = '', disabled = false, ...props }: any) => {
  const context = React.useContext(SelectContext)
  if (!context) return null
  const { open, setOpen } = context

  const { onValueChange, value, asChild, ...domProps } = props

  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 ${open ? 'ring-2 ring-blue-500 border-blue-500' : ''} ${className}`}
      {...domProps}
    >
      {children}
      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

export const SelectContent = ({ children, className = '' }: any) => {
  const context = React.useContext(SelectContext)
  if (!context || !context.open) return null

  return (
    <div className={`absolute top-[calc(100%+4px)] left-0 z-50 w-full rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 ${className}`}>
      <div className="max-h-60 overflow-auto p-1">
        {children}
      </div>
    </div>
  )
}

export const SelectItem = ({ value, children, className = '', icon }: any) => {
  const context = React.useContext(SelectContext)

  if (!context) return null
  const { setOpen, onValueChange, value: selectedValue, registerOption } = context

  const isSelected = selectedValue?.toString() === value?.toString()

  // Register option when rendered
  React.useEffect(() => {
    registerOption(value?.toString() || '', children)
  }, [value, children, registerOption])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange(value)
    setOpen(false)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
    </div>
  )
}

export const SelectValue = ({ placeholder, children }: any) => {
  const context = React.useContext(SelectContext)

  if (!context) return null

  if (children) {
    return (
      <span className={`block truncate ${!context.value ? 'text-gray-500' : 'text-gray-900'}`}>
        {children}
      </span>
    )
  }

  // Look up the label from the options map
  const label = context.value ? context.optionsMap.get(context.value?.toString()) : null
  const displayValue = context.value ? (label || context.value) : placeholder

  return (
    <span className={`block truncate ${!context.value ? 'text-gray-500' : 'text-gray-900'}`}>
      {displayValue}
    </span>
  )
}