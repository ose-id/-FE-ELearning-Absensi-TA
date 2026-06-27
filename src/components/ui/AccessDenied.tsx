'use client'

import { ShieldAlert } from 'lucide-react'

export default function AccessDenied() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center px-4">
      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-300/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full rounded-[24px] border border-gray-200 bg-white p-8 shadow-xl">
        {/* Animated Icon Container */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-6 shadow-inner animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Akses Ditolak
        </h1>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          Anda tidak memiliki izin (role) yang sesuai untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan, atau gunakan menu navigasi di samping untuk kembali ke halaman yang diizinkan.
        </p>
      </div>
    </div>
  )
}
