'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Search, X, Key, GraduationCap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { learningModuleService } from '@/services/learning-module.service'
import { LearningModule } from '@/types/learning-module'
import EnrollModuleDialog from '@/view/learning-module-management/EnrollModuleDialog'

export default function MyModulesPage() {
    const { data: session } = useSession()
    const [modules, setModules] = useState<LearningModule[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [totalRecords, setTotalRecords] = useState(0)

    // Enroll dialog
    const [isEnrollOpen, setIsEnrollOpen] = useState(false)
    const [isEnrolling, setIsEnrolling] = useState(false)

    const fetchEnrolledModules = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await learningModuleService.getEnrolledLearningModules(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setModules(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch enrolled modules:', error)
            toast.error(error.message || 'Failed to load your modules')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchEnrolledModules()
        }
    }, [session, currentPage, searchTerm])

    const handleEnroll = async (token: string) => {
        if (!session?.accessToken) return

        try {
            setIsEnrolling(true)
            await learningModuleService.enrollToLearningModule(
                { EnrollmentToken: token },
                session.accessToken
            )
            toast.success('Successfully enrolled to module!')
            setIsEnrollOpen(false)
            fetchEnrolledModules()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to enroll')
            throw error
        } finally {
            setIsEnrolling(false)
        }
    }

    const filteredModules = modules.filter((mod) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return mod.vname?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            My Learning Modules
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Learning modules you are enrolled in
                        </p>
                    </div>
                    <Button onClick={() => setIsEnrollOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Key className="mr-2 h-4 w-4" />
                        Enroll with Token
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Enrolled Modules</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                                <BookOpen className="h-7 w-7 text-purple-600" />
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
                                placeholder="Search your modules..."
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
                                    <p className="text-gray-600">Loading your modules...</p>
                                </div>
                            </div>
                        ) : filteredModules.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">
                                    {searchTerm ? 'No modules found' : 'You have not enrolled in any modules yet'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {searchTerm ? 'Try a different search term' : 'Use an enrollment token to join a module'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredModules.map((mod) => (
                                    <div
                                        key={mod.nid}
                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                                                <BookOpen className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                                    {mod.vname}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {mod.Subject?.vsubject_name || 'No subject'}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                                                {mod.vdesc || 'No description available'}
                                            </p>
                                            <div className="pt-3 border-t border-gray-100 space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>Class: {mod.Class?.vname || `Class ${mod.nid_class}`}</span>
                                                </div>
                                                {mod.term && (
                                                    <div className="text-xs text-gray-500">
                                                        Term: {mod.term}
                                                    </div>
                                                )}
                                            </div>
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

                <EnrollModuleDialog
                    open={isEnrollOpen}
                    onOpenChange={setIsEnrollOpen}
                    onEnroll={handleEnroll}
                    isEnrolling={isEnrolling}
                />
            </div>
        </div>
    )
}
