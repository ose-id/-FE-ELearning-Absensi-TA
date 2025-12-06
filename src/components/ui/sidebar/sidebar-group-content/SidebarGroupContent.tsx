import * as React from 'react'

import { cn } from '@/utils/commons'

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar='group-content' className={cn('w-full text-sm', className)} {...props} />
  )
)

SidebarGroupContent.displayName = 'SidebarGroupContent'

export default SidebarGroupContent
