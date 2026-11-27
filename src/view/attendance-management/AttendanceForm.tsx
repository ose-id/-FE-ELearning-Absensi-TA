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

import { Attendance } from '@/types/attendance'
import { LearningModule } from '@/types/learning-module'

const attendanceSchema = z.object({
    learning_module_id: z.number({ message: 'Learning module is required' }),
    attendance_name: z.string().min(1, 'Attendance name is required'),
    meeting_number: z.number({ message: 'Meeting number is required' }),
    attendance_date: z.string().min(1, 'Date is required' ),
    status: z.number().optional(),
})

export type AttendanceFormData = z.infer<typeof attendanceSchema>


const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface AttendanceFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: AttendanceFormData) => Promise<void>
    initialData?: Attendance | null
    isSubmitting: boolean
    learningModules: LearningModule[]
}

export default function AttendanceForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    learningModules,
}: AttendanceFormProps) {
    const form = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            learning_module_id: 0,
            attendance_name: '',
            meeting_number: 1,
            attendance_date: new Date().toISOString().split('T')[0],
            status: 1,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    learning_module_id: initialData.nid_learning_module,
                    attendance_name: initialData.vname || '',
                    meeting_number: initialData.nmeeting,
                    attendance_date: initialData.vdate ? new Date(initialData.vdate).toISOString().split('T')[0] : '',
                    status: initialData.nstatus,
                })
            } else {
                form.reset({
                    learning_module_id: 0,
                    attendance_name: '',
                    meeting_number: 1,
                    attendance_date: new Date().toISOString().split('T')[0],
                    status: 1,
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: AttendanceFormData) => {
        await onSubmit(data)
    }



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Attendance Session' : 'Create Attendance Session'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update attendance session details.'
                            : 'Create a new attendance session for a learning module.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="learning_module_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Learning Module</FormLabel>
                                    <Select
                                        onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Module">
                                                    {learningModules.find(m => m.nid === field.value)?.vname}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {learningModules.map((mod) => (
                                                <SelectItem key={mod.nid} value={mod.nid.toString()}>
                                                    {mod.vname}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{form.formState.errors.learning_module_id?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="attendance_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Session Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Week 1 Attendance" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.attendance_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="meeting_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meeting #</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.meeting_number?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="attendance_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.attendance_date?.message}</FormMessage>
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
                                {initialData ? 'Save Changes' : 'Create Session'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
