import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import ExamStore, { Exam } from '@/store/exam/Exam'
import { AuthStore } from '@/store/AuthStore'
import { Objective } from '@/store/exam/Objective'
import SocketService from '@/store/socket'
import { upsert } from '@/lib/localStorage/db'

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
  const { exams, getSavedExams } = ExamStore()
  const socket = SocketService.getSocket()
  const { bioUser } = AuthStore()

  useEffect(() => {
    if (exams.length === 0) {
      getSavedExams()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    if (bioUser) {
      socket.on(`test_${bioUser._id}`, (data: { paper: Objective }) => {
        if (data.paper) {
          upsert('last_questions', data.paper)
        }
      })
    }

    return () => {
      socket.off(`test_${bioUser?._id}`)
    }
  }, [bioUser?._id, socket])

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
