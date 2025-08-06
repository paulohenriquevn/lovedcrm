import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Input field component
export function InputField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  note,
}: {
  label: string
  type?: string
  value: string
  onChange?: (value: string) => void
  disabled?: boolean
  note?: string
}): JSX.Element {
  const fieldId = `input-${label.toLowerCase().replaceAll(/\s+/g, '-')}`

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        disabled={disabled}
      />
      {Boolean(note) && <p className="mt-1 text-xs text-gray-500">{note}</p>}
    </div>
  )
}

// Select field component
export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}): JSX.Element {
  const fieldId = `select-${label.toLowerCase().replaceAll(/\s+/g, '-')}`

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={fieldId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
