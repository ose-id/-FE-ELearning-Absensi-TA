'use client'

import * as React from 'react'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '@/utils/commons'

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
))

AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

export default AlertDialogTitle
