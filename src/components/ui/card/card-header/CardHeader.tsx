import React from 'react'

import { cn } from '@/utils/commons'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
)

CardHeader.displayName = 'CardHeader'

export default CardHeader
