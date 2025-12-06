import * as React from 'react'

import { cn } from '@/utils/commons'

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('border-b bg-card transition-colors', className)} {...props} />
  )
)

TableRow.displayName = 'TableRow'

export default TableRow
