'use client'

import * as React from 'react'

import type * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/utils/commons'
import Label from '../../label'
import { useFormField } from '@/hooks/useFormField'

export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ className, required, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {required && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </Label>
  )
})

FormLabel.displayName = 'FormLabel'

export default FormLabel
