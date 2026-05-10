'use client'

import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Upload, X, FileText } from 'lucide-react'
import { useSession } from 'next-auth/react'

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

import { Material } from '@/types/material'
import { LearningModule } from '@/types/learning-module'

const materialSchema = z.object({
    title: z.string().min(1, 'Judul materi wajib diisi'),
    description: z.string().optional(),
    learning_module_id: z.number({ message: 'Learning module wajib dipilih' }),
})

export type MaterialFormData = z.infer<typeof materialSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface MaterialFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: MaterialFormData, file?: File) => Promise<void>
    initialData?: Material | null
    isSubmitting: boolean
    learningModules: LearningModule[]
}

export default function MaterialForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    learningModules,
}: MaterialFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)

    const form = useForm<MaterialFormData>({
        resolver: zodResolver(materialSchema),
        defaultValues: {
            title: '',
            description: '',
            learning_module_id: 0,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    title: initialData.vtitle || '',
                    description: initialData.vdesc || '',
                    learning_module_id: initialData.nid_learning_module,
                })
                if (initialData.vfile_name) {
                    setFilePreview(initialData.vfile_name)
                }
            } else {
                form.reset({
                    title: '',
                    description: '',
                    learning_module_id: learningModules[0]?.nid || 0,
                })
                setSelectedFile(null)
                setFilePreview(null)
            }
        }
    }, [open, initialData, form, learningModules])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setFilePreview(file.name)
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        setFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (data: MaterialFormData) => {
        await onSubmit(data, selectedFile || undefined)
        handleRemoveFile()
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Materi' : 'Tambah Materi Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Perbarui detail materi pembelajaran.'
                            : 'Tambahkan materi pembelajaran baru untuk siswa.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Judul Materi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Chapter 1 - Pendahuluan" {...field} />
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
                                            placeholder="Deskripsi materi..."
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* File Upload */}
                        <FormItem>
                            <FormLabel>File Materi (Opsional)</FormLabel>
                            <div className="mt-2">
                                {filePreview ? (
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{filePreview}</p>
                                                {selectedFile && (
                                                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                    >
                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (max. 10MB)</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </FormItem>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); handleRemoveFile() }} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Simpan Perubahan' : 'Buat Materi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
