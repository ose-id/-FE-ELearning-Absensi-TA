'use client'

import { useMemo } from 'react'
import { Plus, Search, Loader2, BookOpen, X, Copy, Check, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { LearningModule } from '@/types/learning-module'

interface LearningModuleGridProps {
    modules: LearningModule[]
    loading: boolean
    canManage: boolean
    onCreateModule: () => void
    onEditModule: (module: LearningModule) => void
    onDeleteModule: (module: LearningModule) => void
    searchTerm: string
    onSearchChange: (term: string) => void
    copiedToken: string | null
    onCopyToken: (token: string) => void
}

export default function LearningModuleGrid({
    modules,
    loading,
    canManage,
    onCreateModule,
    onEditModule,
    onDeleteModule,
    searchTerm,
    onSearchChange,
    copiedToken,
    onCopyToken,
}: LearningModuleGridProps) {
    const router = useRouter()

    const filteredModules = useMemo(() => {
        if (!searchTerm) return modules
        const term = searchTerm.toLowerCase()
        return modules.filter(m =>
            m.vname?.toLowerCase().includes(term) ||
            m.vdesc?.toLowerCase().includes(term)
        )
    }, [modules, searchTerm])

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        Learning Modules
                    </h1>
                </div>
                {canManage && (
                    <Button onClick={onCreateModule}>
                        <Plus className="mr-2 h-4 w-4" /> Add Module
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard
                    label="Total Modules"
                    value={modules.length}
                    icon={BookOpen}
                    color="blue"
                />
                <StatCard
                    label="Materials"
                    value={0}
                    icon={BookOpen}
                    color="blue"
                />
                <StatCard
                    label="Assignments"
                    value={0}
                    icon={BookOpen}
                    color="green"
                />
                <StatCard
                    label="Quizzes"
                    value={0}
                    icon={BookOpen}
                    color="purple"
                />
                <StatCard
                    label="Exams"
                    value={0}
                    icon={BookOpen}
                    color="red"
                />
            </div>

            {/* Search */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                         <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex-1">
                            <Search className="h-5 w-5 text-gray-500" />
                            <Input
                                className="border-none bg-transparent text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder="Search module..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => onSearchChange('')} className="rounded-full p-1 hover:bg-gray-200">
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredModules.length}</span> modules
                        </p>
                    </div>
                </div>

                {/* Module Grid */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        </div>
                    ) : filteredModules.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">No modules available</p>
                            <p className="text-sm text-gray-500 mt-1">Click "Add Module" to create the first module</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModules.map((module) => {
                                const cls = module.Class || module.class
                                return (
                                    <div
                                        key={module.nid}
                                        onClick={() => router.push(`/learning-module-management/${module.nid}`)}
                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer hover:shadow-lg hover:border-blue-300"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${module.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {module.nstatus === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                                {canManage && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onEditModule(module)
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Module"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onDeleteModule(module)
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Module"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                         <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{module.vname}</h3>
                                        <p className="text-sm text-gray-600 mb-2">Class: {cls?.vname || `Class #${module.nid_class}`}</p>
                                        {module.venrollment_token && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                                <span>Token:</span>
                                                <code className="bg-gray-100 px-1 rounded truncate max-w-[80px]">{module.venrollment_token}</code>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onCopyToken(module.venrollment_token || '')
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                    title="Copy token"
                                                >
                                                    {copiedToken === module.venrollment_token ? (
                                                        <Check className="h-3 w-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-3 w-3 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xs text-blue-600 font-medium">Click for details →</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

interface StatCardProps {
    label: string
    value: number | string
    icon: React.ComponentType<{ className?: string }>
    color: 'blue' | 'green' | 'purple' | 'red'
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        red: 'from-red-500 to-red-600'
    }

    const bgColors = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50',
        red: 'bg-red-50'
    }

    const textColors = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        red: 'text-red-600'
    }

    return (
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors[color]}`} />
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColors[color]}`}>
                    <Icon className={`h-5 w-5 ${textColors[color]}`} />
                </div>
            </div>
        </div>
    )
}
