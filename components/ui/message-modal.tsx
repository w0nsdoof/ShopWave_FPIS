import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageModalProps {
  title: string
  description: string | React.ReactNode
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export function MessageModal({
  title,
  description,
  isOpen,
  onClose,
  duration = 30000 // 30 seconds
}: MessageModalProps) {
  const [show, setShow] = useState(isOpen)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    console.log('Modal state changed:', { isOpen, show })
    if (isOpen) {
      setShow(true)
      // Clear any existing timer
      if (timer) {
        clearTimeout(timer)
      }
      // Set new timer
      const newTimer = setTimeout(() => {
        setShow(false)
        onClose()
      }, duration)
      setTimer(newTimer)
    } else {
      setShow(false)
      if (timer) {
        clearTimeout(timer)
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isOpen, duration, onClose])

  const handleClose = () => {
    setShow(false)
    if (timer) {
      clearTimeout(timer)
    }
    onClose()
  }

  if (!show) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          maxWidth: '28rem',
          width: '100%',
          margin: '0 1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#4B5563' }}>
          {description}
        </div>
      </div>
    </div>
  )
} 