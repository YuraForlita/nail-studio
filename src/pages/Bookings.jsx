import { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Cake,
  TriangleAlert,
} from 'lucide-react'
import { useCollection } from '../hooks/useCollection'
import {
  weekDays,
  monthGrid,
  addWeeks,
  addMonths,
  isSameDay,
  isSameMonth,
  isToday,
  toDateInputValue,
  fmtDate,
  fmtShort,
  parseISO,
} from '../utils/date'
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
  const [viewMode, setViewMode] = useState('week') // week | month
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm(toDateInputValue(new Date())))
  const [clientMode, setClientMode] = useState('existing') // existing | new
  const [newClientName, setNewClientName] = useState('')

  const days = useMemo(() => weekDays(anchor), [anchor])
  const daysInMonth = useMemo(() => monthGrid(anchor), [anchor])

  const shiftWeek = (dir) => setAnchor((a) => addWeeks(a, dir))
  const shiftMonth = (dir) => setAnchor((a) => addMonths(a, dir))
  const goToday = () => {
    const t = new Date()
    setAnchor(t)
    setSelectedDay(t)
  }

  const countsByDate = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      if (b.status === 'cancelled') return
      map[b.date] = (map[b.date] || 0) + 1
    })
    return map
  }, [bookings])

  const upcomingBirthdays = useMemo(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return clients
      .filter((c) => c.birthday)
      .map((c) => {
        const bd = parseISO(c.birthday)
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate())
        if (next < todayStart) next = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate())
        const daysUntil = Math.round((next - todayStart) / 86400000)
        return { ...c, nextBirthday: next, daysUntil }
      })
      .filter((c) => c.daysUntil <= 14)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [clients])

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

  const conflict = useMemo(() => {
    if (!form.date || !form.time) return null
    return bookings.find(
      (b) =>
        b.date === form.date &&
        b.time === form.time &&
        b.status !== 'cancelled' &&
        (!editing || b.id !== editing.id)
    )
  }, [bookings, form.date, form.time, editing])

  const submit = async (e) => {
    e.preventDefault()
    if (conflict) return
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

      {upcomingBirthdays.length > 0 && (
        <div className="card p-3 mb-5 flex items-start gap-2.5">
          <Cake size={16} className="text-caramel shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-inkSoft text-xs mb-1">Дні народження найближчим часом</p>
            <p className="text-sm truncate">
              {upcomingBirthdays
                .slice(0, 3)
                .map((c) => `${c.name} — ${fmtShort(c.nextBirthday)}${c.daysUntil === 0 ? ' (сьогодні!)' : ''}`)
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-inkSoft">
          {viewMode === 'month' ? fmtDate(anchor, 'LLLL yyyy') : 'Тижневий перегляд'}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-full text-xs border ${
              viewMode === 'week' ? 'bg-wine text-cream border-wine' : 'border-line text-inkSoft'
            }`}
          >
            Тиждень
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-full text-xs border ${
              viewMode === 'month' ? 'bg-wine text-cream border-wine' : 'border-line text-inkSoft'
            }`}
          >
            Місяць
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Тижневий стрічковий вибір дня */
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
                    active ? 'bg-wine text-cream border-wine' : 'bg-card text-ink border-line hover:border-wine/40'
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
          <button className="text-xs text-inkSoft hover:text-wine px-2 py-2 shrink-0" onClick={goToday}>
            Сьогодні
          </button>
        </div>
      ) : (
        /* Місячний календар */
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <button
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-md text-inkSoft hover:bg-card hover:text-wine border border-line shrink-0"
              title="Попередній місяць"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="flex-1 text-center font-display text-base capitalize">{fmtDate(anchor, 'LLLL yyyy')}</span>
            <button
              onClick={() => shiftMonth(1)}
              className="p-2 rounded-md text-inkSoft hover:bg-card hover:text-wine border border-line shrink-0"
              title="Наступний місяць"
            >
              <ChevronRight size={16} />
            </button>
            <button className="text-xs text-inkSoft hover:text-wine px-2 py-2 shrink-0" onClick={goToday}>
              Сьогодні
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {days.map((d) => (
              <span key={d.toISOString()} className="text-center text-[10px] uppercase text-inkSoft/70 py-1">
                {fmtDate(d, 'EEEEEE')}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((d) => {
              const active = isSameDay(d, selectedDay)
              const inMonth = isSameMonth(d, anchor)
              const count = countsByDate[toDateInputValue(d)] || 0
              const loadClass =
                count >= 5 ? 'bg-wine/25' : count >= 3 ? 'bg-wine/15' : count >= 1 ? 'bg-wine/5' : ''
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDay(d)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-md border text-sm transition-colors ${
                    active
                      ? 'bg-wine text-cream border-wine'
                      : `border-line hover:border-wine/40 ${inMonth ? 'text-ink' : 'text-inkSoft/40'} ${loadClass}`
                  }`}
                >
                  <span className={isToday(d) && !active ? 'font-bold text-wine' : ''}>{fmtDate(d, 'd')}</span>
                  {count > 0 && (
                    <span className={`text-[9px] mt-0.5 ${active ? 'text-cream/80' : 'text-inkSoft'}`}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

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
                className={`btn text-xs flex-1 ${clientMode === 'existing' ? 'bg-wine text-cream' : 'bg-shell text-inkSoft'}`}
              >
                Обрати
              </button>
              <button
                type="button"
                onClick={() => setClientMode('new')}
                className={`btn text-xs flex-1 ${clientMode === 'new' ? 'bg-wine text-cream' : 'bg-shell text-inkSoft'}`}
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

          {conflict && (
            <div className="flex items-start gap-2 text-xs text-wine-dark bg-wine/5 rounded-md px-3 py-2.5">
              <TriangleAlert size={14} className="shrink-0 mt-0.5" />
              <span>
                На {form.time} вже є запис: <strong>{conflict.clientName}</strong>. Обери інший час.
              </span>
            </div>
          )}

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
                        {checked && <Check size={11} className="text-cream" />}
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

          <button type="submit" disabled={!!conflict} className="btn-primary w-full">
            {editing ? 'Зберегти зміни' : 'Зберегти запис'} — {fmtMoney(total)}
          </button>
        </form>
      </Sheet>
    </div>
  )
}
