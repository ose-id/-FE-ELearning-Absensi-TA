
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

import { Department } from '@/types/department'

const departmentSchema = z.object({
    department_name: z.string().min(1, 'Department name is required'),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: DepartmentFormData) => Promise<void>
    initialData?: Department | null
    isSubmitting: boolean
}

export default function DepartmentForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
}: DepartmentFormProps) {
    const form = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            department_name: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    department_name: initialData.vdepartment_name || '',
                })
            } else {
                form.reset({
                    department_name: '',
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: DepartmentFormData) => {
        await onSubmit(data)
    }

    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Department' : 'Create New Department'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update department details.'
                            : 'Add a new department to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="department_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Science Department" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.department_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Create Department'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
