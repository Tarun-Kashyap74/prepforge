"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'
import { MockInterview, UserAnswer } from '@/utils/schema'
import { and, desc, eq } from 'drizzle-orm'
import { calculateCurrentStreak, parseStoredInterviewPayload } from '@/utils/interviewHelpers'

function PracticeHistory() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalAnswers: 0,
    avgRating: 0,
    streak: 0,
    completionRate: 0,
    recentActivity: [],
  })

  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return
    getPracticeStats()
  }, [user])

  const getPracticeStats = async () => {
    try {
      setLoading(true)
      const userEmail = user?.primaryEmailAddress?.emailAddress

      const [interviews, answers] = await Promise.all([
        db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.createdBy, userEmail))
          .orderBy(desc(MockInterview.id)),
        db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.userEmail, userEmail))
          .orderBy(desc(UserAnswer.id)),
      ])

      const totalSessions = interviews.length
      const totalAnswers = answers.length

      const ratingValues = answers
        .map((item) => Number(item.rating))
        .filter((rating) => Number.isFinite(rating))

      const avgRating = ratingValues.length
        ? ratingValues.reduce((sum, current) => sum + current, 0) / ratingValues.length
        : 0

      const totalQuestionCount = interviews.reduce((sum, interview) => {
        const payload = parseStoredInterviewPayload(interview.jsonMockResp)
        return sum + payload.interviewQuestions.length
      }, 0)

      const completionRate = totalQuestionCount
        ? Math.min(100, Math.round((totalAnswers / totalQuestionCount) * 100))
        : 0

      const streak = calculateCurrentStreak(answers.map((item) => item.createdAt))

      const recentActivity = Array.from({ length: 7 }, (_, index) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - index))

        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear())
        const label = `${day}-${month}-${year}`

        const count = answers.filter((item) => item.createdAt === label).length
        return {
          shortLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
          count,
        }
      })

      setStats({
        totalSessions,
        totalAnswers,
        avgRating,
        streak,
        completionRate,
        recentActivity,
      })
    } catch (error) {
      console.error('Failed to load practice history:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxCount = useMemo(() => {
    const highest = Math.max(...stats.recentActivity.map((item) => item.count), 1)
    return highest || 1
  }, [stats.recentActivity])

  return (
    <section className='glass-card interactive-card p-6 sm:p-8'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='eyebrow'>Practice History</p>
          <h2 className='title-xl'>Track your growth across every session</h2>
          <p className='subtitle'>A quick read on consistency, interview completion, and score trend.</p>
        </div>
        <div className='gradient-badge'>{stats.streak} day streak</div>
      </div>

      <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='metric-tile'>
          <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Sessions</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{loading ? '--' : stats.totalSessions}</p>
        </div>
        <div className='metric-tile'>
          <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Answers</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{loading ? '--' : stats.totalAnswers}</p>
        </div>
        <div className='metric-tile'>
          <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Avg Rating</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>
            {loading ? '--' : stats.avgRating.toFixed(1)}
            {!loading && <span className='text-base text-slate-500'>/5</span>}
          </p>
        </div>
        <div className='metric-tile'>
          <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Completion</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{loading ? '--' : `${stats.completionRate}%`}</p>
        </div>
      </div>

      <div className='mt-6 rounded-[26px] border border-slate-200 bg-slate-50 p-5'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold uppercase tracking-[0.2em] text-slate-500'>Last 7 Days Activity</h3>
          <p className='text-xs text-slate-500'>Answers recorded</p>
        </div>
        <div className='mt-4 grid grid-cols-7 gap-2'>
          {stats.recentActivity.map((item) => (
            <div key={item.shortLabel} className='flex flex-col items-center gap-2'>
              <div className='flex h-24 w-full items-end justify-center rounded-xl bg-white ring-1 ring-slate-200'>
                <div
                  className='w-6 rounded-full bg-gradient-to-t from-indigo-500 via-sky-500 to-cyan-400'
                  style={{
                    height: `${Math.max(8, (item.count / maxCount) * 80)}px`,
                  }}
                />
              </div>
              <p className='text-xs font-medium text-slate-500'>{item.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PracticeHistory
