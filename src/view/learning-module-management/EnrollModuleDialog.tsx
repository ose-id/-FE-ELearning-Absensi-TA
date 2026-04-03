'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Key } from 'lucide-react'

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

const enrollSchema = z.object({
    token: z.string().min(1, 'Enrollment token is required'),
})

type EnrollFormData = z.infer<typeof enrollSchema>

interface EnrollModuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onEnroll: (token: string) => Promise<void>
    isEnrolling: boolean
}

export default function EnrollModuleDialog({
    open,
    onOpenChange,
    onEnroll,
    isEnrolling,
}: EnrollModuleDialogProps) {
    const form = useForm<EnrollFormData>({
        resolver: zodResolver(enrollSchema),
        defaultValues: {
            token: '',
        },
    })

    const handleSubmit = async (data: EnrollFormData) => {
        await onEnroll(data.token)
        form.reset()
    }

    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>Enroll to Learning Module</DialogTitle>
                    <DialogDescription>
                        Enter the enrollment token provided by your teacher to join a learning module.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormItem>
                            <FormLabel>Enrollment Token</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Enter token..."
                                        className="pl-10"
                                        {...form.register('token')}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage>{form.formState.errors.token?.message}</FormMessage>
                        </FormItem>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isEnrolling} className="bg-green-600 hover:bg-green-700">
                                {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enroll
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
