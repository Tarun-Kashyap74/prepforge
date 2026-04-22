"use client"
import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Clock3 } from 'lucide-react';
import { parseStoredInterviewPayload } from '@/utils/interviewHelpers';

function StartInterview({params}) {

    const [interviewData,setInterviewData]=useState(null);
    const [payload, setPayload] = useState(null);
    const [mockInterviewQuestion,setMockInterviewQuestion]=useState([]);
    const [activeQuestionIndex,setActiveQuestionIndex]=useState(0);
    const [answeredQuestionIndexes,setAnsweredQuestionIndexes]=useState([]);
    const [isRecordingAnswer,setIsRecordingAnswer]=useState(false);
    const [isSavingAnswer,setIsSavingAnswer]=useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const autoAdvancedRef = useRef(false);

    useEffect(()=>{
        GetInterviewDetails();
    },[]);

    useEffect(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }, [activeQuestionIndex]);

    const GetInterviewDetails=async()=>{
      const result = await db.
        select().
        from(MockInterview).where(eq(MockInterview.mockId, params.interviewId))

        const interview = result[0];
        if (!interview) {
          setPayload(parseStoredInterviewPayload(null));
          setMockInterviewQuestion([]);
          setInterviewData(null);
          setAnsweredQuestionIndexes([]);
          return;
        }
        const normalizedPayload = parseStoredInterviewPayload(interview?.jsonMockResp);

        setPayload(normalizedPayload);
        setMockInterviewQuestion(normalizedPayload.interviewQuestions);
        setInterviewData(interview);
        await GetAnsweredQuestions(interview, normalizedPayload.interviewQuestions);
    } 

    const GetAnsweredQuestions = async (mockInterview, questions) => {
      if (!mockInterview?.mockId || !Array.isArray(questions) || !questions.length) {
        setAnsweredQuestionIndexes([]);
        return;
      }

      const answerList = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, mockInterview.mockId));

      const getQuestionKey = (value) =>
        String(value || '').trim().slice(0, 240).toLowerCase();

      const answeredIndexes = answerList
        .map((item) => {
          const storedKey = getQuestionKey(item.question);
          return questions.findIndex((question) => getQuestionKey(question.question) === storedKey);
        })
        .filter((index) => index >= 0);

      setAnsweredQuestionIndexes(answeredIndexes);
    };

    const handleAnswerSaved = (questionIndex) => {
      setAnsweredQuestionIndexes((prev) => {
        if (prev.includes(questionIndex)) {
          return prev;
        }

        return [...prev, questionIndex].sort((a, b) => a - b);
      });
    };

    const RestartInterview = async () => {
      if (!interviewData?.mockId) return;

      try {
        setIsSavingAnswer(true);
        await db.delete(UserAnswer).where(eq(UserAnswer.mockIdRef, interviewData.mockId));
        setAnsweredQuestionIndexes([]);
        setActiveQuestionIndex(0);
        toast.success('Interview restarted. You can record your answers again.');
      } catch (error) {
        console.error('Failed to restart interview:', error);
        toast.error('Unable to restart the interview right now.');
      } finally {
        setIsSavingAnswer(false);
      }
    };

    const interviewMeta = payload?.interviewMeta;
    const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex];
    const timedModeEnabled = Boolean(interviewMeta?.timedModeEnabled);
    const secondsPerQuestion = Number(interviewMeta?.timePerQuestionSeconds) > 0
      ? Number(interviewMeta?.timePerQuestionSeconds)
      : 0;

    useEffect(() => {
      if (!timedModeEnabled || !secondsPerQuestion) {
        setTimeLeft(0);
        autoAdvancedRef.current = false;
        return;
      }

      setTimeLeft(secondsPerQuestion);
      autoAdvancedRef.current = false;
    }, [activeQuestionIndex, timedModeEnabled, secondsPerQuestion]);

    useEffect(() => {
      if (!timedModeEnabled || !secondsPerQuestion) return;
      if (isRecordingAnswer || isSavingAnswer) return;
      if (timeLeft <= 0) return;

      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }, [timedModeEnabled, secondsPerQuestion, timeLeft, isRecordingAnswer, isSavingAnswer]);

    useEffect(() => {
      if (!timedModeEnabled || !secondsPerQuestion) return;
      if (timeLeft > 0 || autoAdvancedRef.current) return;
      if (isRecordingAnswer || isSavingAnswer) return;

      autoAdvancedRef.current = true;

      if (activeQuestionIndex < mockInterviewQuestion.length - 1) {
        toast.info('Time up for this question. Moving to next question.');
        setActiveQuestionIndex((prev) => prev + 1);
      } else {
        toast.info('Time is up. Review your interview and continue to feedback when ready.');
      }
    }, [timeLeft, timedModeEnabled, secondsPerQuestion, isRecordingAnswer, isSavingAnswer, activeQuestionIndex, mockInterviewQuestion.length]);

    const isBusy = isRecordingAnswer || isSavingAnswer;
    const isCurrentQuestionAnswered = answeredQuestionIndexes.includes(activeQuestionIndex);

    const timerProgress = useMemo(() => {
      if (!timedModeEnabled || !secondsPerQuestion) return 0;
      return Math.round((timeLeft / secondsPerQuestion) * 100);
    }, [timedModeEnabled, secondsPerQuestion, timeLeft]);

  return (
    <div className='space-y-6 py-3 sm:py-4'>
        <div className='space-y-3'>
          <p className='eyebrow'>Live Practice</p>
          <h2 className='text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl'>Answer with focus, then review with clarity</h2>
          <p className='subtitle'>Stay on the current question while recording, then move ahead when your answer is saved.</p>
        </div>

        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <div className='metric-tile p-4'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Mode</p>
            <p className='mt-2 text-xl font-semibold text-slate-900'>{interviewMeta?.mode || 'technical'}</p>
          </div>
          <div className='metric-tile p-4'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Difficulty</p>
            <p className='mt-2 text-xl font-semibold text-slate-900'>{interviewMeta?.difficulty || 'mid'}</p>
          </div>
          <div className='metric-tile p-4'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Question</p>
            <p className='mt-2 text-xl font-semibold text-slate-900'>{activeQuestionIndex + 1} / {mockInterviewQuestion.length || 0}</p>
          </div>
          <div className='metric-tile p-4'>
            <p className='flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-500'><Clock3 className='h-3.5 w-3.5' /> Timer</p>
            <p className='mt-2 text-xl font-semibold text-slate-900'>
              {timedModeEnabled && secondsPerQuestion ? `${timeLeft}s` : 'Off'}
            </p>
          </div>
        </div>

        {timedModeEnabled && secondsPerQuestion > 0 && (
          <div className='rounded-2xl border border-indigo-200 bg-indigo-50 p-4'>
            <div className='flex flex-wrap items-center justify-between gap-2 text-sm text-indigo-700'>
              <p className='font-semibold'>Timed mode is active</p>
              <p>{timeLeft}s left</p>
            </div>
            <div className='mt-3 h-2 w-full rounded-full bg-indigo-100'>
              <div
                className='h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all'
                style={{ width: `${Math.max(0, timerProgress)}%` }}
              />
            </div>
            {(isRecordingAnswer || isSavingAnswer) && (
              <p className='mt-2 text-xs text-indigo-600'>Timer is paused while recording or saving.</p>
            )}
          </div>
        )}

        <div className='surface-panel rounded-2xl p-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700'>
              Question {activeQuestionIndex + 1} of {mockInterviewQuestion.length || 0}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                variant="outline"
                className='quiet-button'
                disabled={isBusy || !interviewData?.mockId}
                onClick={RestartInterview}
              >
                Restart
              </Button>
              {interviewData?.mockId ? (
                <Link href={'/dashboard/interview/'+interviewData.mockId+'/feedback'}>
                  <Button className='rounded-2xl bg-slate-900 text-white hover:bg-slate-800' disabled={isBusy}>
                    End Interview
                  </Button>
                </Link>
              ) : (
                <Button className='rounded-2xl bg-slate-900 text-white hover:bg-slate-800' disabled>
                  End Interview
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 items-start gap-6 xl:grid-cols-[0.92fr_1.08fr]'>
            <div>
            <QuestionsSection 
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            currentQuestion={currentQuestion}
            onQuestionSelect={setActiveQuestionIndex}
            />
            </div>

            <div>
            <RecordAnswerSection
             mockInterviewQuestion={mockInterviewQuestion}
             activeQuestionIndex={activeQuestionIndex}
             interviewData={interviewData}
             isQuestionAnswered={isCurrentQuestionAnswered}
             onAnswerSaved={handleAnswerSaved}
             onRecordingChange={setIsRecordingAnswer}
             onSavingChange={setIsSavingAnswer}
            />
            </div>
        </div>
    </div>
  )
}

export default StartInterview
