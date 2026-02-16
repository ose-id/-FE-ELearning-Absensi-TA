
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

import { User } from '@/types/user'

const userSchema = z.object({
    fullname: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().optional(),
    role_id: z.number({ message: "Role is required" }),
})

export type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: UserFormData) => Promise<void>
    initialData?: User | null
    isSubmitting: boolean
}

export default function UserForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
}: UserFormProps) {
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            fullname: '',
            email: '',
            username: '',
            password: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    fullname: initialData.fullname,
                    email: initialData.email,
                    username: initialData.username,
                    password: '',
                    role_id: initialData.role_id,
                })
            } else {
                form.reset({
                    fullname: '',
                    email: '',
                    username: '',
                    password: '',
                    role_id: undefined,
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: UserFormData) => {
        await onSubmit(data)
    }

    // Helper for emulate FormItem
    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit User Profile' : 'Create New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update user information and access controls.'
                            : 'Add a new user to the system. They will receive an email with login details.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                        {/* Identity Section */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="fullname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.fullname?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Account Section */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} />
                                        </FormControl>
                                        <p className="text-[10px] text-gray-500">Used for login identification.</p>
                                        <FormMessage>{form.formState.errors.username?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="role_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Access</FormLabel>
                                        <Select
                                            onValueChange={(val: string) => field.onChange(parseInt(val, 10))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Admin</SelectItem>
                                                <SelectItem value="2">Teacher</SelectItem>
                                                <SelectItem value="3">Student</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage>{form.formState.errors.role_id?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Security Section */}
                        <div className="rounded-md bg-gray-50 p-4 border border-gray-100">
                            <Controller
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            Password
                                            {initialData && <span className="text-xs font-normal text-gray-500">(Optional for update)</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={initialData ? "Leave empty to keep current password" : "Create a strong password"}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        {!initialData && <p className="text-[10px] text-gray-500">Must be at least 6 characters.</p>}
                                        <FormMessage>{form.formState.errors.password?.message}</FormMessage>
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
                                {initialData ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
