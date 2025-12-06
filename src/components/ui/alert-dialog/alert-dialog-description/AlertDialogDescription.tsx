'use client'

import * as React from 'react'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '@/utils/commons'

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))

AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

export default AlertDialogDescription
