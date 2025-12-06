import * as React from 'react'

import { cn } from '@/utils/commons'

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-14 px-4 text-left align-middle font-medium text-primary [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
)

TableHead.displayName = 'TableHead'

export default TableHead
