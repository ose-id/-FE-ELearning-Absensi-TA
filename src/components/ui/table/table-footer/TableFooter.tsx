import * as React from 'react'

import { cn } from '@/utils/commons'

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('border-t bg-primary/30 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
)

TableFooter.displayName = 'TableFooter'

export default TableFooter
