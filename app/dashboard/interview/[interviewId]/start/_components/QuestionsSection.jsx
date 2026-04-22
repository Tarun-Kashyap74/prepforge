import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsSection({mockInterviewQuestion,activeQuestionIndex,currentQuestion,onQuestionSelect}) {
 
    const textToSpeach=(text)=>{
        if('speechSynthesis' in window){
            window.speechSynthesis.cancel();
            const speech=new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speech)
        }
        else{
            alert('Sorry, Your browser does not support text to speech')
        }
    }
    return mockInterviewQuestion&&(
    <div className='stack-card my-0 h-full'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <p className='eyebrow'>Question Navigation</p>
            <h3 className='mt-2 text-2xl font-semibold'>Current prompt</h3>
          </div>
          <Volume2 className='h-9 w-9 shrink-0 cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10' onClick={()=>textToSpeach(mockInterviewQuestion[activeQuestionIndex]?.question)} />
        </div>
        <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                {Array.isArray(mockInterviewQuestion) && mockInterviewQuestion.map((_, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => onQuestionSelect?.(index)}
                      className={`rounded-2xl border px-3 py-3 text-sm text-center font-semibold transition ${activeQuestionIndex === index ? 'border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-[0_14px_28px_rgba(59,130,246,0.26)]' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-50'
                    }`}
                    >
                      Question {index + 1}
                    </button>
  ))}
        </div>
        <div className='mt-5 space-y-5'>
        <div className='rounded-[26px] bg-secondary p-6 soft-ring'>
          <h2 className='text-lg leading-8 text-slate-800 md:text-[1.35rem]'>{mockInterviewQuestion[activeQuestionIndex]?.question}</h2>
          {Array.isArray(currentQuestion?.followUps) && currentQuestion.followUps.length > 0 && (
            <div className='mt-5 rounded-2xl border border-cyan-200 bg-white p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>Possible Follow-up Questions</p>
              <ul className='mt-3 space-y-2 text-sm leading-7 text-slate-700'>
                {currentQuestion.followUps.slice(0, 3).map((followUp, index) => (
                  <li key={`${followUp}-${index}`}>
                    {index + 1}. {followUp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className='rounded-[26px] border border-blue-200 bg-blue-50 p-6'>
            <h2 className='flex gap-2 items-center text-primary'> 
                <Lightbulb/>
                <strong>Note:</strong>
            </h2>
            <h2 className='my-2 text-sm leading-7 text-blue-900'>{process.env.NEXT_PUBLIC_QUESTION_NOTE}</h2>
        </div>
        </div>
    </div>
  )
}

export default QuestionsSection
