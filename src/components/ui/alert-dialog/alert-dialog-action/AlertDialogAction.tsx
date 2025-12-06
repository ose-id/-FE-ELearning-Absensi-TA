'use client'

import * as React from 'react'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '@/utils/commons'
import { buttonVariants } from '../../button/Button'

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
))

AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

export default AlertDialogAction
