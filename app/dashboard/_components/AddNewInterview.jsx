"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModal'
import { BriefcaseBusiness, LoaderCircle, Sparkles } from 'lucide-react'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { normalizeInterviewPayload, parseJsonFromUnknownText } from '@/utils/interviewHelpers'
import { eq } from 'drizzle-orm';

const FREE_INTERVIEW_LIMIT = 3;

function AddNewInterview() {
    const [openDailog,setOpenDailog]=useState(false)
    const [jobPosition,setJobPosition]=useState();
    const [jobDesc,setJobDesc]=useState();
    const [jobExperience,setJobExperience]=useState();
    const [interviewMode, setInterviewMode] = useState('technical');
    const [difficulty, setDifficulty] = useState('mid');
    const [targetCompany, setTargetCompany] = useState('');
    const [timedModeEnabled, setTimedModeEnabled] = useState(false);
    const [timePerQuestionSeconds, setTimePerQuestionSeconds] = useState(120);
    const [questionCount, setQuestionCount] = useState(5);
    const [resumeHighlights, setResumeHighlights] = useState('');
    const [targetJobDescription, setTargetJobDescription] = useState('');
    const [interviewCount, setInterviewCount] = useState(0);
    const [loading,setLoading]=useState(false);
    const router=useRouter();
    const {user}=useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const hasReachedFreeLimit = interviewCount >= FREE_INTERVIEW_LIMIT;

    const fetchInterviewCount = async () => {
        if (!userEmail) {
            setInterviewCount(0);
            return;
        }

        const interviews = await db.select({ mockId: MockInterview.mockId })
            .from(MockInterview)
            .where(eq(MockInterview.createdBy, userEmail));
        setInterviewCount(interviews.length);
    };

    React.useEffect(() => {
        fetchInterviewCount();
    }, [userEmail]);

    const extractJsonPayload = (rawText, questionCount) => {
        if (!rawText) {
            throw new Error('Gemini returned an empty response.');
        }

        const parsedResponse = parseJsonFromUnknownText(rawText, null);
        if (!parsedResponse) {
            throw new Error('Gemini response was not valid JSON.');
        }

        const normalizedPayload = normalizeInterviewPayload(parsedResponse, questionCount);
        return JSON.stringify(normalizedPayload);
    };

    const onSubmit=async(e)=>{
        e.preventDefault()
        if (hasReachedFreeLimit) {
            toast.error(`Free plan limit reached. You can create up to ${FREE_INTERVIEW_LIMIT} interviews.`);
            return;
        }

        setLoading(true)

        try{
            const normalizedTargetCompany = targetCompany?.trim() || 'General';

            const inputPrompt =
                "You are an interview coach platform. " +
                "Return strict JSON only. No markdown, no code fences, no explanation text. " +
                "Schema required: " +
                '{"interviewMeta":{"mode":"string","difficulty":"string","targetCompany":"string","timedModeEnabled":true,"timePerQuestionSeconds":120,"questionCount":5,"preparationTips":["string"]},"resumeJobMatch":{"matchScore":78,"strengths":["string"],"gaps":["string"],"summary":"string"},"interviewQuestions":[{"question":"string","answer":"string","type":"string","difficulty":"string","hints":["string"],"followUps":["string"]}],"finalMockReportTemplate":{"focusAreas":["string"],"coachNotes":["string"],"nextSessionPlan":["string"]}}. ' +
                "Generate exactly " + questionCount + " interviewQuestions. " +
                "Interview context: role=" + jobPosition + "; stack=" + jobDesc + "; yearsExperience=" + jobExperience + "; mode=" + interviewMode + "; difficulty=" + difficulty + "; targetCompany=" + normalizedTargetCompany + "; timedModeEnabled=" + String(timedModeEnabled) + "; timePerQuestionSeconds=" + String(timePerQuestionSeconds) + ". " +
                "Resume highlights: " + (resumeHighlights || "Not provided") + ". " +
                "Target job description for JD match: " + (targetJobDescription || "Not provided") + ". " +
                "The followUps field must contain at least 2 realistic follow-up questions for each main question.";

            const retryPrompt =
                "Return valid JSON object only. No markdown. No explanation text. " +
                "Use this exact schema keys: interviewMeta, resumeJobMatch, interviewQuestions, finalMockReportTemplate. " +
                "Generate exactly " + questionCount + " interviewQuestions. " +
                "Each question must include question, answer, type, difficulty, hints (array), followUps (array with at least 2). " +
                "Role: " + jobPosition + ". Stack: " + jobDesc + ". Experience: " + jobExperience + ". Mode: " + interviewMode + ". Difficulty: " + difficulty + ". Company: " + normalizedTargetCompany + ".";

            let mockJsonResp = null;
            let generationError = null;
            const prompts = [inputPrompt, retryPrompt];

            for (const prompt of prompts) {
              try {
                const result = await chatSession.sendMessage(prompt);
                mockJsonResp = extractJsonPayload(result.response.text(), questionCount);
                if (mockJsonResp) break;
              } catch (attemptError) {
                generationError = attemptError;
              }
            }

            if (!mockJsonResp && generationError) {
              throw generationError;
            }

            if(mockJsonResp)
            {
            const resp=await db.insert(MockInterview)
            .values({
                mockId:uuidv4(),
                jsonMockResp:mockJsonResp,
                jobPosition:jobPosition,
                jobDesc:jobDesc,
                jobExperience:jobExperience,
                createdBy:user?.primaryEmailAddress?.emailAddress,
                createdAt:moment().format('DD-MM-yyyy')
            }).returning({mockId:MockInterview.mockId});

            if(resp)
            {
                setOpenDailog(false);
                await fetchInterviewCount();
                router.push('/dashboard/interview/'+resp[0]?.mockId)
            }
        }
        else{
            toast.error("AI did not return interview questions. Please try again.");
        }
        }catch(error){
            console.error("Interview generation failed:", error);
            const errorText = String(error?.message || '').toLowerCase();
            if (errorText.includes('api key')) {
              toast.error("Gemini key is missing or invalid in deployment environment.");
            } else if (errorText.includes('quota') || errorText.includes('rate')) {
              toast.error("Gemini quota/rate limit reached. Please try again shortly.");
            } else {
            toast.error("Failed to generate interview questions. Please try again.");
            }
        }
        setLoading(false);
    }
  return (
    <div>
        <div className='glass-card interactive-card group relative cursor-pointer overflow-hidden border-dashed p-6 sm:p-8'
         onClick={() => {
            if (hasReachedFreeLimit) {
                toast.error(`You have reached the free limit of ${FREE_INTERVIEW_LIMIT} interviews.`);
                return;
            }
            setOpenDailog(true)
         }}
         >
            <div className='hero-orb left-[-18px] top-10 h-24 w-24 bg-indigo-300/30' />
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-300' />
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-[0_16px_34px_rgba(59,130,246,0.28)]'>
                  <Sparkles className='h-6 w-6' />
                </div>
                <h2 className='mt-5 text-2xl font-semibold'>Create New Interview</h2>
                <p className='mt-2 max-w-sm text-sm leading-6 text-slate-600'>
                  Generate role-specific interviews with difficulty, company focus, follow-up questions, timer mode, and JD match insights.
                </p>
                <p className='mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500'>
                  Free plan: {interviewCount}/{FREE_INTERVIEW_LIMIT} interviews used
                </p>
              </div>
              <span className='gradient-badge'>Advanced</span>
            </div>
            <div className='action-button mt-8 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition'>
              <BriefcaseBusiness className='h-4 w-4' />
              Start a mock session
            </div>
        </div>
        <Dialog open={openDailog} onOpenChange={setOpenDailog}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90svh] overflow-hidden rounded-[30px] border-white/80 bg-white/95 p-0 shadow-[0_30px_100px_rgba(59,130,246,0.16)]">
            <DialogHeader>
            <div className='rounded-t-[28px] bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_24%),linear-gradient(135deg,#0f172a,#312e81_48%,#0891b2)] p-5 sm:p-7 text-white'>
              <DialogTitle className="text-2xl text-white sm:text-3xl" >Tell us about the interview you want to practice</DialogTitle>
              <DialogDescription className='mt-3 text-sm leading-6 text-cyan-100'>
                Configure mode, difficulty, timing, and resume/JD context to generate a sharper interview plan.
              </DialogDescription>
            </div>
            </DialogHeader>
                <form onSubmit={onSubmit} className='max-h-[calc(90svh-150px)] space-y-5 overflow-y-auto p-5 sm:p-7'>
                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-slate-700'>Job Role / Position</label>
                        <Input className='h-11 rounded-2xl border-slate-200 bg-slate-50 text-[15px]' placeholder="Ex. Full Stack Developer" required
                        onChange={(event)=>setJobPosition(event.target.value)}
                        />
                    </div>
                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-slate-700'>Job Description / Tech Stack</label>
                        <Textarea className='min-h-24 rounded-2xl border-slate-200 bg-slate-50 text-[15px] leading-7'
                        placeholder="Ex. React, Next.js, Node.js, PostgreSQL, system design, APIs" 
                        required
                        onChange={(event)=>setJobDesc(event.target.value)} />
                    </div>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-sm font-semibold text-slate-700'>Years of Experience</label>
                        <Input className='h-11 rounded-2xl border-slate-200 bg-slate-50 text-[15px]' placeholder="Ex. 5"  type="number" min="0" max="100" 
                        required
                        onChange={(event)=>setJobExperience(event.target.value)}
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-sm font-semibold text-slate-700'>Interview Mode</label>
                        <select
                          className='h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[15px] text-slate-700'
                          value={interviewMode}
                          onChange={(event) => setInterviewMode(event.target.value)}
                        >
                          <option value='technical'>Technical</option>
                          <option value='behavioral'>Behavioral</option>
                          <option value='hr'>HR</option>
                          <option value='system-design'>System Design</option>
                          <option value='rapid-fire'>Rapid Fire</option>
                        </select>
                      </div>
                    </div>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-sm font-semibold text-slate-700'>Difficulty</label>
                        <select
                          className='h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[15px] text-slate-700'
                          value={difficulty}
                          onChange={(event) => setDifficulty(event.target.value)}
                        >
                          <option value='junior'>Junior</option>
                          <option value='mid'>Mid</option>
                          <option value='senior'>Senior</option>
                          <option value='staff'>Staff</option>
                        </select>
                      </div>
                      <div className='space-y-2'>
                        <label className='text-sm font-semibold text-slate-700'>Target Company</label>
                        <Input
                          className='h-11 rounded-2xl border-slate-200 bg-slate-50 text-[15px]'
                          placeholder='Ex. Google, Amazon, startup, General'
                          value={targetCompany}
                          onChange={(event) => setTargetCompany(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-slate-700'>AI Question Limit</label>
                      <select
                        className='h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-[15px] text-slate-700'
                        value={questionCount}
                        onChange={(event) => setQuestionCount(Number(event.target.value))}
                      >
                        {[5,6,7,8,9,10].map((count) => (
                          <option key={count} value={count}>
                            {count} Questions
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                          <p className='text-sm font-semibold text-slate-700'>Timed Interview Mode</p>
                          <p className='text-xs text-slate-500'>Enable per-question countdown to simulate pressure.</p>
                        </div>
                        <label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
                          <input
                            type='checkbox'
                            checked={timedModeEnabled}
                            onChange={(event) => setTimedModeEnabled(event.target.checked)}
                          />
                          Enable timer
                        </label>
                      </div>
                      {timedModeEnabled && (
                        <div className='mt-4'>
                          <label className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Seconds per question</label>
                          <Input
                            className='mt-2 h-11 rounded-2xl border-slate-200 bg-white text-[15px]'
                            type='number'
                            min='30'
                            max='600'
                            value={timePerQuestionSeconds}
                            onChange={(event) => setTimePerQuestionSeconds(Number(event.target.value) || 120)}
                          />
                        </div>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-slate-700'>Resume Highlights (optional)</label>
                      <Textarea
                        className='min-h-20 rounded-2xl border-slate-200 bg-slate-50 text-[15px] leading-7'
                        placeholder='Paste key projects, measurable impact, and strengths for resume-based questioning.'
                        value={resumeHighlights}
                        onChange={(event) => setResumeHighlights(event.target.value)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-slate-700'>Target Job Description (optional)</label>
                      <Textarea
                        className='min-h-24 rounded-2xl border-slate-200 bg-slate-50 text-[15px] leading-7'
                        placeholder='Paste the JD to generate a match score and role-specific gap analysis.'
                        value={targetJobDescription}
                        onChange={(event) => setTargetJobDescription(event.target.value)}
                      />
                    </div>
                    <div className='flex flex-col-reverse gap-3 pb-1 pt-2 sm:flex-row sm:justify-end'>
                        <Button type="button" variant="outline" className='quiet-button' onClick={()=>setOpenDailog(false)}>Cancel</Button>
                        <Button type="submit" className='action-button px-6' disabled={loading || hasReachedFreeLimit} >
                            {loading? 
                            <>
                            <LoaderCircle className='animate-spin' /> Generating interview
                            </>:'Create Interview'    
                        }
                            </Button>
                    </div>
                </form>
        </DialogContent>
        </Dialog>

    </div>
  )
}

export default AddNewInterview
