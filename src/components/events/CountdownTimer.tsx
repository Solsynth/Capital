import { Noto_Serif_TC } from 'next/font/google'
import { useState, useEffect } from 'react'

export interface TimeDiff {
  days: number
  hours: number
  minutes: number
  seconds: number
  isCountdown: boolean
}

const serifFont = Noto_Serif_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export function CountdownTimer({ targetDate, onUpdate }: { targetDate: Date; onUpdate: (diff: TimeDiff) => void }) {
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCountdown: true,
  })

  useEffect(() => {
    const updateTimeDiff = () => {
      const now = new Date()
      const diff = targetDate.getTime() - now.getTime()

      const absDiff = Math.abs(diff)
      const isCountdown = diff > 0

      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((absDiff / (1000 * 60)) % 60)
      const seconds = Math.floor((absDiff / 1000) % 60)

      setTimeDiff({ days, hours, minutes, seconds, isCountdown })
      onUpdate({ days, hours, minutes, seconds, isCountdown })
    }

    const intervalId = setInterval(updateTimeDiff, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex gap-5">
      <div>
        <span className="countdown font-mono text-4xl">
          <span style={{ '--value': timeDiff.days } as any}></span>
        </span>
        <span className={serifFont.className}>天</span>
      </div>
      <div>
        <span className="countdown font-mono text-4xl">
          <span style={{ '--value': timeDiff.hours } as any}></span>
        </span>
        <span className={serifFont.className}>小时</span>
      </div>
      <div>
        <span className="countdown font-mono text-4xl">
          <span style={{ '--value': timeDiff.minutes } as any}></span>
        </span>
        <span className={serifFont.className}>分钟</span>
      </div>
      <div>
        <span className="countdown font-mono text-4xl">
          <span style={{ '--value': timeDiff.seconds } as any}></span>
        </span>
        <span className={serifFont.className}>秒</span>
      </div>
    </div>
  )
}
