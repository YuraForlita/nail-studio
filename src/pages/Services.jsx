import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { fmtMoney } from '../utils/money'
import Sheet from '../components/Sheet'

const EMPTY = { name: '', price: '', duration: '' }

export default function Services() {
  const { items, add, update, remove, loading } = useCollection('services', 'name')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }
  const openEdit = (s) => {
    setEditing(s)
    setForm({ name: s.name, price: s.price, duration: s.duration || '' })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = { name: form.name.trim(), price: Number(form.price), duration: Number(form.duration) || null }
    if (editing) await update(editing.id, data)
    else await add(data)
    setOpen(false)
  }

  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'uk'))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl">Послуги</h1>
          <p className="text-inkSoft text-sm">Ціни, які підтягуються в запис клієнтки</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Додати
        </button>
      </div>

      {!loading && sorted.length === 0 && (
        <div className="card p-8 text-center text-inkSoft">
          Ще немає жодної послуги. Додай першу — ціни звідси будуть підтягуватись у записи.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((s) => (
          <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{s.name}</p>
              <p className="text-wine font-display text-lg mt-0.5">{fmtMoney(s.price)}</p>
              {s.duration && <p className="text-xs text-inkSoft mt-1">{s.duration} хв</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(s)} className="p-2 rounded-md hover:bg-shell text-inkSoft">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(s.id)} className="p-2 rounded-md hover:bg-shell text-wine-dark">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Редагувати послугу' : 'Нова послуга'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label">Назва послуги</label>
            <input
              required
              autoFocus
              className="field-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Манікюр з покриттям"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="field-label">Ціна, ₴</label>
              <input
                required
                type="number"
                min="0"
                className="field-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="600"
              />
            </div>
            <div className="min-w-0">
              <label className="field-label">Тривалість, хв</label>
              <input
                type="number"
                min="0"
                className="field-input"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="90"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {editing ? 'Зберегти' : 'Додати послугу'}
          </button>
        </form>
      </Sheet>
    </div>
  )
}
