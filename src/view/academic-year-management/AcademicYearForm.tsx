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

import { AcademicYear } from '@/services/academic-year.service'

const academicYearSchema = z.object({
    academic_year_name: z.string().min(1, 'Academic year name is required'),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
})

export type AcademicYearFormData = z.infer<typeof academicYearSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface AcademicYearFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: AcademicYearFormData) => Promise<void>
    initialData?: AcademicYear | null
    isSubmitting: boolean
}

export default function AcademicYearForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
}: AcademicYearFormProps) {
    const form = useForm<AcademicYearFormData>({
        resolver: zodResolver(academicYearSchema),
        defaultValues: {
            academic_year_name: '',
            start_date: '',
            end_date: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    academic_year_name: initialData.vacademic_year_name || '',
                    start_date: initialData.dstart_date || '',
                    end_date: initialData.dend_date || '',
                })
            } else {
                form.reset({
                    academic_year_name: '',
                    start_date: '',
                    end_date: '',
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: AcademicYearFormData) => {
        await onSubmit(data)
    }



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Academic Year' : 'Create New Academic Year'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update academic year details.'
                            : 'Add a new academic year to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="academic_year_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Academic Year Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 2024/2025" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.academic_year_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
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
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.end_date?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Create Academic Year'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}