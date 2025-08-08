interface ContactOptionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export function ContactOption({ 
  icon: Icon, 
  title, 
  description 
}: ContactOptionProps): React.ReactElement {
  return (
    <div className="text-center">
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}