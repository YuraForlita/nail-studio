import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { fmtMoney } from '../utils/money'
import { toDateInputValue, fmtShort } from '../utils/date'
import Sheet from '../components/Sheet'

const CATEGORIES = ['Матеріали', 'Інструменти', 'Оренда', 'Реклама', 'Навчання', 'Інше']

function empty() {
  return { item: '', price: '', date: toDateInputValue(new Date()), category: 'Матеріали', notes: '' }
}

export default function Expenses() {
  const { items, add, update, remove, loading } = useCollection('expenses', 'date')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty())
  const [filterCat, setFilterCat] = useState('Усі')

  const sorted = useMemo(() => [...items].sort((a, b) => b.date.localeCompare(a.date)), [items])
  const filtered = filterCat === 'Усі' ? sorted : sorted.filter((e) => e.category === filterCat)
  const total = filtered.reduce((s, e) => s + Number(e.price || 0), 0)

  const openNew = () => {
    setEditing(null)
    setForm(empty())
    setOpen(true)
  }
  const openEdit = (e) => {
    setEditing(e)
    setForm({ item: e.item, price: e.price, date: e.date, category: e.category, notes: e.notes || '' })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = { ...form, item: form.item.trim(), price: Number(form.price) }
    if (editing) await update(editing.id, data)
    else await add(data)
    setOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl">Витрати</h1>
          <p className="text-inkSoft text-sm">Замовлення матеріалів та інші витрати</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Витрата
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {['Усі', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs shrink-0 border ${
              filterCat === c ? 'bg-wine text-cream border-wine' : 'border-line text-inkSoft'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-inkSoft">{filtered.length} записів</span>
          <span className="text-sm font-medium text-wine">{fmtMoney(total)}</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-8 text-center text-inkSoft">Витрат ще не додано.</div>
      )}

      <div className="space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{e.item}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-shell text-inkSoft shrink-0">
                  {e.category}
                </span>
              </div>
              <p className="text-xs text-inkSoft mt-1">{fmtShort(e.date)}</p>
              {e.notes && <p className="text-xs text-inkSoft mt-0.5 truncate">{e.notes}</p>}
            </div>
            <span className="font-display text-wine shrink-0">{fmtMoney(e.price)}</span>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(e)} className="p-2 rounded-md hover:bg-shell text-inkSoft">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(e.id)} className="p-2 rounded-md hover:bg-shell text-wine-dark">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Редагувати витрату' : 'Нова витрата'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label">Що замовлено</label>
            <input
              required
              autoFocus
              className="field-input"
              value={form.item}
              onChange={(e) => setForm({ ...form, item: e.target.value })}
              placeholder="Гель-лак набір"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="field-label">Сума, ₴</label>
              <input
                required
                type="number"
                min="0"
                className="field-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <label className="field-label">Дата</label>
              <input
                type="date"
                required
                className="field-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="field-label">Категорія</label>
            <select
              className="field-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Нотатка</label>
            <input
              className="field-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Необов'язково"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {editing ? 'Зберегти' : 'Додати витрату'}
          </button>
        </form>
      </Sheet>
    </div>
  )
}
