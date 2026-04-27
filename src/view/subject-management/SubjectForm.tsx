
'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

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

import { Subject } from '@/types/subject'
import { Department } from '@/types/department'

const subjectSchema = z.object({
    subject_name: z.string().min(1, 'Subject name is required'),
    department_id: z.number({ message: 'Department is required' }),
})

export type SubjectFormData = z.infer<typeof subjectSchema>


const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface SubjectFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: SubjectFormData) => Promise<void>
    initialData?: Subject | null
    isSubmitting: boolean
    departments: Department[]
}

export default function SubjectForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    departments,
}: SubjectFormProps) {
    const form = useForm<SubjectFormData>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            subject_name: '',
            department_id: 0,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    subject_name: initialData.vsubject_name || '',
                    department_id: initialData.nid_department,
                })
            } else {
                form.reset({
                    subject_name: '',
                    department_id: 0,
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: SubjectFormData) => {
        await onSubmit(data)
    }



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Subject' : 'Create New Subject'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update subject details.'
                            : 'Add a new subject to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                            name="subject_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Subject Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Mathematics" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.subject_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Create Subject'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
