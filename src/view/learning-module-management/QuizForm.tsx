'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea/Textarea'

import Dialog from '@/components/ui/dialog'
import DialogContent from '@/components/ui/dialog/dialog-content'
import DialogDescription from '@/components/ui/dialog/dialog-description'
import DialogFooter from '@/components/ui/dialog/dialog-footer'
import DialogHeader from '@/components/ui/dialog/dialog-header'
import DialogTitle from '@/components/ui/dialog/dialog-title'

import Form from '@/components/ui/form'
import FormControl from '@/components/ui/form/form-control'
import FormLabel from '@/components/ui/form/form-label'
import FormMessage from '@/components/ui/form/form-message'

import { Quiz } from '@/types/quiz'
import { LearningModule } from '@/types/learning-module'

const quizSchema = z.object({
    title: z.string().min(1, 'Judul kuis wajib diisi'),
    description: z.string().optional(),
    learning_module_id: z.number({ message: 'Learning module wajib dipilih' }),
    duration: z.number().min(1, 'Durasi minimal 1 menit').max(180, 'Durasi maksimal 180 menit'),
    max_score: z.number().min(1, 'Skor maksimal minimal 1'),
    passing_score: z.number().optional(),
    status: z.number().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    show_results: z.number().optional(),
})

export type QuizFormData = z.infer<typeof quizSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface QuizFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: QuizFormData) => Promise<void>
    initialData?: Quiz | null
    isSubmitting: boolean
    learningModules: LearningModule[]
}

export default function QuizForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    learningModules,
}: QuizFormProps) {
    const form = useForm<QuizFormData>({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: '',
            description: '',
            learning_module_id: 0,
            duration: 30,
            max_score: 100,
            passing_score: 60,
            status: 0,
            start_date: '',
            end_date: '',
            show_results: 1,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    title: initialData.vtitle || '',
                    description: initialData.vdesc || '',
                    learning_module_id: initialData.nid_learning_module,
                    duration: initialData.nduration || 30,
                    max_score: initialData.nmax_score || 100,
                    passing_score: initialData.npassing_score || 60,
                    status: initialData.nstatus || 0,
                    start_date: initialData.dstart && !initialData.dstart.startsWith('0001-01-01') ? initialData.dstart.split('T')[0] : '',
                    end_date: initialData.dend && !initialData.dend.startsWith('0001-01-01') ? initialData.dend.split('T')[0] : '',
                    show_results: initialData.nshow_results !== undefined ? initialData.nshow_results : 1,
                })
            } else {
                form.reset({
                    title: '',
                    description: '',
                    learning_module_id: learningModules[0]?.nid || 0,
                    duration: 30,
                    max_score: 100,
                    passing_score: 60,
                    status: 0,
                    start_date: '',
                    end_date: '',
                    show_results: 1,
                })
            }
        }
    }, [open, initialData, form, learningModules])

    const handleSubmit = async (data: QuizFormData) => {
        await onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Quiz' : 'Buat Quiz Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Perbarui detail quiz.'
                            : 'Buat quiz baru untuk menguji pemahaman siswa.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Judul Quiz</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Quiz Bab 1 - Aljabar" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.title?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="learning_module_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Modul Pembelajaran</FormLabel>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    >
                                        <option value="">Pilih Modul</option>
                                        {learningModules.map((mod) => (
                                            <option key={mod.nid} value={mod.nid}>
                                                {mod.vname}
                                            </option>
                                        ))}
                                    </select>
                                    <FormMessage>{form.formState.errors.learning_module_id?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Deskripsi quiz..."
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Durasi (menit)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={180}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.duration?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="max_score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Skor Maksimal</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.max_score?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="passing_score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skor Lulus</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.passing_score?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Status</FormLabel>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={field.value || 0}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                        >
                                            <option value={0}>Draft</option>
                                            <option value={1}>Aktif</option>
                                        </select>
                                        <FormMessage>{form.formState.errors.status?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Mulai</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.start_date?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Selesai</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.end_date?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="show_results"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tampilkan Nilai ke Siswa</FormLabel>
                                        <div className="flex h-10 items-center">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    checked={field.value === 1}
                                                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                />
                                                <span className="text-sm font-medium text-gray-700">Tampilkan Nilai</span>
                                            </label>
                                        </div>
                                        <FormMessage>{form.formState.errors.show_results?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Simpan Perubahan' : 'Buat Quiz'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
