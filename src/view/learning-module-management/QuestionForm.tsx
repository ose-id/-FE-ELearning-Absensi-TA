'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, Trash2, GripVertical, CheckCircle, XCircle, HelpCircle, FileText } from 'lucide-react'

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

import { QuizQuestion, QuizOption } from '@/types/quiz'

const questionSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    type: z.enum(['multiple_choice', 'true_false', 'essay']),
    points: z.number().min(1, 'Points must be at least 1'),
    answer_key: z.string().optional(),
    options: z.array(z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
    })).optional(),
})

export type QuestionFormData = z.infer<typeof questionSchema>

const FormItem = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
)

interface QuestionFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: QuestionFormData) => Promise<void>
    initialData?: QuizQuestion | null
    isSubmitting: boolean
    questionNumber: number
}

export default function QuestionForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    questionNumber,
}: QuestionFormProps) {
    const [options, setOptions] = useState<QuizOption[]>([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
    ])

    const form = useForm<QuestionFormData>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            question: '',
            type: 'multiple_choice',
            points: 1,
            answer_key: '',
            options: [],
        },
    })

    const questionType = form.watch('type')

    const parseOptions = (optionsStr?: string): QuizOption[] => {
        if (!optionsStr) return []
        try {
            return JSON.parse(optionsStr)
        } catch {
            return []
        }
    }

    const handleTypeChange = (type: 'multiple_choice' | 'true_false' | 'essay') => {
        form.setValue('type', type)
        if (type === 'true_false') {
            setOptions([
                { id: '1', text: 'Benar', isCorrect: false },
                { id: '2', text: 'Salah', isCorrect: false },
            ])
        } else if (type === 'multiple_choice') {
            setOptions([
                { id: '1', text: '', isCorrect: false },
                { id: '2', text: '', isCorrect: false },
                { id: '3', text: '', isCorrect: false },
                { id: '4', text: '', isCorrect: false },
            ])
        }
    }

    const handleOptionChange = (id: string, text: string) => {
        const newOptions = options.map(opt =>
            opt.id === id ? { ...opt, text } : opt
        )
        setOptions(newOptions)
    }

    const handleCorrectChange = (id: string) => {
        const newOptions = options.map(opt =>
            opt.id === id ? { ...opt, isCorrect: true } : { ...opt, isCorrect: false }
        )
        setOptions(newOptions)
        form.setValue('answer_key', id)
    }

    const addOption = () => {
        setOptions([...options, { id: String(options.length + 1), text: '', isCorrect: false }])
    }

    const removeOption = (id: string) => {
        if (options.length <= 2) return
        setOptions(options.filter(opt => opt.id !== id))
    }

    const handleSubmit = async (data: QuestionFormData) => {
        let finalData = { ...data }

        if (data.type === 'multiple_choice' || data.type === 'true_false') {
            finalData = {
                ...data,
                options: options,
                answer_key: options.find(o => o.isCorrect)?.id || '',
            }
        } else {
            // Essay - no answer key needed
            finalData = {
                ...data,
                options: [],
                answer_key: '',
            }
        }

        await onSubmit(finalData as QuestionFormData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Question' : `Question #${questionNumber}`}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update quiz question.'
                            : 'Add question for this quiz.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Controller
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Question Type</FormLabel>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('multiple_choice')}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                                                field.value === 'multiple_choice'
                                                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            Multiple Choice
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('true_false')}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                                                field.value === 'true_false'
                                                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            True/False
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange('essay')}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                                                field.value === 'essay'
                                                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            Essay
                                        </button>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Question</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write question..."
                                            {...field}
                                            value={field.value || ''}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.question?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="points"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel required>Points</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                                            className="w-32"
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.points?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Options for Multiple Choice / True-False */}
                        {(questionType === 'multiple_choice' || questionType === 'true_false') && (
                            <FormItem>
                                <FormLabel required>Answer Options</FormLabel>
                                <div className="space-y-3">
                                    {options.map((option, index) => (
                                        <div key={option.id} className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleCorrectChange(option.id)}
                                                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                                                    option.isCorrect
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 text-gray-400 hover:border-green-400'
                                                }`}
                                                title="Correct Answer"
                                            >
                                                {option.isCorrect ? <CheckCircle className="h-5 w-5" /> : <span className="text-sm">{String.fromCharCode(65 + index)}</span>}
                                            </button>
                                            <Input
                                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                                className="flex-1"
                                                disabled={questionType === 'true_false'}
                                            />
                                            {questionType === 'multiple_choice' && options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(option.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {questionType === 'multiple_choice' && (
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Option
                                        </button>
                                    )}
                                </div>
                            </FormItem>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Changes' : 'Add Question'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
