import { X } from 'lucide-react'

export default function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="animate-sheet relative w-full md:max-w-lg bg-card rounded-t-lg md:rounded-lg border border-line shadow-soft max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-card">
          <h2 className="font-display text-lg">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-shell text-inkSoft">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
