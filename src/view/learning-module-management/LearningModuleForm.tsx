'use client'

import { useEffect } from 'react'
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

const learningModuleSchema = z.object({
    module_name: z.string().min(1, 'Module name is required'),
    description: z.string().optional(),
    class_id: z.number({ message: 'Class is required' }),
    department_id: z.number({ message: 'Department is required' }),
    subject_id: z.number({ message: 'Subject is required' }),
    term: z.string().optional(),
})

export type LearningModuleFormData = z.infer<typeof learningModuleSchema>

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
    const form = useForm<LearningModuleFormData>({
        resolver: zodResolver(learningModuleSchema),
        defaultValues: {
            module_name: '',
            description: '',
            class_id: 0,
            department_id: 0,
            subject_id: 0,
            term: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    module_name: initialData.vname || '',
                    description: initialData.vdesc || '',
                    class_id: initialData.nid_class,
                    department_id: initialData.nid_department,
                    subject_id: initialData.nid_subject,
                    term: initialData.term || '',
                })
            } else {
                form.reset({
                    module_name: '',
                    description: '',
                    class_id: 0,
                    department_id: 0,
                    subject_id: 0,
                    term: '',
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: LearningModuleFormData) => {
        await onSubmit(data)
    }

    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Learning Module' : 'Create New Learning Module'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update learning module details.'
                            : 'Add a new learning module to the system.'}
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
                                        <FormLabel>Department</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.nid} value={dept.nid.toString()}>
                                                        {dept.vdepartment_name}
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
                                        <FormLabel>Class</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.nid} value={cls.nid.toString()}>
                                                        {cls.vname}
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
                                        <FormLabel>Subject</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Subject" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subjects.map((subj) => (
                                                    <SelectItem key={subj.nid} value={subj.nid.toString()}>
                                                        {subj.vsubject_name}
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
                                name="term"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Term (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 2024/2025" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.term?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name="module_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Name</FormLabel>
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
