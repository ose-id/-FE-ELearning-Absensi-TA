import * as React from 'react'

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  return (
    <div className='relative inline-block'>
      {React.Children.map(children, child =>
        React.isValidElement(child) ? React.cloneElement(child, { value, onValueChange } as any) : child
      )}
    </div>
  )
}

export const SelectTrigger: React.FC<SelectTriggerProps & any> = ({ children, className = '', ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm ${className}`}
        {...props}
      >
        {children}
      </button>
      {isOpen &&
        props.children &&
        React.Children.map(props.children, child =>
          React.isValidElement(child) && child.type === SelectContent
            ? React.cloneElement(child, { onClose: () => setIsOpen(false), ...props } as any)
            : null
        )}
    </>
  )
}

export const SelectContent: React.FC<SelectContentProps & any> = ({ children, onClose, onValueChange, value }) => {
  return (
    <div className='absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg'>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onClose, onValueChange, currentValue: value } as any)
          : child
      )}
    </div>
  )
}

export const SelectItem: React.FC<SelectItemProps & any> = ({
  value,
  children,
  onClose,
  onValueChange,
  currentValue
}) => {
  return (
    <div
      className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${currentValue === value ? 'bg-gray-50' : ''}`}
      onClick={() => {
        onValueChange?.(value)
        onClose?.()
      }}
    >
      {children}
    </div>
  )
}

export const SelectValue: React.FC<{ placeholder?: string; value?: string }> = ({ placeholder, value }) => {
  return <span>{value || placeholder}</span>
}
