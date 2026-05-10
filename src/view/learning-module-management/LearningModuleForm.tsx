'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select/Select'

import { LearningModule } from '@/types/learning-module'
import { Department } from '@/types/department'
import { Class } from '@/types/class'
import { Subject } from '@/types/subject'
import { lovService, LOVItem } from '@/services/lov.service'

const learningModuleSchema = z.object({
    module_name: z.string().min(1, 'Module name is required'),
    description: z.string().optional(),
    class_id: z.number({ message: 'Class is required' }),
    department_id: z.number({ message: 'Department is required' }),
    subject_id: z.number({ message: 'Subject is required' }),
    academic_year_id: z.number({ message: 'Academic Year is required' }),
    school_term_id: z.number({ message: 'School Term is required' }),
})

export type LearningModuleFormData = z.infer<typeof learningModuleSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface LearningModuleFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: LearningModuleFormData) => Promise<void>
    initialData?: LearningModule | null
    isSubmitting: boolean
    departments: Department[]
    classes: Class[]
    subjects: Subject[]
}

export default function LearningModuleForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    departments,
    classes,
    subjects,
}: LearningModuleFormProps) {
    const { data: session } = useSession()
    const [academicYears, setAcademicYears] = useState<LOVItem[]>([])
    const [schoolTerms, setSchoolTerms] = useState<LOVItem[]>([])
    const [loadingLOV, setLoadingLOV] = useState(false)

    const form = useForm<LearningModuleFormData>({
        resolver: zodResolver(learningModuleSchema),
        defaultValues: {
            module_name: '',
            description: '',
            class_id: 0,
            department_id: 0,
            subject_id: 0,
            academic_year_id: 0,
            school_term_id: 0,
        },
    })

    const fetchLOVData = async () => {
        if (!session?.accessToken) return
        try {
            setLoadingLOV(true)
            const [years, terms] = await Promise.all([
                lovService.getAcademicYears(session.accessToken),
                lovService.getSchoolTerms(session.accessToken),
            ])
            setAcademicYears(years)
            setSchoolTerms(terms)
        } catch (error) {
            console.error('Failed to fetch LOV data:', error)
        } finally {
            setLoadingLOV(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchLOVData()
        }
    }, [open, session])

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    module_name: initialData.vname || '',
                    description: initialData.vdesc || '',
                    class_id: initialData.nid_class,
                    department_id: initialData.nid_department,
                    subject_id: initialData.nid_subject,
                    academic_year_id: (initialData as any).academic_year_id || 0,
                    school_term_id: (initialData as any).school_term_id || 0,
                })
            } else {
                form.reset({
                    module_name: '',
                    description: '',
                    class_id: 0,
                    department_id: 0,
                    subject_id: 0,
                    academic_year_id: 0,
                    school_term_id: 0,
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: LearningModuleFormData) => {
        await onSubmit(data)
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
                            : 'Tambahkan materi pembelajaran baru.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="department_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Department</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Department">
                                                        {departments.find(d => d.nid === field.value)?.vdepartment_name || 
                                                         (departments.find(d => d.nid === field.value) as any)?.label}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.nid} value={dept.nid.toString()}>
                                                        {(dept as any).label || dept.vdepartment_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage>{form.formState.errors.department_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="class_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Class</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Class">
                                                        {classes.find(c => c.nid === field.value)?.vname}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.nid} value={cls.nid.toString()}>
                                                        {(cls as any).label || cls.vname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage>{form.formState.errors.class_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="subject_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Subject</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Subject">
                                                        {subjects.find(s => s.nid === field.value)?.vsubject_name}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subjects.map((subj) => (
                                                    <SelectItem key={subj.nid} value={subj.nid.toString()}>
                                                        {(subj as any).label || subj.vsubject_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage>{form.formState.errors.subject_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="academic_year_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>Academic Year</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                            disabled={loadingLOV}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingLOV ? "Loading..." : "Select Academic Year"}>
                                                        {academicYears.find(y => y.nid === field.value)?.label}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.nid} value={year.nid.toString()}>
                                                        {year.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage>{form.formState.errors.academic_year_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="school_term_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>School Term</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                            disabled={loadingLOV}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingLOV ? "Loading..." : "Select Term"}>
                                                        {schoolTerms.find(t => t.nid === field.value)?.label}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {schoolTerms.map((term) => (
                                                    <SelectItem key={term.nid} value={term.nid.toString()}>
                                                        {term.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage>{form.formState.errors.school_term_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name="module_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Module Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Chapter 1 - Introduction" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.module_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Module description..."
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Create Module'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}