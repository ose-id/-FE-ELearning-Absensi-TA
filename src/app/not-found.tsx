'use client'

import { FileQuestion } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
        {/* Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-300/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Main Container */}
        <div className="relative z-10 max-w-md w-full rounded-[24px] border border-gray-200 bg-white p-8 shadow-xl">
          {/* Animated Icon Container */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6 shadow-inner animate-pulse">
            <FileQuestion className="h-10 w-10" />
          </div>

          <h1 className="text-7xl font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Halaman Tidak Ditemukan
          </h2>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan ke alamat lain. Silakan periksa kembali tautan Anda atau kembali menggunakan menu navigasi di samping.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
