import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

interface QuietHoursSettingsProps {
  quietHours: boolean
  quietStart: string
  quietEnd: string
  onToggleQuietHours: (checked: boolean) => void
  onUpdateTime: (setting: string, value: string) => void
}

export function QuietHoursSettings({
  quietHours,
  quietStart,
  quietEnd,
  onToggleQuietHours,
  onUpdateTime,
}: QuietHoursSettingsProps): JSX.Element {
  return (
    <>
      <Separator className="my-6" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label className="font-medium">Horário Silencioso</Label>
          <p className="text-muted-foreground">
            Não receber notificações push durante este período
          </p>
        </div>
        <Switch checked={quietHours} onCheckedChange={onToggleQuietHours} />
      </div>

      {Boolean(quietHours) && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quietStart" className="text-xs">
              De:
            </Label>
            <input
              id="quietStart"
              type="time"
              value={quietStart}
              onChange={(e): void => onUpdateTime('quietStart', e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="quietEnd" className="text-xs">
              Até:
            </Label>
            <input
              id="quietEnd"
              type="time"
              value={quietEnd}
              onChange={(e): void => onUpdateTime('quietEnd', e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </>
  )
}
