import { Quiz, QuizQuestion, StudentQuizAttempt, CreateQuizRequest, UpdateQuizRequest, CreateQuestionRequest, UpdateQuestionRequest } from '@/types/quiz'

const QUIZ_API_URL = process.env.NEXT_PUBLIC_ASSIGNMENT_API_URL || process.env.ASSIGNMENT_API_URL || 'https://localhost:5005'

class QuizService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${QUIZ_API_URL}/api/Quiz`
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        console.log(`[QuizService] Fetching: ${url}`)

        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            })

            console.log(`[QuizService] Response status: ${res.status} ${res.statusText}`)

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                console.error(`[QuizService] Error response:`, errorData)
                throw new Error(errorData.message?.message || errorData.title || errorData.message || `API request failed (${res.status})`)
            }
            return res.json()
        } catch (error: unknown) {
            console.error(`[QuizService] Network error:`, error)
            const err = error as Error
            if (err && err.name === 'TypeError' && err.message.includes('fetch')) {
                throw new Error('Quiz service tidak tersedia. Pastikan service sedang running.')
            }
            throw error
        }
    }

    // Quiz CRUD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapQuiz(raw: any): Quiz {
        return {
            nid: raw.nid,
            vtitle: raw.vtitle || '',
            vdesc: raw.vdescription ?? raw.vdesc ?? raw.vDesc ?? '',
            nid_learning_module: raw.nid_learning_module ?? raw.nidLearningModule ?? raw.nid_Learning_Module ?? raw.nIdLearningModule ?? raw.learningModuleId ?? 0,
            nduration: raw.nduration_minutes ?? raw.ndurationMinutes ?? raw.nduration ?? raw.nDurationMinutes ?? raw.nduration_Minutes ?? raw.nDuration_Minutes ?? 0,
            nmax_score: raw.nmax_score ?? raw.nmaxScore ?? raw.nMaxScore ?? 100,
            npassing_score: raw.npassing_score ?? raw.npassingScore ?? raw.nPassingScore ?? raw.npassing_Score ?? 60,
            nstatus: raw.nstatus ?? raw.status ?? raw.nStatus ?? 0,
            nmax_attempts: raw.nmax_attempts ?? raw.nmaxAttempts ?? raw.nMaxAttempts ?? raw.nmax_Attempts ?? 1,
            nshow_results: raw.nshow_results ?? raw.nshowResults ?? raw.nShowResults ?? raw.nShow_Results ?? 1,
            dstart: raw.dstart ?? raw.startDate ?? raw.dStart,
            dend: raw.dend ?? raw.endDate ?? raw.dEnd,
            dcrea: raw.dcrea,
            dmodi: raw.dmodi,
        }
    }

    async getQuizzes(
        token: string,
        params?: { learning_module_id?: number; class_id?: number },
        pageNumber = 1,
        pageSize = 10
    ): Promise<{ data: Quiz[], totalRecords: number }> {
        const urlParams = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        })
        if (params?.learning_module_id) urlParams.append('learning_module_id', params.learning_module_id.toString())
        if (params?.class_id) urlParams.append('class_id', params.class_id.toString())

        const response = await this.fetchWithAuth(`${this.baseUrl}?${urlParams}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const rawData = response.data || []
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: rawData.map((raw: any) => this.mapQuiz(raw)),
            totalRecords: response.totalRecords || 0
        }
    }

    async getQuizById(id: number, token: string): Promise<Quiz | null> {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const raw = Array.isArray(response.data) ? response.data[0] : response.data
            return this.mapQuiz(raw)
        } catch (error) {
            console.error('[QuizService] getQuizById failed:', error)
            return null
        }
    }

    async getQuizzesByModule(learningModuleId: number, token: string): Promise<{ data: Quiz[], totalRecords: number }> {
        // Backend doesn't have direct endpoint, so fetch all and filter client-side
        const response = await this.getQuizzes(token, undefined, 1, 100)
        const filtered = response.data.filter(q => q.nid_learning_module === learningModuleId)
        return {
            data: filtered,
            totalRecords: filtered.length
        }
    }

    async createQuiz(data: CreateQuizRequest, token: string): Promise<Quiz> {
        const showRes = data.ShowResults !== undefined ? data.ShowResults : (data.nshow_results !== undefined ? data.nshow_results : 1)
        const payload = {
            ...data,
            DurationMinutes: data.Duration,
            durationMinutes: data.Duration,
            nduration_minutes: data.Duration,
            ndurationMinutes: data.Duration,
            nDurationMinutes: data.Duration,
            PassingScore: data.PassingScore,
            passingScore: data.PassingScore,
            npassing_score: data.PassingScore,
            npassingScore: data.PassingScore,
            MaxScore: data.MaxScore,
            maxScore: data.MaxScore,
            nmax_score: data.MaxScore,
            nmaxScore: data.MaxScore,
            Status: data.Status,
            status: data.Status,
            nstatus: data.Status,
            ShowResults: showRes,
            showResults: showRes,
            nshow_results: showRes,
            nshowResults: showRes,
            nShowResults: showRes,
            StartAt: data.StartDate,
            startAt: data.StartDate,
            EndAt: data.EndDate,
            endAt: data.EndDate,
        }
        const response = await this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        })
        const raw = Array.isArray(response.data) ? response.data[0] : response.data
        return this.mapQuiz(raw)
    }

    async updateQuiz(id: number, data: UpdateQuizRequest, token: string): Promise<Quiz> {
        const showRes = data.ShowResults !== undefined ? data.ShowResults : (data.nshow_results !== undefined ? data.nshow_results : 1)
        const payload = {
            ...data,
            DurationMinutes: data.Duration,
            durationMinutes: data.Duration,
            nduration_minutes: data.Duration,
            ndurationMinutes: data.Duration,
            nDurationMinutes: data.Duration,
            PassingScore: data.PassingScore,
            passingScore: data.PassingScore,
            npassing_score: data.PassingScore,
            npassingScore: data.PassingScore,
            MaxScore: data.MaxScore,
            maxScore: data.MaxScore,
            nmax_score: data.MaxScore,
            nmaxScore: data.MaxScore,
            Status: data.Status,
            status: data.Status,
            nstatus: data.Status,
            ShowResults: showRes,
            showResults: showRes,
            nshow_results: showRes,
            nshowResults: showRes,
            nShowResults: showRes,
            StartAt: data.StartDate,
            startAt: data.StartDate,
            EndAt: data.EndDate,
            endAt: data.EndDate,
        }
        const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
        })
        const raw = Array.isArray(response.data) ? response.data[0] : response.data
        return this.mapQuiz(raw)
    }

    async deleteQuiz(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // Questions CRUD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapQuestion(raw: any): QuizQuestion {
        return {
            nid: raw.nid,
            nid_quiz: raw.nid_quiz,
            norder: raw.norder || 0,
            vquestion: raw.vquestion || '',
            vtype: raw.vtype || 'multiple_choice',
            npoints: raw.npoints || 1,
            vanswer_key: raw.vanswer || raw.vanswer_key || '',
            voptions: (() => {
                const opt = raw.options ?? raw.joptions ?? raw.voptions ?? raw.jOptions ?? raw.vOptions;
                if (!opt) return undefined;
                return typeof opt === 'string' ? opt : JSON.stringify(opt);
            })(),
            dcrea: raw.dcrea,
            dmodi: raw.dmodi,
        }
    }

    async getQuestions(quizId: number, token: string): Promise<{ data: QuizQuestion[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/questions`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const rawData = response.data || []
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: rawData.map((raw: any) => this.mapQuestion(raw)),
            totalRecords: response.totalRecords || rawData.length
        }
    }

    async createQuestion(data: CreateQuestionRequest, token: string): Promise<QuizQuestion> {
        const quizId = data.QuizId;
        const opts = data.Options ? (typeof data.Options === 'string' ? JSON.parse(data.Options) : data.Options) : undefined;
        const backendData = {
            Question: data.Question,
            Type: data.Type,
            Points: data.Points || 1,
            Order: data.Order || 1,
            Answer: data.AnswerKey,
            AnswerKey: data.AnswerKey,
            Options: opts,
            Joptions: opts,
            joptions: opts
        }

        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/questions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(backendData),
        })
        return response.data[0]
    }

    async updateQuestion(id: number, data: UpdateQuestionRequest, token: string): Promise<QuizQuestion> {
        const opts = data.Options ? (typeof data.Options === 'string' ? JSON.parse(data.Options) : data.Options) : undefined;
        const backendData = {
            Order: data.Order,
            Question: data.Question,
            Type: data.Type,
            Points: data.Points,
            AnswerKey: data.AnswerKey,
            Answer: data.AnswerKey,
            Options: opts,
            Joptions: opts,
            joptions: opts
        }
        const response = await this.fetchWithAuth(`${this.baseUrl}/questions/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(backendData),
        })
        return response.data[0]
    }

    async deleteQuestion(id: number, token: string): Promise<void> {
        await this.fetchWithAuth(`${this.baseUrl}/questions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    // Student Attempts
    async getAttempts(quizId: number, token: string): Promise<{ data: StudentQuizAttempt[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/attempts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async getStudentAttempts(studentId: number, token: string): Promise<{ data: StudentQuizAttempt[], totalRecords: number }> {
        const response = await this.fetchWithAuth(`${QUIZ_API_URL}/api/StudentQuizAttempt/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return {
            data: response.data || [],
            totalRecords: response.totalRecords || 0
        }
    }

    async submitQuizAttempt(quizId: number, data: {
        AnswerCount: number
        StartAt: string
        FinishAt: string
        Score: number
        Percentage: number
    }, token: string): Promise<unknown> {
        const response = await this.fetchWithAuth(`${this.baseUrl}/${quizId}/attempt`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(data),
        })
        return response
    }
}

export const quizService = new QuizService()
