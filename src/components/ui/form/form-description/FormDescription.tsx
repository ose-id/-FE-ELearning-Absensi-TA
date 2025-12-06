'use client'

import * as React from 'react'

import { cn } from '@/utils/commons'
import { useFormField } from '@/hooks/useFormField'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />
    )
  }
)

FormDescription.displayName = 'FormDescription'

export default FormDescription
