import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { MainLayout } from '@/components/layout/main-layout'
import { AuthGuard } from '@/components/providers/auth-guard'

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MainLayout>
        <ErrorBoundary>{children}</ErrorBoundary>
      </MainLayout>
    </AuthGuard>
  )
}
