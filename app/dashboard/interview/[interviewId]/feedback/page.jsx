"use client"
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useMemo, useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { parseFeedbackPayload } from '@/utils/interviewHelpers'

function Feedback({params}) {

    const [feedbackList,setFeedbackList]=useState([]);
    const router=useRouter();
    useEffect(()=>{
        GetFeedback();
    },[])
    const GetFeedback=async()=>{
        const result=await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef,params.interviewId))
        .orderBy(UserAnswer.id);
        setFeedbackList(result);
    }

    const parsedFeedbackList = useMemo(
      () => feedbackList.map((item) => ({ ...item, parsed: parseFeedbackPayload(item.feedback, item.rating) })),
      [feedbackList]
    );

    const finalReport = useMemo(() => {
      if (!parsedFeedbackList.length) return null;

      const ratings = parsedFeedbackList
        .map((item) => Number(item.parsed?.rating))
        .filter((rating) => Number.isFinite(rating));

      const avgRating = ratings.length
        ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
        : 0;

      const strengths = [];
      const improvements = [];

      parsedFeedbackList.forEach((item) => {
        if ((item.parsed?.rating || 0) >= 4) {
          strengths.push(item.question);
        }
        if ((item.parsed?.rating || 0) < 3.5) {
          improvements.push(item.question);
        }
      });

      return {
        avgRating,
        strengths: strengths.slice(0, 3),
        improvements: improvements.slice(0, 3),
      };
    }, [parsedFeedbackList]);

  return (
    <div className='space-y-6 py-3 sm:py-4'>
        
        {parsedFeedbackList?.length==0?
        <div className='stack-card'>
          <h2 className='font-bold text-xl text-gray-500'>No Interview Feedback Record Found</h2>
        </div>  
          :
        <>
       <div className='stack-card'>
        <p className='eyebrow'>Feedback Summary</p>
        <h2 className='title-xl text-green-600'>Interview complete</h2>
        <h2 className='mt-2 text-2xl font-semibold'>Here is your interview feedback</h2>
        <h2 className='mt-3 text-sm leading-7 text-gray-500'>Find your recorded answer, the recommended answer, and clear feedback with rating.</h2>
       </div>

       {finalReport && (
        <div className='stack-card'>
          <h3 className='text-xl font-semibold text-slate-900'>Final Mock Report</h3>
          <p className='mt-2 text-sm leading-7 text-slate-600'>Average rating: <strong>{finalReport.avgRating.toFixed(2)}/5</strong></p>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700'>Top Strength Areas</p>
              <ul className='mt-2 space-y-2 text-sm leading-7 text-emerald-900'>
                {(finalReport.strengths.length ? finalReport.strengths : ['Keep building consistency across all question types.']).map((item, index) => (
                  <li key={`${item}-${index}`}>{index + 1}. {item}</li>
                ))}
              </ul>
            </div>
            <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-amber-700'>Improvement Focus</p>
              <ul className='mt-2 space-y-2 text-sm leading-7 text-amber-900'>
                {(finalReport.improvements.length ? finalReport.improvements : ['Push answers to include clearer examples and measurable impact.']).map((item, index) => (
                  <li key={`${item}-${index}`}>{index + 1}. {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
       )}

        {parsedFeedbackList.map((item,index)=>(
            <Collapsible key={index} className='mt-7'>
            <CollapsibleTrigger className='stack-card flex w-full justify-between gap-7 rounded-[28px] p-5 text-left text-[15px] font-medium text-slate-800'>
            {item.question} <ChevronsUpDown className='h-5 w-5'/>
            </CollapsibleTrigger>
            <CollapsibleContent>
               <div className='mt-3 flex flex-col gap-3'>
                <h2 className='rounded-2xl border border-violet-200 bg-violet-50 p-3 text-violet-700'><strong>Rating: </strong>{Number(item.parsed.rating || 0).toFixed(1)}/5</h2>
                <h2 className='rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-7 text-red-900'><strong>Your Recorded Answer: </strong>{item.userAns}</h2>
                <h2 className='rounded-2xl border border-green-100 bg-green-50 p-4 text-sm leading-7 text-green-900'><strong>Best Answer To Say: </strong>{item.parsed.idealAnswer || item.correctAns}</h2>
                <h2 className='rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-primary'><strong>Feedback: </strong>{item.parsed.summary}</h2>

                {item.parsed.breakdown && (
                  <div className='rounded-2xl border border-slate-200 bg-white p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Detailed Breakdown</p>
                    <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                      {Object.entries(item.parsed.breakdown).map(([label, value]) => (
                        <p key={label} className='rounded-xl bg-slate-50 p-3 text-sm text-slate-700'>
                          <strong className='capitalize'>{label}:</strong> {Number(value).toFixed(1)}/5
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {item.parsed.star && (
                  <div className='rounded-2xl border border-cyan-200 bg-cyan-50 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>STAR Coaching</p>
                    <p className='mt-2 text-sm leading-7 text-cyan-900'><strong>Situation:</strong> {item.parsed.star.situation || 'N/A'}</p>
                    <p className='text-sm leading-7 text-cyan-900'><strong>Task:</strong> {item.parsed.star.task || 'N/A'}</p>
                    <p className='text-sm leading-7 text-cyan-900'><strong>Action:</strong> {item.parsed.star.action || 'N/A'}</p>
                    <p className='text-sm leading-7 text-cyan-900'><strong>Result:</strong> {item.parsed.star.result || 'N/A'}</p>
                    {item.parsed.star.improvedAnswer && (
                      <p className='mt-2 rounded-xl bg-white p-3 text-sm leading-7 text-slate-800'><strong>Improved STAR answer:</strong> {item.parsed.star.improvedAnswer}</p>
                    )}
                  </div>
                )}

                {Array.isArray(item.parsed.nextSteps) && item.parsed.nextSteps.length > 0 && (
                  <div className='rounded-2xl border border-indigo-200 bg-indigo-50 p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700'>Coach Next Steps</p>
                    <ul className='mt-2 space-y-2 text-sm leading-7 text-indigo-900'>
                      {item.parsed.nextSteps.map((step, stepIndex) => (
                        <li key={`${step}-${stepIndex}`}>{stepIndex + 1}. {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
               </div>
            </CollapsibleContent>
            </Collapsible>
        ))}
        </>}
        
        <div className='pt-2'>
          <Button className='action-button' onClick={()=>router.replace('/dashboard')}>Go Home</Button>
        </div>
    </div>
  )
}

export default Feedback
