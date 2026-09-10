import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Phone, Cake } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import Sheet from '../components/Sheet'

const EMPTY = { name: '', phone: '', birthday: '', notes: '' }

export default function Clients() {
  const { items, add, update, remove, loading } = useCollection('clients', 'name')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'uk'))
    if (!q) return sorted
    return sorted.filter((c) => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q))
  }, [items, query])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setOpen(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, phone: c.phone || '', birthday: c.birthday || '', notes: c.notes || '' })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = { ...form, name: form.name.trim() }
    if (editing) await update(editing.id, data)
    else await add(data)
    setOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="font-display text-2xl">Клієнтки</h1>
          <p className="text-inkSoft text-sm">{items.length} у базі</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Додати
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkSoft" />
        <input
          className="field-input pl-9"
          placeholder="Пошук за іменем або телефоном"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!loading && filtered.length === 0 && (
        <div className="card p-8 text-center text-inkSoft">Нікого не знайдено.</div>
      )}

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{c.name}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-inkSoft">
                {c.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {c.phone}
                  </span>
                )}
                {c.birthday && (
                  <span className="flex items-center gap-1">
                    <Cake size={12} /> {c.birthday}
                  </span>
                )}
              </div>
              {c.notes && <p className="text-xs text-inkSoft mt-1.5 truncate">{c.notes}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(c)} className="p-2 rounded-md hover:bg-shell text-inkSoft">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(c.id)} className="p-2 rounded-md hover:bg-shell text-wine-dark">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Редагувати клієнтку' : 'Нова клієнтка'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label">Ім'я</label>
            <input
              required
              autoFocus
              className="field-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Олена"
            />
          </div>
          <div>
            <label className="field-label">Телефон</label>
            <input
              className="field-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+380 ..."
            />
          </div>
          <div>
            <label className="field-label">День народження</label>
            <input
              type="date"
              className="field-input"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Нотатки (алергії, побажання)</label>
            <textarea
              className="field-input min-h-20"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {editing ? 'Зберегти' : 'Додати клієнтку'}
          </button>
        </form>
      </Sheet>
    </div>
  )
}
