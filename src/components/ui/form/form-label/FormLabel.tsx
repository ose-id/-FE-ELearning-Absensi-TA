'use client'

import * as React from 'react'

import type * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/utils/commons'
import Label from '../../label'
import { useFormField } from '@/hooks/useFormField'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />
})

FormLabel.displayName = 'FormLabel'

export default FormLabel
