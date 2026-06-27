'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center p-6">
        {/* Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-300/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Content Container (Plain text style, no card box) */}
        <div className="relative z-10 max-w-lg w-full space-y-4">
          <h1 className="text-8xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            404
          </h1>
          
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Page Not Found
          </h2>
          
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            Sorry, the page you are looking for does not exist or has been moved. Please check the URL or use the sidebar navigation to get back on track.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
