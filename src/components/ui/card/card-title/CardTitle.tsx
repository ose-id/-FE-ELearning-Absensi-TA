import React from 'react'

import { cn } from '@/utils/commons'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('leading-none tracking-tight', className)} {...props} />
  )
)

CardTitle.displayName = 'CardTitle'

export default CardTitle
