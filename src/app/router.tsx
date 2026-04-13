import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './views/Layout'
import { HomePage } from './views/HomePage'
import { BankPage } from './views/BankPage'
import { QuestionPage } from './views/QuestionPage'
import { MockSetupPage } from './views/MockSetupPage'
import { MockSessionPage } from './views/MockSessionPage'
import { ProgressPage } from './views/ProgressPage'
import { AboutPage } from './views/AboutPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/bank" element={<BankPage />} />
        <Route path="/q/:id" element={<QuestionPage />} />
        <Route path="/mock" element={<MockSetupPage />} />
        <Route path="/mock/session/:id" element={<MockSessionPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

