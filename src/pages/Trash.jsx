import { useMemo, useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { fmtMoney } from '../utils/money'
import { fmtShort } from '../utils/date'

const TABS = [
  { key: 'bookings', label: 'Записи', orderField: 'date' },
  { key: 'clients', label: 'Клієнтки', orderField: 'name' },
  { key: 'services', label: 'Послуги', orderField: 'name' },
  { key: 'expenses', label: 'Витрати', orderField: 'date' },
]

function sortByDeletedAt(items) {
  return [...items].sort((a, b) => (b.deletedAt?.toMillis?.() || 0) - (a.deletedAt?.toMillis?.() || 0))
}

function Row({ label, sub, onRestore, onDestroy }) {
  return (
    <div className="card p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{label}</p>
        {sub && <p className="text-xs text-inkSoft mt-0.5 truncate">{sub}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onRestore} className="p-2 rounded-md hover:bg-shell text-sage" title="Відновити">
          <RotateCcw size={15} />
        </button>
        <button onClick={onDestroy} className="p-2 rounded-md hover:bg-shell text-wine-dark" title="Видалити назавжди">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default function Trash() {
  const [tab, setTab] = useState('bookings')

  const bookings = useCollection('bookings', 'date')
  const clients = useCollection('clients', 'name')
  const services = useCollection('services', 'name')
  const expenses = useCollection('expenses', 'date')

  const byKey = { bookings, clients, services, expenses }
  const active = byKey[tab]

  const sorted = useMemo(() => sortByDeletedAt(active.trashed), [active.trashed])

  const confirmDestroy = (fn, id, what) => {
    if (window.confirm(`Видалити ${what} назавжди? Цю дію не можна скасувати.`)) fn(id)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl">Кошик</h1>
        <p className="text-inkSoft text-sm">Видалені записи зберігаються тут, доки ти не видалиш їх назавжди</p>
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs shrink-0 border ${
              tab === t.key ? 'bg-wine text-cream border-wine' : 'border-line text-inkSoft'
            }`}
          >
            {t.label} {byKey[t.key].trashed.length > 0 && `(${byKey[t.key].trashed.length})`}
          </button>
        ))}
      </div>

      {sorted.length === 0 && <div className="card p-8 text-center text-inkSoft">Кошик порожній.</div>}

      <div className="space-y-2">
        {sorted.map((item) => {
          if (tab === 'bookings') {
            return (
              <Row
                key={item.id}
                label={item.clientName}
                sub={`${fmtShort(item.date)}, ${item.time} — ${fmtMoney(item.total)}`}
                onRestore={() => active.restore(item.id)}
                onDestroy={() => confirmDestroy(active.destroy, item.id, 'запис')}
              />
            )
          }
          if (tab === 'clients') {
            return (
              <Row
                key={item.id}
                label={item.name}
                sub={item.phone}
                onRestore={() => active.restore(item.id)}
                onDestroy={() => confirmDestroy(active.destroy, item.id, 'клієнтку')}
              />
            )
          }
          if (tab === 'services') {
            return (
              <Row
                key={item.id}
                label={item.name}
                sub={fmtMoney(item.price)}
                onRestore={() => active.restore(item.id)}
                onDestroy={() => confirmDestroy(active.destroy, item.id, 'послугу')}
              />
            )
          }
          return (
            <Row
              key={item.id}
              label={item.item}
              sub={`${fmtShort(item.date)} — ${fmtMoney(item.price)}`}
              onRestore={() => active.restore(item.id)}
              onDestroy={() => confirmDestroy(active.destroy, item.id, 'витрату')}
            />
          )
        })}
      </div>
    </div>
  )
}
