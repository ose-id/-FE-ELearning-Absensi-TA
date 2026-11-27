'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Search, X, Plus, Check, Key } from 'lucide-react'
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
import { learningModuleService } from '@/services/learning-module.service'
import { LearningModule } from '@/types/learning-module'
import EnrollModuleDialog from '@/view/learning-module-management/EnrollModuleDialog'

export default function ClassCatalogPage() {
    const { data: session } = useSession()
    const [modules, setModules] = useState<LearningModule[]>([])
    const [enrolledModuleIds, setEnrolledModuleIds] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)
    const [enrollingModuleId, setEnrollingModuleId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [totalRecords, setTotalRecords] = useState(0)
    const [studentNotFound, setStudentNotFound] = useState(false)
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
    const [isManualEnrolling, setIsManualEnrolling] = useState(false)

    const fetchAvailableModules = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setModules(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error) {
            console.error('Failed to fetch learning modules:', error)
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to load learning modules')
        } finally {
            setLoading(false)
        }
    }

    const fetchEnrolledModules = async () => {
        if (!session?.accessToken) return

        try {
            const response = await learningModuleService.getEnrolledLearningModules(
                session.accessToken,
                1,
                100,
                undefined
            )
            const enrolledIds = new Set(response.data.map((mod) => mod.nid))
            setEnrolledModuleIds(enrolledIds)
            setStudentNotFound(false)
        } catch (error) {
            const err = error as { message?: string }
            if (err.message?.includes('Student not found') || err.message?.includes('404')) {
                setStudentNotFound(true)
                setEnrolledModuleIds(new Set())
            }
        }
    }

    useEffect(() => {
        if (session?.accessToken) {
            fetchAvailableModules()
            fetchEnrolledModules()
        }
    }, [session?.accessToken, currentPage, searchTerm])

    const handleEnroll = async (module: LearningModule) => {
        if (!session?.accessToken) return

        const token = module.venrollment_token
        if (!token) {
            toast.error('Token enrollment tidak ditemukan untuk modul ini.')
            return
        }

        setEnrollingModuleId(module.nid)
        try {
            await learningModuleService.enrollToLearningModule(
                { EnrollmentToken: token },
                session.accessToken
            )
            toast.success('Berhasil enroll ke learning module!')
            fetchEnrolledModules()
        } catch (error) {
            console.error('Failed to enroll:', error)
            const err = error as { message?: string }
            toast.error(err.message || 'Gagal enroll')
        } finally {
            setEnrollingModuleId(null)
        }
    }

    const handleManualEnroll = async (token: string) => {
        if (!session?.accessToken) return

        try {
            setIsManualEnrolling(true)
            await learningModuleService.enrollToLearningModule(
                { EnrollmentToken: token },
                session.accessToken
            )
            toast.success('Berhasil enroll ke learning module!')
            setIsEnrollDialogOpen(false)
            fetchAvailableModules()
            fetchEnrolledModules()
        } catch (error) {
            console.error(error)
            const err = error as { message?: string }
            toast.error(err.message || 'Gagal enroll')
            throw error
        } finally {
            setIsManualEnrolling(false)
        }
    }

    const filteredModules = modules.filter((mod) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return mod.vname?.toLowerCase().includes(term) ||
               mod.vdesc?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    if (loading && modules.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
                <div className="flex h-[50vh] w-full items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading learning modules...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Learning Module</h1>
                        <p className="text-gray-500">Pilih dan enroll learning module yang tersedia</p>
                    </div>
                    <Button onClick={() => setIsEnrollDialogOpen(true)} className="bg-green-600 hover:bg-green-700 w-fit">
                        <Key className="mr-2 h-4 w-4" />
                        Enroll with Token
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Module</CardDescription>
                            <CardTitle className="text-3xl">{totalRecords}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Module Tersedia</CardDescription>
                            <CardTitle className="text-3xl">{filteredModules.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Terdaftar</CardDescription>
                            <CardTitle className="text-3xl">{enrolledModuleIds.size}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari learning module..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')}>
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Modules Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredModules.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Belum ada learning module tersedia</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {filteredModules.map((module) => {
                                const isEnrolled = enrolledModuleIds.has(module.nid)
                                const isEnrolling = enrollingModuleId === module.nid
                                const moduleClass = module.Class || module.class
                                const moduleSubject = module.Subject || module.subject

                                const subjectName = moduleSubject
                                    ? (moduleSubject.vsubject_name || (moduleSubject as { vname?: string }).vname || '-')
                                    : '-'

                                const className = moduleClass
                                    ? (moduleClass.vname || (moduleClass as { vclass_name?: string }).vclass_name || '-')
                                    : '-'

                                return (
                                    <Card key={module.nid} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    module.nstatus === 1
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {module.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                            <CardTitle className="mt-4 line-clamp-2">{module.vname}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {module.vdesc || 'Tidak ada deskripsi'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                    <span>Subject:</span>
                                                    <span className="font-medium">
                                                        {subjectName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                    <span>Class:</span>
                                                    <span className="font-medium">
                                                        {className}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                {isEnrolled ? (
                                                    <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                                                        <Check className="mr-2 h-4 w-4" /> Terdaftar
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleEnroll(module)}
                                                        disabled={isEnrolling}
                                                        className="w-full"
                                                    >
                                                        {isEnrolling ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="mr-2 h-4 w-4" /> Enroll
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}

                <EnrollModuleDialog
                    open={isEnrollDialogOpen}
                    onOpenChange={setIsEnrollDialogOpen}
                    onEnroll={handleManualEnroll}
                    isEnrolling={isManualEnrolling}
                />
            </div>
        </div>
    )
}
