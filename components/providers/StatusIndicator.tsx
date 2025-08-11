/**
 * Status Indicator Component
 *
 * Visual status indicator for providers with color-coded dots and animations.
 */

type StatusType = 'active' | 'inactive' | 'error' | 'pending'

interface StatusConfig {
  color: string
  pulseColor: string
  label: string
  shouldPulse: boolean
}

interface StatusIndicatorProps {
  status: StatusType
  className?: string
  showLabel?: boolean
}

// Move helper function to outer scope for better performance
function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'active': {
      return {
        color: 'bg-green-500',
        pulseColor: 'bg-green-400',
        label: 'Active',
        shouldPulse: true,
      }
    }
    case 'pending': {
      return {
        color: 'bg-yellow-500',
        pulseColor: 'bg-yellow-400',
        label: 'Configuring',
        shouldPulse: true,
      }
    }
    case 'error': {
      return {
        color: 'bg-red-500',
        pulseColor: 'bg-red-400',
        label: 'Error',
        shouldPulse: false,
      }
    }
    case 'inactive': {
      return {
        color: 'bg-gray-400 dark:bg-gray-600',
        pulseColor: 'bg-gray-300',
        label: 'Inactive',
        shouldPulse: false,
      }
    }
    default: {
      return {
        color: 'bg-gray-400',
        pulseColor: 'bg-gray-300',
        label: 'Unknown',
        shouldPulse: false,
      }
    }
  }
}

export function StatusIndicator({
  status,
  className = '',
  showLabel = false,
}: StatusIndicatorProps): JSX.Element {
  const config = getStatusConfig(status)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        {Boolean(config.shouldPulse) && (
          <div
            className={`absolute top-0 left-0 w-3 h-3 rounded-full ${config.pulseColor} animate-ping opacity-75`}
          />
        )}
      </div>

      {Boolean(showLabel) && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</span>
      )}
    </div>
  )
}
