'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { toast } from 'react-toastify'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'

import type { LoginSchema } from './Login.types'
import { loginSchema } from './Login.schemas'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

const Login = () => {
  const router = useRouter()

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@12345'
    }
  })

  const onSubmit = async (data: LoginSchema) => {
    console.log('[Login Form] Submitting login request:', { email: data.email })

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      console.log('[Login Form] SignIn response:', res)

      if (res?.error) {
        console.error('[Login Form] Authentication failed:', {
          error: res.error,
          status: res.status,
          ok: res.ok,
          url: res.url
        })

        toast.error('Authentication failed. Please try again.')

        form.setError('email', { message: '' })
        form.setError('password', { message: '' })

        form.setFocus('email')

        return
      }

      if (res?.ok) {
        console.log('[Login Form] Authentication successful, redirecting to dashboard')
        router.push('/dashboard')

        return
      }
    } catch (error) {
      console.error('[Login Form] Unexpected error during login:', error)

      toast.error('Authentication failed. Please try again.')

      form.setError('email', { message: '' })
      form.setError('password', { message: '' })

      form.setFocus('email')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Navy Blue with Logo */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-[#0C2B4E] p-12 lg:flex">
        {/* Decorative curved shapes */}
        <div className="absolute -bottom-35 -left-35 h-80 w-80 rounded-full border-[40px] border-[#235FA3]" />

        {/* Content */}
        <div className="relative z-10 flex items-start gap-8">
          {/* School Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/LOGO SMKN 1.png"
              alt="Logo SMKN 1 Jakarta"
              width={180}
              height={180}
              className="rounded-full"
            />
          </div>

          {/* Welcome Text */}
          <div className="max-w-md">
            <h1 className="mb-4 text-3xl font-bold text-white">Welcome to SMKN 1 Jakarta</h1>
            <p className="text-sm leading-relaxed text-gray-300 text-justify">
              Welcome to the digital learning environment of SMK Negeri 1 Jakarta. Let&apos;s build an excellent and high-achieving generation together. Please sign in to continue your activities.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - White with Form */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gray-50 p-8 lg:w-1/2">
        {/* Back Arrow */}
        <button
          className="absolute left-8 top-8 text-gray-600 transition-colors hover:text-gray-900"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        {/* Decorative curved shape */}
        <div className="absolute -right-25 top-10 h-50 w-50 rounded-full border-[25px] border-gray-200 bg-transparent" />

        {/* Sign In Form */}
        <div className="relative z-10 w-full max-w-sm">
          <h2 className="mb-8 text-center text-4xl font-bold text-gray-900">Sign In</h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              {...form.register('email')}
              className="h-12 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
            <Input
              type="password"
              placeholder="Password"
              {...form.register('password')}
              className="h-12 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="h-12 w-full bg-[#1a2744] text-white hover:bg-[#243454]"
            >
              {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
