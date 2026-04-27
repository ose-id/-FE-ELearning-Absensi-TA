'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import Button from '@/components/ui/button'

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

import { SchoolTerm } from '@/services/school-term.service'
import { AcademicYear } from '@/services/academic-year.service'

const schoolTermSchema = z.object({
    term_name: z.string().min(1, 'Term name is required'),
    academic_year_id: z.number({ message: "Academic Year is required" }),
})

export type SchoolTermFormData = z.infer<typeof schoolTermSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface SchoolTermFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: SchoolTermFormData) => Promise<void>
    initialData?: SchoolTerm | null
    isSubmitting: boolean
    academicYears: AcademicYear[]
}

export default function SchoolTermForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    academicYears,
}: SchoolTermFormProps) {
    const form = useForm<SchoolTermFormData>({
        resolver: zodResolver(schoolTermSchema),
        defaultValues: {
            term_name: '',
            academic_year_id: 0,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    term_name: initialData.vterm_name || '',
                    academic_year_id: initialData.nid_academic_year,
                })
            } else {
                form.reset({
                    term_name: '',
                    academic_year_id: 0,
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: SchoolTermFormData) => {
        await onSubmit(data)
    }



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit School Term' : 'Create New School Term'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update school term details.'
                            : 'Add a new school term to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="academic_year_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Academic Year</FormLabel>
                                    <Select
                                        onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Academic Year">
                                                    {academicYears.find(y => y.nid === field.value)?.vacademic_year_name}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {academicYears.map((year) => (
                                                <SelectItem key={year.nid} value={year.nid.toString()}>
                                                    {year.vacademic_year_name}
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
                            name="term_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Term Name</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Term">
                                                    {field.value}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Ganjil">Ganjil</SelectItem>
                                            <SelectItem value="Genap">Genap</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{form.formState.errors.term_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Create School Term'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}