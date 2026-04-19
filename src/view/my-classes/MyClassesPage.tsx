'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Users, GraduationCap, Search, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { classService } from '@/services/class.service'
import { Class } from '@/types/class'

export default function MyClassesPage() {
    const { data: session } = useSession()
    const [classes, setClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [totalRecords, setTotalRecords] = useState(0)

    const fetchEnrolledClasses = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await classService.getEnrolledClasses(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setClasses(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            if (error.message?.includes('Student not found') || error.message?.includes('404')) {
                setClasses([])
                setTotalRecords(0)
            } else {
                console.error('Failed to fetch enrolled classes:', error)
                toast.error(error.message || 'Failed to load your classes')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchEnrolledClasses()
        }
    }, [session, currentPage, searchTerm])

    const filteredClasses = classes.filter((cls) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return cls.vname?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        My Classes
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Classes you are enrolled in
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Enrolled Classes</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <BookOpen className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <Search className="h-5 w-5 text-gray-500" />
                            <Input
                                className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder="Search your classes..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="rounded-full p-1 hover:bg-gray-200 transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading your classes...</p>
                                </div>
                            </div>
                        ) : filteredClasses.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">
                                    {searchTerm ? 'No classes found' : 'You have not enrolled in any classes yet'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {searchTerm ? 'Try a different search term' : 'Ask your teacher or admin to enroll you'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClasses.map((cls) => (
                                    <div
                                        key={cls.nid}
                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                                    {cls.vname}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {cls.Department?.vdepartment_name || 'No department'}
                                                </p>
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {!loading && totalRecords > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    )
}
