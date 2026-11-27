import * as React from 'react'
import { cn } from '@/utils/commons'

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export interface RadioGroupItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export const RadioGroup = ({ value, onValueChange, children, className }: RadioGroupProps) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn('grid grid-cols-2 gap-3', className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export const RadioGroupItem = ({ value, children, disabled = false, className }: RadioGroupItemProps) => {
  const context = React.useContext(RadioGroupContext)
  const isSelected = context.value === value

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200',
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'h-4 w-4 rounded-full border-2 transition-all duration-200',
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        )}
      >
        {isSelected && (
          <span className="block h-full w-full rounded-full bg-white scale-50" />
        )}
      </span>
      {children}
    </button>
  )
}
