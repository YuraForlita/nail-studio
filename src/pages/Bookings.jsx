import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X as XIcon, Clock, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import { weekDays, addWeeks, isSameDay, toDateInputValue, fmtDate } from '../utils/date'
import { fmtMoney } from '../utils/money'
import Sheet from '../components/Sheet'

const STATUS = {
  planned: { label: 'Заплановано', dot: 'bg-caramel', text: 'text-caramel' },
  done: { label: 'Виконано', dot: 'bg-sage', text: 'text-sage' },
  cancelled: { label: 'Скасовано', dot: 'bg-inkSoft/40', text: 'text-inkSoft' },
}

function emptyForm(dateStr) {
  return { clientId: '', clientName: '', time: '10:00', date: dateStr, serviceIds: [], notes: '', status: 'planned' }
}

export default function Bookings() {
  const { items: bookings, add, update, remove } = useCollection('bookings', 'date')
  const { items: clients, add: addClient } = useCollection('clients', 'name')
  const { items: services } = useCollection('services', 'name')

  const [anchor, setAnchor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm(toDateInputValue(new Date())))
  const [clientMode, setClientMode] = useState('existing') // existing | new
  const [newClientName, setNewClientName] = useState('')

  const days = useMemo(() => weekDays(anchor), [anchor])

  const shiftWeek = (dir) => setAnchor((a) => addWeeks(a, dir))

  const dayBookings = useMemo(() => {
    return bookings
      .filter((b) => b.date === toDateInputValue(selectedDay))
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [bookings, selectedDay])

  const dayTotal = dayBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total || 0), 0)

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm(toDateInputValue(selectedDay)))
    setClientMode('existing')
    setNewClientName('')
    setOpen(true)
  }

  const openEdit = (b) => {
    setEditing(b)
    setForm({
      clientId: b.clientId || '',
      clientName: b.clientName || '',
      time: b.time,
      date: b.date,
      serviceIds: (b.serviceItems || []).map((s) => s.id),
      notes: b.notes || '',
      status: b.status,
    })
    setClientMode('existing')
    setNewClientName('')
    setOpen(true)
  }

  const toggleService = (s) => {
    setForm((f) => {
      const exists = f.serviceIds.includes(s.id)
      return { ...f, serviceIds: exists ? f.serviceIds.filter((id) => id !== s.id) : [...f.serviceIds, s.id] }
    })
  }

  const chosenServices = services.filter((s) => form.serviceIds.includes(s.id))
  const total = chosenServices.reduce((sum, s) => sum + Number(s.price || 0), 0)

  const submit = async (e) => {
    e.preventDefault()
    let clientId = form.clientId
    let clientName = form.clientName

    if (clientMode === 'new') {
      if (!newClientName.trim()) return
      const ref = await addClient({ name: newClientName.trim() })
      clientId = ref.id
      clientName = newClientName.trim()
    }
    if (!clientId) return

    const payload = {
      clientId,
      clientName,
      date: form.date,
      time: form.time,
      status: form.status,
      notes: form.notes,
      serviceItems: chosenServices.map((s) => ({ id: s.id, name: s.name, price: Number(s.price) })),
      total,
    }

    if (editing) await update(editing.id, payload)
    else await add(payload)
    setOpen(false)
  }

  const cycleStatus = (b) => {
    const order = ['planned', 'done', 'cancelled']
    const next = order[(order.indexOf(b.status) + 1) % order.length]
    update(b.id, { status: next })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl">Записи</h1>
          <p className="text-inkSoft text-sm">{fmtDate(selectedDay)}</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Запис
        </button>
      </div>

      {/* Тижневий стрічковий вибір дня */}
      <div className="flex items-center gap-1.5 mb-5">
        <button
          onClick={() => shiftWeek(-1)}
          className="p-2 rounded-md text-inkSoft hover:bg-card hover:text-wine border border-line shrink-0"
          title="Попередній тиждень"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1.5 overflow-x-auto pb-1 min-w-0 flex-1">
          {days.map((d) => {
            const active = isSameDay(d, selectedDay)
            const hasBookings = bookings.some((b) => b.date === toDateInputValue(d) && b.status !== 'cancelled')
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDay(d)}
                className={`flex flex-col items-center justify-center w-12 h-16 rounded-md shrink-0 border transition-colors ${
                  active ? 'bg-wine text-shell border-wine' : 'bg-card text-ink border-line hover:border-wine/40'
                }`}
              >
                <span className="text-[10px] uppercase opacity-70">{fmtDate(d, 'EEEEEE')}</span>
                <span className="font-display text-lg leading-none mt-1">{fmtDate(d, 'd')}</span>
                <span className={`w-1 h-1 rounded-full mt-1 ${hasBookings ? (active ? 'bg-caramel-light' : 'bg-wine') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
        <button
          onClick={() => shiftWeek(1)}
          className="p-2 rounded-md text-inkSoft hover:bg-card hover:text-wine border border-line shrink-0"
          title="Наступний тиждень"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="text-xs text-inkSoft hover:text-wine px-2 py-2 shrink-0"
          onClick={() => {
            const t = new Date()
            setAnchor(t)
            setSelectedDay(t)
          }}
        >
          Сьогодні
        </button>
      </div>

      {dayBookings.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-inkSoft">{dayBookings.length} записів на день</span>
          <span className="text-sm font-medium text-wine">{fmtMoney(dayTotal)}</span>
        </div>
      )}

      {dayBookings.length === 0 && (
        <div className="card p-8 text-center text-inkSoft">
          На цей день записів немає. Натисни «Запис», щоб додати.
        </div>
      )}

      <div className="space-y-2">
        {dayBookings.map((b) => {
          const st = STATUS[b.status] || STATUS.planned
          return (
            <div key={b.id} className="card p-4 flex items-start gap-3">
              <button
                onClick={() => cycleStatus(b)}
                className="flex flex-col items-center pt-0.5 shrink-0"
                title="Змінити статус"
              >
                <span className={`w-3 h-3 rounded-full ${st.dot}`} />
                <span className="text-[10px] text-inkSoft mt-1 flex items-center gap-0.5">
                  <Clock size={10} /> {b.time}
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{b.clientName}</p>
                  <span className="font-display text-wine shrink-0">{fmtMoney(b.total)}</span>
                </div>
                <p className="text-xs text-inkSoft mt-0.5 truncate">
                  {(b.serviceItems || []).map((s) => s.name).join(', ') || 'без послуг'}
                </p>
                <p className={`text-[11px] mt-1 ${st.text}`}>{st.label}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(b)} className="p-1.5 text-inkSoft hover:text-wine">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(b.id)} className="p-1.5 text-inkSoft hover:text-wine-dark">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Редагувати запис' : 'Новий запис'}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label">Клієнтка</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setClientMode('existing')}
                className={`btn text-xs flex-1 ${clientMode === 'existing' ? 'bg-wine text-shell' : 'bg-shell text-inkSoft'}`}
              >
                Обрати
              </button>
              <button
                type="button"
                onClick={() => setClientMode('new')}
                className={`btn text-xs flex-1 ${clientMode === 'new' ? 'bg-wine text-shell' : 'bg-shell text-inkSoft'}`}
              >
                Нова
              </button>
            </div>
            {clientMode === 'existing' ? (
              <select
                required
                className="field-input"
                value={form.clientId}
                onChange={(e) => {
                  const c = clients.find((c) => c.id === e.target.value)
                  setForm({ ...form, clientId: e.target.value, clientName: c?.name || '' })
                }}
              >
                <option value="">Оберіть клієнтку…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                className="field-input"
                placeholder="Ім'я нової клієнтки"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="min-w-0">
              <label className="field-label">Час</label>
              <input
                type="time"
                required
                className="field-input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Послуги ({fmtMoney(total)})</label>
            {services.length === 0 && (
              <p className="text-xs text-inkSoft">Спочатку додай послуги у розділі «Послуги».</p>
            )}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {services.map((s) => {
                const checked = form.serviceIds.includes(s.id)
                return (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-md border cursor-pointer text-sm ${
                      checked ? 'border-wine bg-wine/5' : 'border-line'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          checked ? 'bg-wine border-wine' : 'border-line'
                        }`}
                      >
                        {checked && <Check size={11} className="text-shell" />}
                      </span>
                      {s.name}
                    </span>
                    <span className="text-inkSoft">{fmtMoney(s.price)}</span>
                    <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleService(s)} />
                  </label>
                )
              })}
            </div>
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
            {editing ? 'Зберегти зміни' : 'Зберегти запис'} — {fmtMoney(total)}
          </button>
        </form>
      </Sheet>
    </div>
  )
}
