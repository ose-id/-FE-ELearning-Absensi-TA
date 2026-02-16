
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

import { Role } from '@/types/role'

const roleSchema = z.object({
    role_name: z.string().min(1, 'Role Name is required'),
    role_code: z.string().min(2, 'Role Code must be at least 2 characters').max(5, 'Role Code max 5 chars'),
})

export type RoleFormData = z.infer<typeof roleSchema>

interface RoleFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: RoleFormData) => Promise<void>
    initialData?: Role | null
    isSubmitting: boolean
}

export default function RoleForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
}: RoleFormProps) {
    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            role_name: '',
            role_code: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    role_name: initialData.role_name,
                    role_code: initialData.role_code,
                })
            } else {
                form.reset({
                    role_name: '',
                    role_code: '',
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: RoleFormData) => {
        await onSubmit(data)
    }

    // Helper for emulate FormItem
    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit System Role' : 'Create New Role'}
                    </DialogTitle>
                    <DialogDescription>
                        Define roles to control user access levels and permissions.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <Controller
                            control={form.control}
                            name="role_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Administrator" {...field} />
                                    </FormControl>
                                    <p className="text-[10px] text-gray-500">The visible name of the role.</p>
                                    <FormMessage>{form.formState.errors.role_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="role_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. ADM" {...field} maxLength={5} className="uppercase font-mono" />
                                    </FormControl>
                                    <p className="text-[10px] text-gray-500">Short identifier code (max 5 chars).</p>
                                    <FormMessage>{form.formState.errors.role_code?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Save Role' : 'Create Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
