import * as React from 'react'

import { cn } from '@/utils/commons'

interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'shadow-xs flex h-9 w-full min-w-0 rounded-lg border border-gray-300 bg-transparent px-3 py-1 text-sm text-gray-900 outline-none transition-all duration-200 selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        error && 'border-red-500 ring-red-500',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
