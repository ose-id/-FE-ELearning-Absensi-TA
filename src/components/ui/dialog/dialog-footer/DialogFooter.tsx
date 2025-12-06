import { cn } from '@/utils/commons'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)

DialogFooter.displayName = 'DialogFooter'

export default DialogFooter
