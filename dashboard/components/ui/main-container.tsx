import React from 'react'
import { Card } from '@/dashboard/components/shadcn-ui/card'

export function MainContainer({children}: { children: React.ReactNode }) {
  return (
    <div
      className={
        'overflow-hidden rounded-none md:rounded-[12px] border border-[#eee] dark:border-[#555]'
      }
    >
      <Card
        className={
          'min-h-[80vh] overflow-hidden rounded-none md:rounded-[12px] border-0 shadow-none py-0 gap-1'
        }
      >
        {children}
      </Card>
    </div>
  )
}
