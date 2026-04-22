"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs'
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard';

function InterviewList() {

    const {user}=useUser();
    const [interviewList,setInterviewList]=useState([]);

    useEffect(()=>{
        user&&GetInterviewList();
    },[user])

    const GetInterviewList=async()=>{
        const result=await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy,user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(MockInterview.id));
        setInterviewList(result);
    }

  return (
    <div className='glass-card interactive-card p-6 sm:p-8'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-semibold'>Previous Mock Interviews</h2>
            <p className='mt-2 text-sm leading-7 text-slate-500'>Jump back into an interview and review your feedback history.</p>
          </div>
          <div className='gradient-badge'>
            {interviewList?.length} Sessions
          </div>
        </div>

        <div className='mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 stagger-in'>
            {interviewList?.length>0?interviewList.map((interview,index)=>(
                <InterviewItemCard 
                interview={interview}
                key={index} />
            ))
            :
            [1,2,3,4].map((item,index)=>(
                <div key={index} className='h-[170px] w-full animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800/80'>
                </div>
            ))
        }
        </div>
    </div>
  )
}

export default InterviewList
