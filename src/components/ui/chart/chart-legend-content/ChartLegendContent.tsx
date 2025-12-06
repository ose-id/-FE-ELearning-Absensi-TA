import * as React from 'react'

import type * as RechartsPrimitive from 'recharts'

import { useChart } from '@/hooks/useChart'
import { cn } from '@/utils/commons'
import { getPayloadConfigFromPayload } from '../Chart.helpers'

type ChartLegendContentProps = React.ComponentProps<'div'> & {
  payload?: RechartsPrimitive.LegendPayload[]
  verticalAlign?: 'top' | 'bottom' | 'middle'
  hideIcon?: boolean
  nameKey?: string
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}
    >
      {payload.map(item => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn('flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground')}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className='h-2 w-2 shrink-0 rounded-[2px]'
                style={{
                  backgroundColor: item.color
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})

ChartLegendContent.displayName = 'ChartLegend'

export default ChartLegendContent