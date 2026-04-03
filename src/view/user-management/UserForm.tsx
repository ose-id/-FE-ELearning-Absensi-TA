
'use client'

import { useEffect, useState } from 'react'
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
    GraduationCap,
    ArrowRight,
    ArrowLeft
} from 'lucide-react'
import { useSession } from 'next-auth/react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'

import Dialog from '@/components/ui/dialog'
import DialogContent from '@/components/ui/dialog/dialog-content'
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
import { Role } from '@/types/role'
import { roleService } from '@/services/role.service'
import { Class } from '@/types/class'
import { classService } from '@/services/class.service'

// ── Schema ─────────────────────────────────────────────────────────────────
const userSchema = z.object({
    username:     z.string().min(3, 'Username must be at least 3 characters'),
    email:        z.string().email('Invalid email address'),
    password:     z.string().optional(),
    fullname:     z.string().min(1, 'Full Name is required'),
    birthdate:    z.string().optional(),
    address:      z.string().optional(),
    phone:        z.string().optional(),
    whatsapp:     z.string().optional(),
    // Staff / Teacher
    nik:          z.string().optional(),
    degree:       z.string().optional(),
    // Student
    nis:          z.string().optional(),
    class_name:   z.string().optional(),
    class_id:     z.string().optional(),
    parent_name:  z.string().optional(),
    parent_phone: z.string().optional(),
    // Common
    role:   z.string(),
    status: z.string().optional(),
})

export type UserFormData = z.infer<typeof userSchema>

// ── Tiny layout helper ──────────────────────────────────────────────────────
const FormItem = ({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) => <div className={`space-y-2 ${className ?? ''}`}>{children}</div>

// ── Props ───────────────────────────────────────────────────────────────────
interface UserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: UserFormData) => Promise<void>
    initialData?: User | null
    isSubmitting: boolean
}

