import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import ExamStore, { Exam } from '@/store/exam/Exam'

interface ExamContextType {
  exams: Exam[]
}

const ExamContext = createContext<ExamContextType | undefined>(undefined)

export const useNews = () => {
  const context = useContext(ExamContext)
  if (!context) {
    throw new Error('useNews must be used within a ExamProvider')
  }
  return context
}

interface ExamProviderProps {
  children: ReactNode
}

export const ExamProvider: React.FC<ExamProviderProps> = ({ children }) => {
  const { exams, getExams } = ExamStore()

  useEffect(() => {
    //   getSavedExams()
    getExams(`/competitions/exams/?page_size=20&page=1&ordering=-createdAt`)
  }, [])

  return (
    <ExamContext.Provider
      value={{
        exams,
      }}
    >
      {children}
    </ExamContext.Provider>
  )
}
