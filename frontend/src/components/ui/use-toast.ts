// src/components/ui/use-toast.ts
import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

type ToastVariant = "default" | "destructive"

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastVariant
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((opts: Omit<Toast, "id">) => {
    const id = generateId()

    const newToast: Toast = {
      id,
      ...opts,
      variant: opts.variant || "default"
    }

    setToasts((currentToasts) => {
      // Limit toasts
      const updatedToasts = [newToast, ...currentToasts].slice(0, TOAST_LIMIT)
      return updatedToasts
    })

    return {
      id,
      dismiss: () => {
        setToasts((currentToasts) =>
          currentToasts.filter((t) => t.id !== id)
        )
      }
    }
  }, [])

  return React.useMemo(() => ({
    toast,
    toasts
  }), [toast, toasts])
}

export function Toaster() {
  const { toasts } = useToast()

  return React.createElement('div', {
    className: "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col"
  },
    toasts.map((toast) =>
      React.createElement('div', {
        key: toast.id,
        className: `group pointer-events-auto relative flex w-full items-center
          justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8
          shadow-lg transition-all mb-2 last:mb-0 ${
            toast.variant === 'destructive'
              ? 'border-destructive bg-destructive text-destructive-foreground'
              : 'border-border bg-background text-foreground'
          }`
      }, [
        React.createElement('div', {
          key: 'content',
          className: 'grid gap-1'
        }, [
          toast.title && React.createElement('div', {
            key: 'title',
            className: 'text-sm font-semibold'
          }, toast.title),
          toast.description && React.createElement('div', {
            key: 'description',
            className: 'text-sm opacity-90'
          }, toast.description)
        ]),
        toast.action && React.createElement('div', {
          key: 'action'
        }, toast.action)
      ])
    )
  )
}

// Separate toast function that uses context
export function toast(opts: Omit<Toast, "id">) {
  // This will create a warning if used outside of a component context
  const { toast: toastFn } = useToast()
  return toastFn(opts)
}
