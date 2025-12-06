import * as React from 'react'

import { cn } from '@/utils/commons'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-xl border bg-card p-4 text-card-foreground shadow', className)} {...props} />
))

Card.displayName = 'Card'

export default Card
