'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Target, X, Filter } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { schoolTermService, SchoolTerm } from '@/services/school-term.service'
import { academicYearService, AcademicYear } from '@/services/academic-year.service'
import SchoolTermList from './SchoolTermList'
import SchoolTermForm, { SchoolTermFormData } from './SchoolTermForm'

export default function SchoolTermManagementPage() {
    const { data: session } = useSession()
    const [schoolTerms, setSchoolTerms] = useState<SchoolTerm[]>([])
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [academicYearFilter, setAcademicYearFilter] = useState<string>('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedSchoolTerm, setSelectedSchoolTerm] = useState<SchoolTerm | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchSchoolTerms = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const academicYearId = academicYearFilter !== 'All' ? parseInt(academicYearFilter) : undefined
            const response = await schoolTermService.getAllSchoolTerms(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined,
                academicYearId
            )
            setSchoolTerms(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch school terms:', error)
            toast.error(error.message || 'Failed to load school terms')
        } finally {
            setLoading(false)
        }
    }

    const fetchAcademicYears = async () => {
        if (!session?.accessToken) return
        try {
            const response = await academicYearService.getAllAcademicYears(session.accessToken, 1, 100)
            setAcademicYears(response.data)
        } catch (error: any) {
            console.error('Failed to fetch academic years:', error)
        }
    }

    useEffect(() => {
        if (session) {
            fetchSchoolTerms()
            fetchAcademicYears()
        }
    }, [session, currentPage, searchTerm, academicYearFilter])

    const handleCreate = () => {
        setSelectedSchoolTerm(null)
        setIsFormOpen(true)
    }

    const handleEdit = (term: SchoolTerm) => {
        setSelectedSchoolTerm(term)
        setIsFormOpen(true)
    }

    const handleDelete = async (term: SchoolTerm) => {
        if (!confirm(`Are you sure you want to delete school term "${term.vterm_name}"?`)) return

        if (!session?.accessToken) return

        try {
            await schoolTermService.deleteSchoolTerm(term.nid, session.accessToken)
            toast.success('School term deleted successfully')
            fetchSchoolTerms()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete school term')
        }
    }

    const handleFormSubmit = async (data: SchoolTermFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedSchoolTerm) {
                await schoolTermService.updateSchoolTerm(
                    selectedSchoolTerm.nid,
                    {
                        TermName: data.term_name,
                        AcademicYearId: data.academic_year_id,
                    },
                    session.accessToken
                )
                toast.success('School term updated successfully')
            } else {
                await schoolTermService.createSchoolTerm(
                    {
                        TermName: data.term_name,
                        AcademicYearId: data.academic_year_id,
                    },
                    session.accessToken
                )
                toast.success('School term created successfully')
            }

            setIsFormOpen(false)
            fetchSchoolTerms()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save school term')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredSchoolTerms = schoolTerms.filter((term) => {
        if (!searchTerm) return true
        const termSearch = searchTerm.toLowerCase()
        return term.vterm_name?.toLowerCase().includes(termSearch)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            School Term Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage school terms for your institution
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add School Term
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total School Terms</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <Target className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                                <Search className="h-5 w-5 text-gray-500" />
                                <Input
                                    className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="Search school terms..."
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

                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Academic Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Academic Years</SelectItem>
                                        {academicYears.map((year) => (
                                            <SelectItem key={year.nid} value={year.nid.toString()}>
                                                {year.vacademic_year_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading school terms...</p>
                                </div>
                            </div>
                        ) : (
                            <SchoolTermList
                                schoolTerms={filteredSchoolTerms}
                                academicYears={academicYears}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
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

                <SchoolTermForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedSchoolTerm}
                    isSubmitting={isSubmitting}
                    academicYears={academicYears}
                />
            </div>
        </div>
    )
}