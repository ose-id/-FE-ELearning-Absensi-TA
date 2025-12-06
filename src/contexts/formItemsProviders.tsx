'use client'

import * as React from 'react'

import { cn } from '@/utils/commons'

type FormItemContextValue = {
  id: string
}

export const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormItemProviders = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)

export default FormItemProviders