// ── Component ───────────────────────────────────────────────────────────────
export default function UserForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
}: UserFormProps) {
    const { data: session } = useSession()

    const [roles,   setRoles]   = useState<Role[]>([])
    const [classes, setClasses] = useState<Class[]>([])
    const [currentStep, setCurrentStep] = useState(1)

    // ── Form ─────────────────────────────────────────────────────────────
    const emptyDefaults: UserFormData = {
        username:     '',
        email:        '',
        password:     '',
        fullname:     '',
        birthdate:    '',
        address:      '',
        phone:        '',
        whatsapp:     '',
        nik:          '',
        degree:       '',
        nis:          '',
        class_name:   '',
        class_id:     '',
        parent_name:  '',
        parent_phone: '',
        role:         '',
        status:       'active',
    }

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: emptyDefaults,
    })

    // ── Role watchers ─────────────────────────────────────────────────────
    const role = form.watch('role')
    const check = (kw: string) => role?.toLowerCase().includes(kw.toLowerCase()) ?? false
    const isStudent = check('student') || check('murid') || check('mr')
    const isTeacher = check('teacher') || check('guru')  || check('gr')
    const isAdmin   = check('admin')   || check('adm')   || check('staff')

    // ── Fetch roles ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!open || !session?.accessToken) return
        const load = async () => {
            try {
                const res = await roleService.getRoles(session.accessToken)
                if (res?.data) setRoles(res.data)
            } catch (e) {
                console.error('Failed to fetch roles', e)
            }
        }
        load()
    }, [open, session])

    // ── Fetch classes (only when student role chosen) ─────────────────────
    useEffect(() => {
        if (!open || !isStudent || !session?.accessToken) return
        const load = async () => {
            try {
                const res = await classService.getClasses(session.accessToken)
                if (res?.data) setClasses(res.data)
            } catch (e) {
                console.error('Failed to fetch classes', e)
            }
        }
        load()
    }, [open, isStudent, session])

    // ── Reset form on open / initialData change ───────────────────────────
    useEffect(() => {
        if (!open) return

        setCurrentStep(initialData ? 2 : 1)

        if (initialData) {
            let roleName = ''
            const found = roles.find(r => r.nid === initialData.role_nid || r.id === initialData.role_nid)
            if (found) {
                roleName = found.vrole_name || found.role_name || ''
            } else {
                if (initialData.role_nid === 1) roleName = 'Admin'
                else if (initialData.role_nid === 2) roleName = 'Guru'
                else if (initialData.role_nid === 3) roleName = 'Murid'
            }
            form.reset({
                username:     initialData.username     || '',
                email:        initialData.email        || '',
                password:     '',
                fullname:     initialData.fullname     || '',
                birthdate:    initialData.birthdate    || '',
                address:      initialData.address      || '',
                phone:        initialData.phone        || '',
                whatsapp:     initialData.whatsapp     || '',
                nik:          initialData.nik          || '',
                degree:       initialData.degree       || '',
                nis:          initialData.nis          || '',
                class_name:   initialData.class_name   || '',
                class_id:     initialData.class_id?.toString() || '',
                parent_name:  initialData.parent_name  || '',
                parent_phone: initialData.parent_phone || '',
                role:         roleName,
                status:       initialData.status       || 'active',
            })
        } else {
            form.reset(emptyDefaults)
        }
    }, [open, initialData, roles])   // eslint-disable-line react-hooks/exhaustive-deps

    // ── Submit ────────────────────────────────────────────────────────────
    // Step 1 -> validate only step-1 fields, then advance
    // Step 2 / Edit -> full submit
    const handleNextOrSubmit = async () => {
        if (!initialData && currentStep === 1) {
            // Only validate the fields that belong to Step 1
            const valid = await form.trigger(['role', 'username', 'email', 'password'])
            if (valid) setCurrentStep(2)
        } else {
            // Trigger full form validation then submit
            const valid = await form.trigger()
            if (valid) {
                try {
                    await onSubmit(form.getValues())
                } catch (e) {
                    console.error('[UserForm] submit error', e)
                }
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    const roleColor = (name?: string) => {
        const n = name?.toLowerCase() ?? ''
        if (n.includes('admin'))   return 'bg-purple-500'
        if (n.includes('guru') || n.includes('teacher')) return 'bg-blue-500'
        if (n.includes('murid') || n.includes('student')) return 'bg-green-500'
        return 'bg-gray-400'
    }

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        {initialData
                            ? 'Edit User Profile'
                            : currentStep === 1
                            ? 'Step 1: Account Access'
                            : 'Step 2: Profile Details'}
                    </DialogTitle>
                    {/* Progress bar */}
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: initialData ? '100%' : currentStep === 1 ? '50%' : '100%' }}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                            {initialData ? 'Step 2 of 2' : `Step ${currentStep} of 2`}
                        </span>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={e => e.preventDefault()} className="space-y-6 mt-4">

                        {/* ── STEP 1: Account & Role ───────────────────────────────── */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">Account Credentials</h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Role */}
                                    <Controller
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role Access *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-blue-50/50">
                                                            <SelectValue placeholder="Select User Role">
                                                                {field.value && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`h-2 w-2 rounded-full ${roleColor(field.value)}`} />
                                                                        <span>{field.value}</span>
                                                                    </div>
                                                                )}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {roles.map((r, i) => (
                                                            <SelectItem
                                                                key={r.nid ?? r.vrole_code ?? i}
                                                                value={r.vrole_name || r.role_name || ''}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full ${roleColor(r.vrole_name || r.role_name)}`} />
                                                                    <span>{r.vrole_name || r.role_name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Username */}
                                    <Controller
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                                        <Input placeholder="username" className="pl-8" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email */}
                                    <Controller
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input placeholder="email@example.com" className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Password */}
                                    <Controller
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password {!initialData && '*'}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="password"
                                                            placeholder={initialData ? 'Unchanged' : 'Secure password'}
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Profile Details ──────────────────────────────── */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">

                                {/* ── Edit mode: Account section ───────── */}
                                {initialData && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                            <Shield className="h-4 w-4 text-purple-600" />
                                            <h3 className="text-sm font-semibold text-gray-900">Account Settings</h3>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {/* Role (editable in edit mode) */}
                                            <Controller
                                                control={form.control}
                                                name="role"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Role Access</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-purple-50/50">
                                                                    <SelectValue placeholder="Select Role">
                                                                        {field.value && (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={`h-2 w-2 rounded-full ${roleColor(field.value)}`} />
                                                                                <span>{field.value}</span>
                                                                            </div>
                                                                        )}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {roles.map((r, i) => (
                                                                    <SelectItem
                                                                        key={r.nid ?? r.vrole_code ?? i}
                                                                        value={r.vrole_name || r.role_name || ''}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`h-2 w-2 rounded-full ${roleColor(r.vrole_name || r.role_name)}`} />
                                                                            <span>{r.vrole_name || r.role_name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Username */}
                                            <Controller
                                                control={form.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Username</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                                                <Input placeholder="username" className="pl-8" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900">Personal &amp; Profile Details</h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Full Name */}
                                    <Controller
                                        control={form.control}
                                        name="fullname"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Full Name *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input placeholder="e.g. Budi Santoso" className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Status */}
                                    <Controller
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || 'active'}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-gray-50/50">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Birth Date */}
                                    <Controller
                                        control={form.control}
                                        name="birthdate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Birth Date</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input type="date" className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* ── Admin / Teacher fields ─────────── */}
                                    {(isAdmin || isTeacher) && (
                                        <>
                                            {/* NIP */}
                                            <Controller
                                                control={form.control}
                                                name="nik"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{isAdmin ? 'NIP / NIK' : 'NIP (Teacher ID)'}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input className="pl-10" placeholder="ID Number" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Degree */}
                                            <Controller
                                                control={form.control}
                                                name="degree"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Degree (Gelar)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input className="pl-10" placeholder="e.g. S.Pd, M.Kom" {...field} />
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    {/* ── Student fields ─────────────────── */}
                                    {isStudent && (
                                        <>
                                            {/* NIS */}
                                            <Controller
                                                control={form.control}
                                                name="nis"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>NIS (Student ID)</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input className="pl-10" placeholder="NIS Number" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Class selector */}
                                            <Controller
                                                control={form.control}
                                                name="class_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Class *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-gray-50/50">
                                                                    <SelectValue placeholder="Select Class" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {classes.map(cls => (
                                                                    <SelectItem key={cls.nid} value={cls.nid.toString()}>
                                                                        {cls.vname}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Parent Name */}
                                            <Controller
                                                control={form.control}
                                                name="parent_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Parent Name</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input className="pl-10" placeholder="Father / Mother name" {...field} />
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Parent Phone */}
                                            <Controller
                                                control={form.control}
                                                name="parent_phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Parent Phone</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input className="pl-10" placeholder="+62..." {...field} />
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    {/* Phone */}
                                    <Controller
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input className="pl-10" placeholder="+62..." {...field} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* WhatsApp */}
                                    <Controller
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input className="pl-10" placeholder="+62..." {...field} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Address – full width */}
                                <Controller
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Textarea className="pl-10 min-h-[80px]" placeholder="Complete address" {...field} />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* ── Footer ───────────────────────────────────────────────── */}
                        <DialogFooter className="mt-6 pt-4 border-t border-gray-100 flex justify-between gap-2">
                            <div className="flex gap-2">
                                {currentStep === 2 && !initialData && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setCurrentStep(1)}
                                        disabled={isSubmitting}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNextOrSubmit}
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : initialData ? (
                                        'Save Changes'
                                    ) : currentStep === 1 ? (
                                        <> Next <ArrowRight className="ml-2 h-4 w-4" /> </>
                                    ) : (
                                        'Create User'
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
