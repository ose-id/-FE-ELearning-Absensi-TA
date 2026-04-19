'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Calendar, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Pagination from '@/components/ui/pagination'
import { academicYearService, AcademicYear } from '@/services/academic-year.service'
import AcademicYearList from './AcademicYearList'
import AcademicYearForm, { AcademicYearFormData } from './AcademicYearForm'

export default function AcademicYearManagementPage() {
    const { data: session } = useSession()
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchAcademicYears = async () => {
        if (!session?.accessToken) return

        try {
            setLoading(true)
            const response = await academicYearService.getAllAcademicYears(
                session.accessToken,
                currentPage,
                itemsPerPage,
                searchTerm || undefined
            )
            setAcademicYears(response.data)
            setTotalRecords(response.totalRecords)
        } catch (error: any) {
            console.error('Failed to fetch academic years:', error)
            toast.error(error.message || 'Failed to load academic years')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchAcademicYears()
        }
    }, [session, currentPage, searchTerm])

    const handleCreate = () => {
        setSelectedAcademicYear(null)
        setIsFormOpen(true)
    }

    const handleEdit = (year: AcademicYear) => {
        setSelectedAcademicYear(year)
        setIsFormOpen(true)
    }

    const handleDelete = async (year: AcademicYear) => {
        if (!confirm(`Are you sure you want to delete academic year "${year.vacademic_year_name}"?`)) return

        if (!session?.accessToken) return

        try {
            await academicYearService.deleteAcademicYear(year.nid, session.accessToken)
            toast.success('Academic year deleted successfully')
            fetchAcademicYears()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete academic year')
        }
    }

    const handleFormSubmit = async (data: AcademicYearFormData) => {
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)

            if (selectedAcademicYear) {
                await academicYearService.updateAcademicYear(
                    selectedAcademicYear.nid,
                    {
                        AcademicYearName: data.academic_year_name,
                        StartDate: data.start_date,
                        EndDate: data.end_date,
                    },
                    session.accessToken
                )
                toast.success('Academic year updated successfully')
            } else {
                await academicYearService.createAcademicYear(
                    {
                        AcademicYearName: data.academic_year_name,
                        StartDate: data.start_date,
                        EndDate: data.end_date,
                    },
                    session.accessToken
                )
                toast.success('Academic year created successfully')
            }

            setIsFormOpen(false)
            fetchAcademicYears()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save academic year')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredAcademicYears = academicYears.filter((year) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return year.vacademic_year_name?.toLowerCase().includes(term)
    })

    const totalPages = Math.ceil(totalRecords / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                            Academic Year Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage academic years for your institution
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Academic Year
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Academic Years</p>
                                <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <Calendar className="h-7 w-7 text-blue-600" />
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
                                    placeholder="Search academic years..."
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
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{filteredAcademicYears.length}</span> academic years
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading academic years...</p>
                                </div>
                            </div>
                        ) : (
                            <AcademicYearList
                                academicYears={filteredAcademicYears}
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

                <AcademicYearForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    onSubmit={handleFormSubmit}
                    initialData={selectedAcademicYear}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    )
}