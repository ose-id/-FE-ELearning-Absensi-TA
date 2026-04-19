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

import { Assignment } from '@/types/assignment'
import { Class } from '@/types/class'
import { LearningModule } from '@/types/learning-module'

const assignmentSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    class_id: z.number({ message: "Class is required" }),
    learning_module_id: z.number({ message: "Learning Module is required" }),
    due_date: z.string().min(1, 'Due date is required')
        .refine((date) => {
            const selectedDate = new Date(date)
            const now = new Date()
            now.setMinutes(now.getMinutes() + 1) // Give 1 minute buffer
            return selectedDate > now
        }, { message: 'Due date must be in the future' }),
    max_score: z.number().min(1, 'Max score must be at least 1'),
})

export type AssignmentFormData = z.infer<typeof assignmentSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface AssignmentFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: AssignmentFormData) => Promise<void>
    initialData?: Assignment | null
    isSubmitting: boolean
    classes: Class[]
    learningModules: LearningModule[]
}

export default function AssignmentForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    classes,
    learningModules,
}: AssignmentFormProps) {
    const form = useForm<AssignmentFormData>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            title: '',
            description: '',
            class_id: undefined,
            learning_module_id: undefined,
            due_date: '',
            max_score: 100,
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                const dueDate = new Date(initialData.due_date)
                const formattedDate = dueDate.toISOString().slice(0, 16)

                form.reset({
                    title: initialData.title,
                    description: initialData.description,
                    class_id: initialData.class_id,
                    learning_module_id: initialData.learning_module_id,
                    due_date: formattedDate,
                    max_score: initialData.max_score,
                })
            } else {
                form.reset({
                    title: '',
                    description: '',
                    class_id: undefined,
                    learning_module_id: undefined,
                    due_date: '',
                    max_score: 100,
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: AssignmentFormData) => {
        await onSubmit(data)
    }



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Assignment' : 'Create New Assignment'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update assignment details.'
                            : 'Add a new assignment for your learning module.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                        <Controller
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Assignment 1: Introduction" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.title?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the assignment..."
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
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
                                                    <SelectValue placeholder="Select Module" />
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
                                name="max_score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Score</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.max_score?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.due_date?.message}</FormMessage>
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
                                {initialData ? 'Save Changes' : 'Create Assignment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
