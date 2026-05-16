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

import { Exam } from '@/types/exam'
import { LearningModule } from '@/types/learning-module'

const examSchema = z.object({
    title: z.string().min(1, 'Judul ujian wajib diisi'),
    description: z.string().optional(),
    learning_module_id: z.number({ message: 'Learning module wajib dipilih' }),
    duration: z.number().min(1, 'Durasi minimal 1 menit').max(300, 'Durasi maksimal 300 menit'),
    pass_grade: z.number().min(0).max(100, 'Nilai lulus 0-100').default(60),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    show_results: z.number().default(1),
    fullscreen: z.number().default(1),
    cutoff: z.number().default(0),
    status: z.number().default(1),
})

export type ExamFormData = z.infer<typeof examSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface ExamFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: ExamFormData) => Promise<void>
    initialData?: Exam | null
    isSubmitting: boolean
    learningModules: LearningModule[]
    selectedModuleId?: number
}

export default function ExamForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    learningModules,
    selectedModuleId,
}: ExamFormProps) {
    const form = useForm<ExamFormData>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            title: '',
            description: '',
            learning_module_id: 0,
            duration: 60,
            pass_grade: 60,
            start_date: '',
            end_date: '',
            show_results: 1,
            fullscreen: 1,
            cutoff: 0,
            status: 1,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    title: initialData.vtitle || '',
                    description: initialData.vdescription || '',
                    learning_module_id: initialData.nid_learning_module,
                    duration: initialData.nduration,
                    pass_grade: initialData.npass_grade,
                    start_date: initialData.dstart ? initialData.dstart.slice(0, 16) : '',
                    end_date: initialData.dend ? initialData.dend.slice(0, 16) : '',
                    show_results: initialData.nshow_results,
                    fullscreen: initialData.nfullscreen,
                    cutoff: initialData.ncutoff,
                    status: initialData.nstatus,
                })
            } else {
                form.reset({
                    title: '',
                    description: '',
                    learning_module_id: selectedModuleId || 0,
                    duration: 60,
                    pass_grade: 60,
                    start_date: '',
                    end_date: '',
                    show_results: 1,
                    fullscreen: 1,
                    cutoff: 0,
                    status: 1,
                })
            }
        }
    }, [open, initialData, selectedModuleId, form])

    const handleSubmit = async (data: ExamFormData) => {
        await onSubmit(data)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Ujian' : 'Tambah Ujian Baru'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Edit detail ujian di bawah.' : 'Buat ujian baru untuk modul pembelajaran.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <Form {...form}>
                        <FormItem>
                            <FormLabel>Judul Ujian</FormLabel>
                            <FormControl>
                                <Input
                                    {...form.register('title')}
                                    placeholder="Contoh: Ujian Tengah Semester"
                                />
                            </FormControl>
                            <FormMessage>{form.formState.errors.title?.message}</FormMessage>
                        </FormItem>

                        <FormItem>
                            <FormLabel>Modul Pembelajaran</FormLabel>
                            <FormControl>
                                <select
                                    {...form.register('learning_module_id', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value={0}>Pilih Modul</option>
                                    {learningModules.map(m => (
                                        <option key={m.nid} value={m.nid}>{m.vname}</option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage>{form.formState.errors.learning_module_id?.message}</FormMessage>
                        </FormItem>

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel>Durasi (menit)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...form.register('duration', { valueAsNumber: true })}
                                    />
                                </FormControl>
                                <FormMessage>{form.formState.errors.duration?.message}</FormMessage>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Nilai Lulus</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...form.register('pass_grade', { valueAsNumber: true })}
                                    />
                                </FormControl>
                                <FormMessage>{form.formState.errors.pass_grade?.message}</FormMessage>
                            </FormItem>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel>Mulai</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...form.register('start_date')}
                                    />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Selesai</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...form.register('end_date')}
                                    />
                                </FormControl>
                            </FormItem>
                        </div>

                        <FormItem>
                            <FormLabel>Deskripsi</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...form.register('description')}
                                    placeholder="Deskripsi ujian..."
                                    rows={3}
                                />
                            </FormControl>
                        </FormItem>

                        <FormItem>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...form.register('status', { valueAsNumber: true })}
                                    checked={form.watch('status') === 1}
                                    onChange={(e) => form.setValue('status', e.target.checked ? 1 : 0)}
                                />
                                <span className="text-sm">Aktif</span>
                            </label>
                        </FormItem>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Simpan' : 'Buat'}
                            </Button>
                        </DialogFooter>
                    </Form>
                </form>
            </DialogContent>
        </Dialog>
    )
}
