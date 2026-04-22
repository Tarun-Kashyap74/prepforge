"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Clock3, Lightbulb, Target, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { parseStoredInterviewPayload } from '@/utils/interviewHelpers'

function Interview({params}) {

    const [interviewData,setInterviewData]=useState();
    const [webCamEnabled,setWebCamEnabled]=useState();
    const [payload, setPayload] = useState(null);

    useEffect(()=>{
        GetInterviewDetails();
    },[])

    const GetInterviewDetails=async()=>{
        const result=await db.select().from(MockInterview)
        .where(eq(MockInterview.mockId,params.interviewId))

        const currentInterview = result[0];
        setInterviewData(currentInterview);
        setPayload(parseStoredInterviewPayload(currentInterview?.jsonMockResp));
    }

    const interviewMeta = payload?.interviewMeta;
    const resumeMatch = payload?.resumeJobMatch;

  return (
    <div className='space-y-8 py-3 sm:py-4'>
        <div>
          <p className='eyebrow'>Interview Setup</p>
          <h2 className='title-xl'>Let&apos;s get you ready</h2>
          <p className='subtitle'>Review your role details, enable your camera, and begin when you feel comfortable.</p>
        </div>

        <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
          <div className='metric-tile'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Mode</p>
            <p className='mt-2 text-lg font-semibold text-slate-900'>{interviewMeta?.mode || 'technical'}</p>
          </div>
          <div className='metric-tile'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Difficulty</p>
            <p className='mt-2 text-lg font-semibold text-slate-900'>{interviewMeta?.difficulty || 'mid'}</p>
          </div>
          <div className='metric-tile'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Target Company</p>
            <p className='mt-2 text-lg font-semibold text-slate-900'>{interviewMeta?.targetCompany || 'General'}</p>
          </div>
          <div className='metric-tile'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>JD Match Score</p>
            <p className='mt-2 text-lg font-semibold text-slate-900'>
              {Number.isFinite(resumeMatch?.matchScore) ? `${resumeMatch.matchScore}%` : 'N/A'}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]'>

            <div className='flex min-w-0 flex-col gap-5'>
                <div className='stack-card flex flex-col gap-5'>
                    <h2 className='text-[17px] leading-8 text-slate-800'><strong>Job Role / Position:</strong> {interviewData?.jobPosition} </h2>
                    <h2 className='text-[17px] leading-8 text-slate-800'><strong>Job Description / Tech Stack:</strong> {interviewData?.jobDesc} </h2>
                    <h2 className='text-[17px] leading-8 text-slate-800'><strong>Years of Experience:</strong> {interviewData?.jobExperience} </h2>
                </div>
                <div className='rounded-[28px] border border-cyan-200 bg-cyan-50 p-6 shadow-sm'>
                   <h2 className='flex gap-2 items-center text-cyan-700'> <Lightbulb/><strong>Information</strong></h2>
                    <h2 className='mt-3 text-sm leading-7 text-cyan-900'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                </div>
                {interviewMeta?.timedModeEnabled && (
                  <div className='rounded-[28px] border border-indigo-200 bg-indigo-50 p-6 shadow-sm'>
                    <h2 className='flex items-center gap-2 text-indigo-700'><Clock3 className='h-5 w-5' /><strong>Timed Mode</strong></h2>
                    <p className='mt-2 text-sm leading-7 text-indigo-900'>
                      Timer enabled for this interview: {interviewMeta?.timePerQuestionSeconds || 120} seconds per question.
                    </p>
                  </div>
                )}
                {resumeMatch?.summary && (
                  <div className='rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm'>
                    <h2 className='flex items-center gap-2 text-emerald-700'><Target className='h-5 w-5' /><strong>Resume / JD Match Insight</strong></h2>
                    <p className='mt-2 text-sm leading-7 text-emerald-900'>{resumeMatch.summary}</p>
                  </div>
                )}
            </div>
            <div className='stack-card min-w-0'>
              <h3 className='text-xl font-semibold'>Camera Preview</h3>
              <p className='mt-2 text-sm leading-7 text-slate-500'>Make sure your framing and lighting feel comfortable before you begin.</p>
              <div className='mt-6'>
           {webCamEnabled? <Webcam
           onUserMedia={()=>setWebCamEnabled(true)}
           onUserMediaError={()=>setWebCamEnabled(false)}
           mirrored={true}
           className='w-full rounded-3xl bg-slate-950 object-cover'
            style={{
                height:280,
                width:"100%"
            }}
           />
           :
           <>
            <WebcamIcon className='h-52 w-full rounded-3xl border border-slate-200 bg-secondary p-14 text-slate-400 sm:h-64 sm:p-16' />
            <Button variant="ghost" className="action-button mt-5 w-full py-6 hover:opacity-95" onClick={()=>setWebCamEnabled(true)}>Enable Webcam and Microphone</Button>
            </>
           }
              </div>
            </div>
        </div>
        <div className='flex justify-end items-end'>
            <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
            <Button className='action-button px-6'>Start Interview</Button>
            </Link>
           </div>
    </div>
  )
}

export default Interview
