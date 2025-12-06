import * as React from 'react'

import Link from 'next/link'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/utils/commons'

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : Link

  return <Comp ref={ref} className={cn('transition-colors hover:text-foreground', className)} {...props} />
})

BreadcrumbLink.displayName = 'BreadcrumbLink'

export default BreadcrumbLink
