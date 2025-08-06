import { Eye, EyeOff, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordField {
  value: string
  visible: boolean
}

interface PasswordInputProps {
  id: string
  label: string
  placeholder: string
  field: PasswordField
  onValueChange: (value: string) => void
  onToggleVisibility: () => void
  isLoading: boolean
  note?: string
}

export function PasswordInput({
  id,
  label,
  placeholder,
  field,
  onValueChange,
  onToggleVisibility,
  isLoading,
  note,
}: PasswordInputProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={field.visible ? 'text' : 'password'}
          value={field.value}
          onChange={(e): void => onValueChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={isLoading}
          required
        />
        <Button
          variant="ghost"
          type="button"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onToggleVisibility}
          disabled={isLoading}
        >
          {field.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {Boolean(note) && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}
