import { Card, CardContent } from '@/components/ui/card'

interface PermissionDeniedProps {
  message: string
  userRole?: string
}

export function PermissionDenied({ message, userRole }: PermissionDeniedProps): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">{message}</p>
          {userRole !== null && userRole !== undefined && userRole !== '' && (
            <p className="text-sm text-muted-foreground">Role atual: {userRole}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
