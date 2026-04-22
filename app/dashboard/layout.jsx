import React from 'react'
import Header from './_components/Header'

function DashboardLayout({children}) {
  return (
    <div className='page-shell min-h-screen'>
        <Header/>
        <div className='page-frame pb-12 pt-6 sm:pt-8'>
        {children}
        </div>
       
    </div>
  )
}

export default DashboardLayout
