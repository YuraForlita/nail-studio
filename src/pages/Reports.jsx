import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useCollection } from '../hooks/useCollection'
import { fmtMoney } from '../utils/money'
import { parseISO, startOfMonth, startOfYear, isWithinInterval, format } from 'date-fns'
import { uk } from 'date-fns/locale'

const PERIODS = [
  { key: 'month', label: 'Цей місяць' },
  { key: 'year', label: 'Цей рік' },
  { key: 'all', label: 'Весь час' },
]

function rangeFor(key) {
  const now = new Date()
  if (key === 'month') return { start: startOfMonth(now), end: now }
  if (key === 'year') return { start: startOfYear(now), end: now }
  return null
}

export default function Reports() {
  const { items: bookings } = useCollection('bookings', 'date')
  const { items: expenses } = useCollection('expenses', 'date')
  const [period, setPeriod] = useState('month')

  const range = rangeFor(period)
  const inRange = (dateStr) => {
    if (!range) return true
    return isWithinInterval(parseISO(dateStr), { start: range.start, end: range.end })
  }

  const doneBookings = useMemo(
    () => bookings.filter((b) => b.status === 'done' && inRange(b.date)),
    [bookings, period]
  )
  const rangeExpenses = useMemo(() => expenses.filter((e) => inRange(e.date)), [expenses, period])

  const income = doneBookings.reduce((s, b) => s + (b.total || 0), 0)
  const expenseTotal = rangeExpenses.reduce((s, e) => s + (e.price || 0), 0)
  const net = income - expenseTotal

  const chartData = useMemo(() => {
    const groupKey = period === 'all' ? 'yyyy-MM' : period === 'year' ? 'yyyy-MM' : 'dd MMM'
    const map = {}
    doneBookings.forEach((b) => {
      const key = format(parseISO(b.date), groupKey, { locale: uk })
      map[key] = map[key] || { name: key, дохід: 0, витрати: 0 }
      map[key].дохід += b.total || 0
    })
    rangeExpenses.forEach((e) => {
      const key = format(parseISO(e.date), groupKey, { locale: uk })
      map[key] = map[key] || { name: key, дохід: 0, витрати: 0 }
      map[key].витрати += e.price || 0
    })
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
  }, [doneBookings, rangeExpenses, period])

  const byService = useMemo(() => {
    const map = {}
    doneBookings.forEach((b) => {
      ;(b.serviceItems || []).forEach((s) => {
        map[s.name] = (map[s.name] || 0) + s.price
      })
    })
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [doneBookings])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl">Звіти</h1>
      </div>

      <div className="flex gap-1.5 mb-5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              period === p.key ? 'bg-wine text-shell border-wine' : 'border-line text-inkSoft'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-inkSoft mb-1">Дохід</p>
          <p className="font-display text-xl text-sage">{fmtMoney(income)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-inkSoft mb-1">Витрати</p>
          <p className="font-display text-xl text-wine-dark">{fmtMoney(expenseTotal)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-inkSoft mb-1">Чистий прибуток</p>
          <p className="font-display text-xl text-wine">{fmtMoney(net)}</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="font-display text-base mb-3">Дохід і витрати</h3>
        {chartData.length === 0 ? (
          <p className="text-inkSoft text-sm py-8 text-center">Ще немає даних за цей період.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4D9D0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5B4F49' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5B4F49' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(v) => fmtMoney(v)}
                contentStyle={{ borderRadius: 10, borderColor: '#E4D9D0', fontSize: 12 }}
              />
              <Bar dataKey="дохід" fill="#5C7A5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="витрати" fill="#7A2E3C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card p-4">
        <h3 className="font-display text-base mb-3">Найприбутковіші послуги</h3>
        {byService.length === 0 ? (
          <p className="text-inkSoft text-sm py-4 text-center">Немає виконаних записів за період.</p>
        ) : (
          <div className="space-y-2.5">
            {byService.map((s) => {
              const max = byService[0].total
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.name}</span>
                    <span className="text-inkSoft">{fmtMoney(s.total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-shell overflow-hidden">
                    <div className="h-full bg-caramel rounded-full" style={{ width: `${(s.total / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
