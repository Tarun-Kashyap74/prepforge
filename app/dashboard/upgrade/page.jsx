import React from 'react'

function Upgrade() {
    return (
        <div className='p-10 max-w-3xl mx-auto'>
            <h2 className='font-bold text-3xl text-center'>Everything Is Free</h2>
            <p className='text-center text-gray-500 mt-3'>
                All interview features are available to every user with no paid plans, billing, or upgrade requirements.
            </p>
            <div className='mt-8 rounded-xl border bg-secondary p-6'>
                <h3 className='text-xl font-semibold'>Included for everyone</h3>
                <ul className='mt-4 space-y-2 text-gray-700'>
                    <li>Create unlimited mock interviews</li>
                    <li>Record answers without plan restrictions</li>
                    <li>Retake interviews as many times as needed</li>
                    <li>Access feedback and improvement suggestions</li>
                </ul>
            </div>
        </div>
    )
}

export default Upgrade
