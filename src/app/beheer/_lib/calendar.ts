/** Kalenderrekenwerk op YYYY-MM-DD-strings (UTC-middag, zodat tijdzones geen dag verschuiven). */

const at = (day: string) => new Date(`${day}T12:00:00Z`);
const out = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(day: string, n: number) {
  const d = at(day);
  d.setUTCDate(d.getUTCDate() + n);
  return out(d);
}

/** 0 = maandag … 6 = zondag. */
export function weekday(day: string) {
  return (at(day).getUTCDay() + 6) % 7;
}

/** Maandag van de week waarin `day` valt. */
export function startOfWeek(day: string) {
  return addDays(day, -weekday(day));
}

/** "2026-11" → 6×7 (of 5×7) dagen, beginnend op maandag. */
export function monthGrid(month: string) {
  const first = `${month}-01`;
  const start = startOfWeek(first);
  const weeks: string[][] = [];
  let cur = start;
  do {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(cur);
      cur = addDays(cur, 1);
    }
    weeks.push(week);
  } while (cur.slice(0, 7) === month);
  return weeks;
}

export function shiftMonth(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1, 12));
  return out(d).slice(0, 7);
}

export function isMonth(v: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

/** Alle dagen van start t/m eind (inclusief). */
export function eachDay(start: string, end: string) {
  const days: string[] = [];
  for (let d = start; d <= end && days.length < 400; d = addDays(d, 1)) days.push(d);
  return days;
}
