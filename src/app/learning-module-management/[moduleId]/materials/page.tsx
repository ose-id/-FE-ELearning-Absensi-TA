'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Search, Loader2, FileText, Edit, Trash2, X, Upload, Paperclip, AlignLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { learningModuleService } from '@/services/learning-module.service'
import { materialService } from '@/services/material.service'
import { LearningModule } from '@/types/learning-module'
import { Material } from '@/types/material'

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback
    return fallback
}

export default function ModuleMaterialsPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const moduleId = parseInt(params.moduleId as string)

    const [module, setModule] = useState<LearningModule | null>(null)
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [filePath, setFilePath] = useState('')
    const [fileName, setFileName] = useState('')
    const [fileType, setFileType] = useState('')
    const [selectedFile, setSelectedFile] = useState<{ name: string; size?: number; type: string } | null>(null)

    useEffect(() => {
        if (session?.accessToken) {
            fetchModule()
            fetchMaterials()
        }
    }, [session?.accessToken, moduleId])

    const fetchModule = async () => {
        if (!session?.accessToken) return
        try {
            const teacherId = parseInt(session.user?.id || '0')
            const response = await learningModuleService.getAllLearningModules(
                session.accessToken,
                1,
                100,
                undefined,
                teacherId
            )
            const foundModule = response.data.find(m => m.nid === moduleId)
            setModule(foundModule || null)
        } catch (error) {
            console.error('Failed to fetch module:', error)
        }
    }

    const fetchMaterials = async () => {
        if (!session?.accessToken) return
        try {
            setLoading(true)
            const response = await materialService.getMaterialsByLearningModule(moduleId, session.accessToken)
            setMaterials(response.data)
        } catch (error) {
            console.error('Failed to fetch materials:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'file'
            setSelectedFile({
                name: file.name,
                size: file.size,
                type: ext
            })
            setFileName(file.name)
            
            // Map file extension to backend allowed file types: "document", "video", "presentation", "other"
            let backendFileType = 'other'
            if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv'].includes(ext)) {
                backendFileType = 'document'
            } else if (['ppt', 'pptx'].includes(ext)) {
                backendFileType = 'presentation'
            } else if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) {
                backendFileType = 'video'
            }
            setFileType(backendFileType)
            
            // Simulasikan file path di server untuk disimpan ke backend
            setFilePath(`/uploads/materials/${Date.now()}_${file.name}`)
        }
    }

    const handleCreate = () => {
        setEditingMaterial(null)
        setTitle('')
        setDescription('')
        setFilePath('')
        setFileName('')
        setFileType('')
        setSelectedFile(null)
        setIsFormOpen(true)
    }

    const handleEdit = (material: Material) => {
        setEditingMaterial(material)
        setTitle(material.vtitle)
        setDescription(material.vdescription || '')
        setFilePath(material.vfile_path || '')
        setFileName(material.vfile_name || '')
        setFileType(material.vfile_type || '')
        if (material.vfile_name) {
            setSelectedFile({
                name: material.vfile_name,
                type: material.vfile_type || 'file'
            })
        } else {
            setSelectedFile(null)
        }
        setIsFormOpen(true)
    }

    const handleDelete = async (material: Material) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus materi "${material.vtitle}"?`)) return
        if (!session?.accessToken) return

        try {
            await materialService.deleteMaterial(material.nid, session.accessToken)
            toast.success('Materi berhasil dihapus')
            fetchMaterials()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menghapus materi'))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session?.accessToken) return

        try {
            setIsSubmitting(true)
            if (editingMaterial) {
                await materialService.updateMaterial(
                    editingMaterial.nid,
                    {
                        Title: title,
                        Description: description,
                        FilePath: filePath || undefined,
                        FileName: fileName || undefined,
                        FileType: fileType || undefined,
                        Status: editingMaterial.nstatus,
                    },
                    session.accessToken
                )
                toast.success('Materi berhasil diperbarui')
            } else {
                await materialService.createMaterial(
                    {
                        Title: title,
                        Description: description,
                        LearningModuleId: moduleId,
                        FilePath: filePath || undefined,
                        FileName: fileName || undefined,
                        FileType: fileType || undefined,
                    },
                    session.accessToken
                )
                toast.success('Materi berhasil dibuat')
            }
            setIsFormOpen(false)
            fetchMaterials()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Gagal menyimpan materi'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredMaterials = materials.filter(m =>
        m.vtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vdescription?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/learning-module-management/${moduleId}`)}
                            className="p-2 hover:bg-white rounded-lg border border-gray-200"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Materi - {module?.vname || 'Loading...'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Kelola materi pembelajaran
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Materi
                    </Button>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <Input
                            className="flex-1 border-none bg-transparent focus-visible:ring-0"
                            placeholder="Cari materi..."
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

                {/* List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredMaterials.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada materi</p>
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Materi
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material.nid}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-500/5">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 leading-snug">{material.vtitle}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{material.vdescription || 'Tidak ada deskripsi'}</p>
                                            {material.vfile_path && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50 w-fit">
                                                        <Paperclip className="h-3 w-3 text-blue-500" />
                                                        <span className="font-extrabold text-[9px] bg-blue-100 text-blue-700 px-1 rounded">
                                                            {material.vfile_name ? material.vfile_name.split('.').pop()?.toUpperCase() : 'FILE'}
                                                        </span>
                                                        <span className="max-w-[200px] truncate">{material.vfile_name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            material.nstatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {material.nstatus === 1 ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(material)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(material)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-150 transform transition-all duration-300 scale-100">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {editingMaterial ? 'Edit Materi' : 'Tambah Materi'}
                                </h2>
                                <button 
                                    onClick={() => setIsFormOpen(false)} 
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Judul Materi
                                    </label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Masukkan judul materi (misal: Chapter 1 - Pengenalan)"
                                        required
                                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Masukkan deskripsi atau instruksi materi..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                                        rows={4}
                                    />
                                </div>
                                
                                {/* Real Interactive File Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        File Materi (Opsional)
                                    </label>
                                    
                                    {selectedFile ? (
                                        <div className="flex items-center justify-between p-4 border border-blue-100 rounded-xl bg-blue-50/50 transition-all duration-300 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                                                        {selectedFile.type} {selectedFile.size ? `• ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile(null)
                                                    setFileName('')
                                                    setFileType('')
                                                    setFilePath('')
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => document.getElementById('file-upload-input')?.click()}
                                            className="border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group hover:shadow-sm"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-50 group-hover:bg-blue-50 rounded-full transition-colors duration-300 mb-2">
                                                    <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    <span className="text-blue-600 group-hover:text-blue-700">Klik untuk memilih file</span>
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 font-medium">
                                                    PDF, DOC, DOCX, PPT, PPTX (Maks. 10MB)
                                                </p>
                                            </div>
                                            <input
                                                id="file-upload-input"
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsFormOpen(false)}
                                        className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Batal
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 px-5 transition-all duration-200"
                                    >
                                        {isSubmitting ? 'Menyimpan...' : (editingMaterial ? 'Simpan' : 'Tambah')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
