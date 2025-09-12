import React from 'react'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive'
  className?: string
  onClick?: () => void
}

export default function FigmaCard({ 
  children, 
  variant = 'default',
  className = '',
  onClick
}: CardProps) {
  const baseClasses = 'figma-card'
  
  const variantClasses = {
    default: '',
    elevated: 'shadow-lg',
    interactive: 'cursor-pointer hover:shadow-lg transition-shadow duration-200'
  }
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}


