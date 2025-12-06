import React from 'react'

import { cn } from '@/utils/commons'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('mt-2', className)} {...props} />
)

CardContent.displayName = 'CardContent'

export default CardContent
