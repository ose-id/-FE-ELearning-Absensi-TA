export type Pagination = {
  totalItems: number
  totalPages: number
  currentPage: number
  limit: number
}

export type ApiResponse<T> = {
  status: 'success' | 'error'
  message: string
  data?: T
  pagination?: {
    totalItems: number
    totalPages: number
    currentPage: number
    limit: number
  }
}
