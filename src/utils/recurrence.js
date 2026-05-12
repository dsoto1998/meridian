const RECURRENCE_LIST_IDS = new Set(['daily', 'weekly', 'monthly', 'quarterly', 'annually']);

export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const WEEK_OF_MONTH_LABELS = ['First', 'Second', 'Third', 'Fourth', 'Last'];
export const WEEK_OF_MONTH_VALUES = [1, 2, 3, 4, -1];

export function getRecurrenceType(listId) {
  return RECURRENCE_LIST_IDS.has(listId) ? listId : null;
}

export function getDefaultRecurrence(listId) {
  const type = getRecurrenceType(listId);
  if (!type || type === 'daily') return null;
  const now = new Date();
  const base = {
    monthlyMode: 'date',
    dayOfMonth: now.getDate(),
    weekday: now.getDay(),
    weekOfMonth: 1,
  };
  if (type === 'weekly') return { weekdayMode: 'single', weekdays: [now.getDay()] };
  if (type === 'monthly') return base;
  if (type === 'quarterly') return { ...base, quarterMonth: (now.getMonth() % 3) + 1 };
  if (type === 'annually') return { ...base, month: now.getMonth() };
  return null;
}

// Returns the day-of-month (number) for the Nth weekday in a given month.
// n: 1–4 = first–fourth, -1 = last. Returns null if that occurrence doesn't exist.
function getNthWeekdayDate(year, month, weekday, n) {
  if (n === -1) {
    const lastDay = new Date(year, month + 1, 0);
    const diff = (lastDay.getDay() - weekday + 7) % 7;
    return lastDay.getDate() - diff;
  }
  const firstDay = new Date(year, month, 1);
  const diff = (weekday - firstDay.getDay() + 7) % 7;
  const result = 1 + diff + (n - 1) * 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return result <= daysInMonth ? result : null;
}

function matchesMonthlyRule(date, r) {
  if (r.monthlyMode === 'date') {
    return date.getDate() === r.dayOfMonth;
  }
  const nthDay = getNthWeekdayDate(date.getFullYear(), date.getMonth(), r.weekday, r.weekOfMonth);
  return nthDay !== null && date.getDate() === nthDay;
}

export function taskOccursOn(task, isoDate) {
  const type = getRecurrenceType(task.listId);
  if (!type) return false;

  if (type === 'daily') return true;

  const r = task.recurrence;
  if (!r) return false;

  const [y, mo, d] = isoDate.split('-').map(Number);
  const date = new Date(y, mo - 1, d);

  if (type === 'weekly') {
    return Array.isArray(r.weekdays) && r.weekdays.includes(date.getDay());
  }

  if (type === 'monthly') {
    return matchesMonthlyRule(date, r);
  }

  if (type === 'quarterly') {
    if (!r.quarterMonth) return false;
    if ((date.getMonth() % 3) + 1 !== r.quarterMonth) return false;
    return matchesMonthlyRule(date, r);
  }

  if (type === 'annually') {
    if (r.month == null) return false;
    if (date.getMonth() !== r.month) return false;
    return matchesMonthlyRule(date, r);
  }

  return false;
}

export function isOccurrenceCompleted(task, isoDate) {
  return Array.isArray(task.completedDates) && task.completedDates.includes(isoDate);
}
