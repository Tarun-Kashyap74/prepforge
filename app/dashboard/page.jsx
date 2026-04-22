import React from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'
import PracticeHistory from './_components/PracticeHistory'

function Dashboard() {
  return (
    <div className='space-y-8'>
      <section className='glass-card interactive-card relative overflow-hidden p-5 sm:p-8'>
        <div className='hero-orb left-[-30px] top-[-20px] h-28 w-28 bg-indigo-400/25' />
        <div className='hero-orb right-12 top-6 h-20 w-20 bg-cyan-300/30 animate-pulse-glow' />
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='eyebrow'>Interview Workspace</p>
            <h2 className='title-xl'>Build your next mock interview in minutes</h2>
            <p className='subtitle'>
              Start a new interview, practice with your voice, and review what to improve before the real conversation.
            </p>
          </div>
          <div className='grid w-full grid-cols-2 gap-3 sm:w-auto'>
            <div className='metric-tile px-3 text-center sm:px-5'>
              <p className='text-2xl font-semibold text-slate-900'>AI</p>
              <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Generated questions</p>
            </div>
            <div className='metric-tile px-3 text-center sm:px-5'>
              <p className='text-2xl font-semibold text-slate-900'>Voice</p>
              <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Answer practice</p>
            </div>
          </div>
        </div>
      </section>

      <PracticeHistory />

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.48fr)]'>
        <AddNewInterview/>
        <InterviewList/>
      </div>
    </div>
  )
}

export default Dashboard
