import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AdminLayout } from '@/components/layout/admin-layout'

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AdminLayout>
  )
}
