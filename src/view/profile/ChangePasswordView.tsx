'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ShieldAlert, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

import { userService } from '@/services/user.service'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Form from '@/components/ui/form'
import FormControl from '@/components/ui/form/form-control'
import FormLabel from '@/components/ui/form/form-label'
import FormMessage from '@/components/ui/form/form-message'
import { toast } from 'react-toastify'

// ── Tiny layout helper ──────────────────────────────────────────────────────
const FormItem = ({
    children,
}: {
    children: React.ReactNode
}) => <div className="space-y-2">{children}</div>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf besar')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka')
    .regex(/[@$!%*?&]/, 'Harus mengandung karakter spesial (@$!%*?&)'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "Password baru tidak boleh sama dengan password lama",
  path: ["newPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function ChangePasswordView() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: PasswordFormData) => {
    if (!session?.accessToken || !session?.user?.id) return

    setLoading(true)
    try {
      await userService.updateUser(
        Number(session.user.id),
        session.user.role_nid,
        {
          ...session.user,
          password: values.newPassword,
        },
        session.accessToken
      )

      setSuccess(true)
      toast.success('Password berhasil diperbarui')

      // Update session to clear mustChangePassword flag
      await update({
        ...session,
        user: {
          ...session.user,
          mustChangePassword: false
        }
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Change password error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengganti password'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Diperbarui!</h1>
        <p className="text-gray-600 mb-6">Anda akan diarahkan kembali ke dashboard dalam beberapa detik...</p>
        <Button onClick={() => router.push('/dashboard')}>
          Ke Dashboard Sekarang
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ganti Password</h1>
            <p className="text-sm text-gray-500">Demi keamanan, silakan perbarui password Anda.</p>
          </div>
        </div>

        {session?.user?.mustChangePassword && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Peringatan Keamanan</p>
              <p>Anda menggunakan password default. Anda wajib menggantinya sebelum dapat mengakses fitur lain.</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="currentPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel required>Password Saat Ini</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Masukkan password saat ini"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  {fieldState.error ? (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  ) : (
                    <FormMessage />
                  )}
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel required>Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNew ? 'text' : 'password'}
                        placeholder="Minimal 8 karakter, huruf & angka"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  {fieldState.error ? (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  ) : (
                    <FormMessage />
                  )}
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel required>Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Ulangi password baru"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  {fieldState.error ? (
                    <p className="text-[0.8rem] font-medium text-destructive">{fieldState.error.message}</p>
                  ) : (
                    <FormMessage />
                  )}
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Perbarui Password'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
