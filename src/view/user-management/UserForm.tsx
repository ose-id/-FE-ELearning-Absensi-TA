
'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Loader2,
    User as UserIcon,
    Mail,
    Lock,
    Shield,
    Calendar,
    MapPin,
    Phone,
    MessageCircle,
    CreditCard,
    GraduationCap
} from 'lucide-react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'

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

// Schema now uses 'role' string instead of 'role_id'
const userSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
    fullname: z.string().min(1, 'Full Name is required'),
    birthdate: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    nik: z.string().optional(),
    class_name: z.string().optional(),
    role: z.string("Role is required"),
    status: z.string().optional(),
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
            birthdate: '',
            address: '',
            phone: '',
            whatsapp: '',
            nik: '',
            class_name: '',
            status: 'active',
            role: undefined, // Initialize as undefined
        },
    })

    // Watch 'role' instead of 'role_id'
    const role = form.watch('role')
    const isStudent = role === 'Student'
    const isTeacher = role === 'Teacher'
    const isAdmin = role === 'Admin'

    useEffect(() => {
        if (open) {
            if (initialData) {
                // Map ID to Role Name string
                let roleName = ''
                if (initialData.role_id === 1) roleName = 'Admin'
                else if (initialData.role_id === 2) roleName = 'Teacher'
                else if (initialData.role_id === 3) roleName = 'Student'

                form.reset({
                    fullname: initialData.fullname,
                    email: initialData.email,
                    username: initialData.username,
                    password: '',
                    birthdate: initialData.birthdate || '',
                    address: initialData.address || '',
                    phone: initialData.phone || '',
                    whatsapp: initialData.whatsapp || '',
                    nik: initialData.nik || '',
                    class_name: initialData.class_name || '',
                    role: roleName,
                    status: initialData.status || 'active',
                })
            } else {
                form.reset({
                    fullname: '',
                    email: '',
                    username: '',
                    password: '',
                    birthdate: '',
                    address: '',
                    phone: '',
                    whatsapp: '',
                    nik: '',
                    class_name: '',
                    role: undefined,
                    status: 'active',
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = async (data: UserFormData) => {
        await onSubmit(data)
    }

    // Helper for FormItem
    const FormItem = ({ children }: { children: React.ReactNode }) => (
        <div className="space-y-2">{children}</div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        {initialData ? 'Edit User Profile' : 'Create New User'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {initialData
                            ? 'Update user information and access controls.'
                            : 'Add a new user to the system. Select a role to define required fields.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">

                        {/* SECTION 1: ROLE & ACCOUNT ACCESS (Always Visible) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <h3 className="text-sm font-semibold text-gray-900">Account & Role Access</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Role Selection - Now uses 'role' string value */}
                                <Controller
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">Role Access *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-blue-50/50">
                                                        <SelectValue placeholder="Select User Role">
                                                            {field.value === 'Admin' && <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-purple-500" /><span>Admin</span></div>}
                                                            {field.value === 'Teacher' && <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500" /><span>Teacher</span></div>}
                                                            {field.value === 'Student' && <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /><span>Student</span></div>}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin" textValue="Admin">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                                                            <span>Admin</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="teacher" textValue="Teacher">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                            <span>Teacher</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="student" textValue="Student">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                            <span>Student</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage>{form.formState.errors.role?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="fullname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">Full Name *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder="e.g. John Doe"
                                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.fullname?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">Username *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                                                    <Input
                                                        placeholder="johndoe"
                                                        className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.username?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">Email Address *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder="johndoe@example.com"
                                                        type="email"
                                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">
                                                Password {!initialData && '*'}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder={initialData ? "Unchanged" : "Secure password"}
                                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || 'active'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage>{form.formState.errors.status?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* SECTION 2: PERSONAL DETAILS (Conditional for Student & Teacher) */}
                        {(isStudent || isTeacher) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Personal & Academic Details
                                    </h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Controller
                                        control={form.control}
                                        name="nik"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">
                                                    {isStudent ? 'NIS (Nomor Induk Siswa)' : isTeacher ? 'NIP (Nomor Induk Pegawai)' : 'NIK (ID Number)'}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            placeholder={isStudent ? 'Enter Student ID' : isTeacher ? 'Enter Employee ID' : '16-digit NIK'}
                                                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage>{form.formState.errors.nik?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    <Controller
                                        control={form.control}
                                        name="birthdate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">Birth Date</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="date"
                                                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage>{form.formState.errors.birthdate?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Class Name only for Student */}
                                    {isStudent && (
                                        <Controller
                                            control={form.control}
                                            name="class_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-medium">Class Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                placeholder="e.g. X-RPL-1"
                                                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage>{form.formState.errors.class_name?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <Controller
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-medium">Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Textarea
                                                        placeholder="Complete address"
                                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.address?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* SECTION 3: CONTACT INFO (Conditional for Student & Teacher) */}
                        {(isStudent || isTeacher) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Controller
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">
                                                    {isStudent ? 'Phone Number (Orang Tua)' : 'Phone Number'}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            placeholder={isStudent ? "Parent's Phone Number" : "+62..."}
                                                            type="tel"
                                                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    <Controller
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">
                                                    {isStudent ? 'WhatsApp Number (Orang Tua)' : 'WhatsApp Number'}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            placeholder={isStudent ? "Parent's WhatsApp" : "+62..."}
                                                            type="tel"
                                                            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage>{form.formState.errors.whatsapp?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
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
                                    <>{initialData ? 'Save Changes' : 'Create User'}</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
