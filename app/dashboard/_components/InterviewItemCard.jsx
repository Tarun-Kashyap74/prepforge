"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

function InterviewItemCard({interview}) {

    const router=useRouter();

    const onStart=()=>{
        router.push('/dashboard/interview/'+interview?.mockId)
    }

    const onFeedbackPress=()=>{
        router.push('/dashboard/interview/'+interview.mockId+"/feedback")
    }
    
  return (
    <div className='surface-panel interactive-card rounded-[28px] p-5 sm:p-6'>
        <div>
          <div className='gradient-badge'>
            {interview?.jobExperience} years
          </div>
          <h2 className='mt-4 break-words text-lg font-semibold text-slate-900 sm:text-xl'>{interview?.jobPosition}</h2>
          <h2 className='mt-2 max-h-[84px] overflow-hidden break-words text-sm leading-7 text-slate-600'>{interview?.jobDesc}</h2>
        </div>
        <h2 className='mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-400'>Created on {interview.createdAt}</h2>
        <div className='mt-5 flex justify-between gap-3'>
            <Button size="sm" variant="outline" className="w-full quiet-button"
            onClick={onFeedbackPress}
            >Feedback</Button>
            <Button size="sm" className="w-full action-button"
            onClick={onStart}
            >Start</Button>

        </div>
    </div>
  )
}

export default InterviewItemCard
