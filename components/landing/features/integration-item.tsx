import Image from 'next/image'

import { integrationLogos, getImageProps } from '@/lib/images'

interface IntegrationData {
  name: string
  key: string
  color: string
}

interface IntegrationItemProps {
  integration: IntegrationData
  index?: number
}

export function IntegrationItem({ 
  integration
}: IntegrationItemProps): React.ReactElement {
  const logoConfig = integrationLogos[integration.key as keyof typeof integrationLogos]
  
  return (
    <div className="group">
      <div className="h-14 w-14 mx-auto bg-card border border-border rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
        {logoConfig !== undefined && logoConfig !== null ? (
          <Image
            {...getImageProps(logoConfig, 40, 40)}
            width={40}
            height={40}
            className="rounded-md object-contain"
            alt={`${integration.name} logo`}
          />
        ) : (
          <div className={`h-10 w-10 ${integration.color} rounded flex items-center justify-center text-white font-bold text-xs`}>
            {integration.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {integration.name}
      </p>
    </div>
  )
}