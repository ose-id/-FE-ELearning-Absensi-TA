'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Search, X, Plus, Check, GraduationCap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Card from '@/components/ui/card'
import CardHeader from '@/components/ui/card/card-header'
import CardTitle from '@/components/ui/card/card-title'
import CardDescription from '@/components/ui/card/card-description'
import CardContent from '@/components/ui/card/card-content'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { classService } from '@/services/class.service'
import { lovService } from '@/services/lov.service'
import { Class } from '@/types/class'

export default function ClassCatalogPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<Class[]>([])
    const [enrolledClassIds, setEnrolledClassIds] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)
    const [enrollingClassId, setEnrollingClassId] = useState<number | null>(null)
    const [departments, setDepartments] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [totalRecords, setTotalRecords] = useState(0)
    const [studentNotFound, setStudentNotFound] = useState(false)

    const fetchAvailableClasses = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await classService.getClasses(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setClasses(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch classes:', error)
            toast.error(error.message || 'Failed to load classes')
        } finally {
            setLoading(false)
        }
    }

    const fetchEnrolledClasses = async () => {
        if (!session?.accessToken) return

        try {
            const response = await classService.getEnrolledClasses(
                session.accessToken,
                1,
                100,
                undefined
            )
            const enrolledIds = new Set(response.data.map((cls) => cls.nid))
            setEnrolledClassIds(enrolledIds)
            setStudentNotFound(false)
        } catch (error: any) {
            if (error.message?.includes('Student not found') || error.message?.includes('404')) {
                setStudentNotFound(true)
                setEnrolledClassIds(new Set())
            }
        }
    }

    const fetchDepartments = async () => {
        if (!session?.accessToken) return
        try {
            const response = await lovService.getDepartments(session.accessToken)
            setDepartments(response as any)
        } catch (error: any) {
            console.error('Failed to fetch departments:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchAvailableClasses()
            fetchEnrolledClasses()
            fetchDepartments()
        }
    }, [session, currentPage, searchTerm])

    const handleEnroll = async (classId: number) => {
        if (!session?.accessToken) return

        try {
            setEnrollingClassId(classId)
            await classService.enrollToClass(classId, session.accessToken)
            toast.success('Successfully enrolled in class!')
            setEnrolledClassIds((prev) => new Set([...prev, classId]))
            await fetchEnrolledClasses()
            await fetchAvailableClasses()
        } catch (error: any) {
            console.error('Failed to enroll:', error)
            toast.error(error.message || 'Failed to enroll in class')
        } finally {
            setEnrollingClassId(null)
        }
    }

    const filteredClasses = classes.filter((cls) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return cls.vname?.toLowerCase().includes(term) ||
               cls.vdesc?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    if (loading && classes.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="flex h-[50vh] w-full items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading classes...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        Class Catalog
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Browse and enroll in available classes
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Available Classes</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <BookOpen className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">My Enrollments</p>
                                <p className="text-3xl font-bold text-gray-900">{enrolledClassIds.size}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                                <Check className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {studentNotFound ? (
                                        <span className="text-orange-600">Profile not found</span>
                                    ) : (
                                        <span className="text-green-600">Active</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                                <GraduationCap className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Student Not Found Warning */}
            {studentNotFound && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 flex-shrink-0">
                                <GraduationCap className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-orange-800">Student Profile Not Found</h3>
                                <p className="mt-1 text-sm text-orange-700">
                                    Your student profile does not exist in the class database. Please enroll in a class to automatically create your student profile, or contact your administrator.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search & Class List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Available Classes</CardTitle>
                            <CardDescription>
                                {searchTerm
                                    ? `${filteredClasses.length} result(s) for "${searchTerm}"`
                                    : `Browse all ${totalRecords} available classes`
                                }
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 w-full sm:w-80">
                            <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <Input
                                className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('')
                                        setCurrentPage(1)
                                    }}
                                    className="rounded-full p-1 hover:bg-gray-200 transition-colors flex-shrink-0"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredClasses.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">
                                {searchTerm ? 'No classes found' : 'No classes available'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {searchTerm ? 'Try a different search term' : 'Check back later for new classes'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredClasses.map((cls) => {
                                const isEnrolled = enrolledClassIds.has(cls.nid)
                                const isEnrolling = enrollingClassId === cls.nid

                                return (
                                    <div
                                        key={cls.nid}
                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${isEnrolled ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-blue-400 to-purple-500'}`} />

                                        <div className="flex items-start justify-between mb-4 pl-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                            </div>
                                            {isEnrolled && (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 flex items-center gap-1">
                                                    <Check className="h-3 w-3" />
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3 pl-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                                    {cls.vname}
                                                </h3>
                                                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                    {(() => {
                                                        if (cls.Department?.vdepartment_name) return cls.Department.vdepartment_name;
                                                        const dept = departments.find((d: any) => d.nid === cls.nid_department);
                                                        return dept?.label || dept?.vdepartment_name || `Dept ${cls.nid_department}`;
                                                    })()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                                {cls.vdesc || 'No description available'}
                                            </p>
                                            {cls.term && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <span className="text-xs text-gray-500">Term: {cls.term}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Enroll Button */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 pl-3">
                                            {isEnrolled ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                                    disabled
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Enrolled
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    className="w-full"
                                                    onClick={() => handleEnroll(cls.nid)}
                                                    disabled={isEnrolling}
                                                >
                                                    {isEnrolling ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Enrolling...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Enroll
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {!loading && totalRecords > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}
