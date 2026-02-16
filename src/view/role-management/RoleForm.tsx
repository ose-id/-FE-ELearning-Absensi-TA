
'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Shield, Code } from 'lucide-react'

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
        <div className="space-y-3">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border-none shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-800" />
                        {initialData ? 'Edit System Role' : 'Create New Role'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Define roles to control user access levels and permissions.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-2">
                        <Controller
                            control={form.control}
                            name="role_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Role Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="e.g. Administrator"
                                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.role_name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="role_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Role Code</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="e.g. ADM"
                                                {...field}
                                                maxLength={5}
                                                className="pl-10 uppercase font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </FormControl>
                                    <p className="text-xs text-gray-500 ml-1">Short identifier code (2-5 chars, uppercase).</p>
                                    <FormMessage>{form.formState.errors.role_code?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-3 sm:gap-0 mt-6 pt-6 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>{initialData ? 'Save Changes' : 'Create Role'}</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
