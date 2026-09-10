import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfYear,
  isWithinInterval,
} from 'date-fns'
import { uk } from 'date-fns/locale'

export const fmtDate = (d, pattern = 'd MMMM, EEEE') =>
  format(typeof d === 'string' ? parseISO(d) : d, pattern, { locale: uk })

export const fmtShort = (d) =>
  format(typeof d === 'string' ? parseISO(d) : d, 'd MMM', { locale: uk })

export const weekDays = (anchor = new Date()) => {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export { isSameDay, startOfMonth, endOfMonth, startOfYear, isWithinInterval, parseISO }

export const toDateInputValue = (d) => format(d, 'yyyy-MM-dd')
export const toTimeInputValue = (d) => format(d, 'HH:mm')
