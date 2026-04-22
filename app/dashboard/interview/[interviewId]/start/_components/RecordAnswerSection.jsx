"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Mic, StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModal'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { and, eq } from 'drizzle-orm'
import { safeJsonParse, stripCodeFences } from '@/utils/interviewHelpers'

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  isQuestionAnswered,
  onAnswerSaved,
  onRecordingChange,
  onSavingChange
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [hasMicAccess, setHasMicAccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const isRecordingRef = useRef(false);
  const lastSavedAnswerRef = useRef('');
  const submitTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const { user } = useUser();

  useEffect(() => {
    onRecordingChange(isRecording);
  }, [isRecording, onRecordingChange]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = window.navigator?.language || 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i += 1) {
        finalTranscript += `${event.results[i][0].transcript} `;
      }

      transcriptRef.current = finalTranscript.trim();
      setUserAnswer(transcriptRef.current);
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (restartError) {
          console.error('Speech recognition restart failed:', restartError);
        }
        return;
      }

      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      const errorCode = event?.error || 'unknown';
      console.error('Speech recognition error:', errorCode);

      if (errorCode === 'no-speech' && isRecordingRef.current) {
        return;
      }

      if (errorCode === 'aborted') {
        return;
      }

      if (errorCode === 'not-allowed') {
        setSpeechError('Microphone permission was denied. Please allow microphone access in the browser.');
      } else {
        setSpeechError(`Microphone error: ${errorCode}`);
      }

      isRecordingRef.current = false;
      setIsRecording(false);
      onRecordingChange(false);
    };

    recognitionRef.current = recognition;

    return () => {
      isRecordingRef.current = false;
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      try {
        recognition.stop();
      } catch (cleanupError) {
        console.error('Speech recognition cleanup failed:', cleanupError);
      }
    };
  }, []);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    stopRecording(false);
    transcriptRef.current = '';
    lastSavedAnswerRef.current = '';
    setUserAnswer('');
    setSpeechError('');
  }, [activeQuestionIndex]);

  const requestMicrophoneAccess = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser.');
    }

    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStream.getTracks().forEach((track) => track.stop());
    setHasMicAccess(true);
  };

  const startRecording = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not available in this browser.');
      return;
    }

    transcriptRef.current = '';
    setUserAnswer('');
    setSpeechError('');

    try {
      await requestMicrophoneAccess();
      isRecordingRef.current = true;
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (startError) {
      console.error('Speech recognition start failed:', startError);
      isRecordingRef.current = false;
      setIsRecording(false);
      setHasMicAccess(false);
      setSpeechError('Microphone access failed. Please allow microphone permission and use Google Chrome on HTTPS or localhost.');
      toast.error('Unable to start microphone recording. Please allow microphone permission.');
    }
  };

  const finalizeSubmission = async () => {
    if (isSubmittingRef.current) {
      return;
    }

    const trimmedAnswer = transcriptRef.current.trim();
    if (!trimmedAnswer) {
      toast.error('No answer was captured. Please record again.');
      return;
    }

    isSubmittingRef.current = true;
    await UpdateUserAnswer(trimmedAnswer);
    isSubmittingRef.current = false;
  };

  const stopRecording = (shouldSubmit = true) => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    if (!recognitionRef.current) {
      if (shouldSubmit) {
        finalizeSubmission();
      }
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (stopError) {
      console.error('Speech recognition stop failed:', stopError);
      if (shouldSubmit) {
        finalizeSubmission();
      }
      return;
    }

    if (shouldSubmit) {
      submitTimeoutRef.current = setTimeout(() => {
        finalizeSubmission();
      }, 500);
    }
  };

  const StartStopRecording = () => {
    if (loading || !mockInterviewQuestion?.[activeQuestionIndex]) return;

    if (isRecording) {
      stopRecording(true);
      return;
    }

    startRecording();
  };

  const UpdateUserAnswer = async (capturedAnswer = transcriptRef.current.trim()) => {
    const currentQuestion = mockInterviewQuestion?.[activeQuestionIndex]?.question;
    const trimmedAnswer = capturedAnswer.trim();
    const answerSignature = `${activeQuestionIndex}:${trimmedAnswer}`;
    const storageQuestion = String(currentQuestion || '').trim().slice(0, 240);

    if (!currentQuestion || !trimmedAnswer) {
      return;
    }

    if (!interviewData?.mockId) {
      toast.error('Interview data is still loading. Please try again in a moment.');
      return;
    }

    if (lastSavedAnswerRef.current === answerSignature) {
      return;
    }

    setLoading(true);
    onSavingChange(true);

    try {
      const feedbackPayload = {
        rating:
          0,
        summary: 'Answer saved. AI feedback is temporarily unavailable.',
        idealAnswer:
          mockInterviewQuestion[activeQuestionIndex]?.answer ||
          'No ideal answer generated.',
        breakdown: null,
        starCoaching: null,
        nextSteps: [],
      };

      try {
        const feedbackPrompt =
          "Question: " + currentQuestion +
          ". User Answer: " + trimmedAnswer +
          ". Analyze the answer and return strict JSON only with these fields: " +
          '{"rating":4.2,"summary":"string","idealAnswer":"string","breakdown":{"clarity":4,"technicalDepth":4,"structure":3,"confidence":4,"relevance":5},"starCoaching":{"situation":"string","task":"string","action":"string","result":"string","improvedAnswer":"string"},"nextSteps":["string"]}. ' +
          "Rules: rating should be 0 to 5. summary should be concise and actionable. idealAnswer must be interview-ready. nextSteps must contain 3 short bullets.";

        const result = await chatSession.sendMessage(feedbackPrompt);
        const feedbackRaw = stripCodeFences(result.response.text());
        const parsedFeedback = safeJsonParse(feedbackRaw, null);

        if (parsedFeedback && typeof parsedFeedback === 'object') {
          feedbackPayload.rating =
            Number(parsedFeedback?.rating) >= 0
              ? Number(parsedFeedback.rating)
              : 0;
          feedbackPayload.summary =
            parsedFeedback?.summary || feedbackPayload.summary;
          feedbackPayload.idealAnswer =
            parsedFeedback?.idealAnswer || feedbackPayload.idealAnswer;
          feedbackPayload.breakdown = parsedFeedback?.breakdown || null;
          feedbackPayload.starCoaching = parsedFeedback?.starCoaching || null;
          feedbackPayload.nextSteps = Array.isArray(parsedFeedback?.nextSteps)
            ? parsedFeedback.nextSteps
            : [];
        }
      } catch (feedbackError) {
        console.error("AI feedback generation failed, saving answer with fallback feedback:", feedbackError);
      }

      await db.delete(UserAnswer).where(
        and(
          eq(UserAnswer.mockIdRef, interviewData.mockId),
          eq(UserAnswer.question, storageQuestion)
        )
      );

      const resp = await db.insert(UserAnswer)
        .values({
          mockIdRef: interviewData.mockId,
          question: storageQuestion,
          correctAns: feedbackPayload.idealAnswer,
          userAns: trimmedAnswer,
          feedback: JSON.stringify(feedbackPayload),
          rating: String(feedbackPayload.rating),
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-yyyy')
        })
        .returning({ id: UserAnswer.id });

      if (resp?.[0]?.id) {
        lastSavedAnswerRef.current = answerSignature;
        toast.success('Answer submitted and saved successfully');
        onAnswerSaved(activeQuestionIndex);
        transcriptRef.current = '';
        setUserAnswer('');
      } else {
        throw new Error('Answer insert did not return a database record.');
      }
    } catch (saveError) {
      console.error("Failed to save recorded answer:", saveError);
      toast.error('Failed to process your answer. Please record again.');
    } finally {
      onSavingChange(false);
      setLoading(false);
    }
  };

  return (
    <div className='flex w-full min-w-0 flex-col items-center justify-start'>
      <div className='surface-panel relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[24px] bg-slate-950 p-3 sm:rounded-[28px] sm:p-5'>
        {!hasWebcamAccess && (
          <Image
            src={'/webcam.png'}
            width={200}
            height={200}
            alt="Webcam placeholder"
            className='absolute opacity-70'
          />
        )}
        <Webcam
          audio={false}
          mirrored={true}
          onUserMedia={() => setHasWebcamAccess(true)}
          onUserMediaError={() => {
            setHasWebcamAccess(false);
            toast.error('Camera access failed. Please check your browser permissions.');
          }}
          videoConstraints={{
            facingMode: 'user',
          }}
          className='h-[230px] w-full rounded-[18px] bg-slate-950 object-cover sm:h-[280px] sm:rounded-[22px] md:h-[300px]'
          style={{ zIndex: 10 }}
        />
      </div>
      <div className='mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'>
        {userAnswer && (
          <p className='w-full rounded-[20px] border border-slate-200 bg-secondary p-4 text-base leading-8 text-gray-700 sm:rounded-[24px]'>
            {userAnswer}
          </p>
        )}
        <Button
          disabled={loading || !mockInterviewQuestion?.[activeQuestionIndex]}
          variant="outline" className="quiet-button my-5 w-full px-5 py-6 sm:my-6"
          onClick={StartStopRecording}
        >
          {isRecording ? (
            <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
              <StopCircle />Stop Recording
            </h2>
          ) : isQuestionAnswered ? (
            <h2 className='text-primary flex gap-2 items-center'>
              <Mic /> Re-record Answer
            </h2>
          ) : (
            <h2 className='text-primary flex gap-2 items-center'>
              <Mic /> Record Answer
            </h2>
          )}
        </Button>
        {isQuestionAnswered && !isRecording && (
          <p className='text-center text-sm text-slate-500'>This question already has a saved answer. Recording again will replace it.</p>
        )}
        {speechError && <p className='text-center text-sm text-red-600'>{speechError}</p>}
        {!speechError && hasMicAccess && !isRecording && (
          <p className='text-center text-sm text-emerald-600'>Microphone is ready. Tap record when you want to answer.</p>
        )}
        {!hasWebcamAccess && <p className='text-center text-sm text-gray-500'>Allow camera access in the browser to show your live preview.</p>}
      </div>
    </div>
  )
}

export default RecordAnswerSection
