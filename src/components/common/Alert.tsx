import { type ReactNode } from 'react'

export type AlertVariant = 'error' | 'success' | 'info' | 'warning'

export interface AlertProps {
  /** The alert message to display */
  message: string | ReactNode
  /** The variant/type of alert (error, success, info, warning) */
  variant?: AlertVariant
  /** Optional icon to display (if not provided, default icon for variant will be used) */
  icon?: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Whether to show the default icon */
  showIcon?: boolean
  /** Callback when alert is dismissed (if provided, close button will be shown) */
  onDismiss?: () => void
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const iconColors: Record<AlertVariant, string> = {
  error: 'text-red-600',
  success: 'text-green-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
}

const defaultIcons: Record<AlertVariant, ReactNode> = {
  error: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
}

export const Alert = ({
  message,
  variant = 'error',
  icon,
  className = '',
  showIcon = true,
  onDismiss,
}: AlertProps) => {
  const styles = variantStyles[variant]
  const iconColor = iconColors[variant]
  const displayIcon = icon || defaultIcons[variant]

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${styles} ${className}`}>
      {showIcon && <span className={iconColor}>{displayIcon}</span>}
      <div className="flex-1 text-sm">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${iconColor} hover:opacity-70 transition-opacity shrink-0`}
          aria-label="Dismiss alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
