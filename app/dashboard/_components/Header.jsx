"use client"
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

function Header() {
  const path = usePathname();
  const navItems = [
    { href: "/dashboard", label: "Workspace" },
    { href: "/", label: "Home" },
  ];

  return (
    <div className='sticky top-0 z-50 border-b border-white/40 bg-white/65 backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/70'>
      <div className='page-frame py-3 sm:py-4'>
        <div className='flex items-center justify-between gap-3'>
        <Link href={"/dashboard"} className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-200/80 dark:shadow-sky-950/50 sm:h-11 sm:w-11 sm:rounded-[20px]'>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shapes"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>
          </div>
          <div>
            <h2 className='text-lg font-bold dark:text-slate-100 sm:text-xl'>PrepForge</h2>
            <p className='hidden text-xs text-slate-500 sm:block dark:text-slate-400'>Practice smarter. Speak calmer.</p>
          </div>
        </Link>

        <ul className='hidden items-center gap-2 rounded-[22px] border border-white/70 bg-white/75 p-1 md:flex dark:border-slate-800/90 dark:bg-slate-900/75'>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  path === item.href
                    ? 'bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-[0_10px_28px_rgba(59,130,246,0.28)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className='flex items-center gap-3'>
          <div className='rounded-[20px] border border-white/70 bg-white/80 p-1 shadow-sm'>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
        <ul className='mt-3 flex items-center gap-2 overflow-x-auto pb-1 md:hidden'>
          {navItems.map((item) => (
            <li key={`${item.href}-mobile`} className='shrink-0'>
              <Link
                href={item.href}
                className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold transition ${
                  path === item.href
                    ? 'bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-[0_10px_20px_rgba(59,130,246,0.24)]'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Header
