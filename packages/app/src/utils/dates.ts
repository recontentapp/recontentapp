const formatter = new Intl.RelativeTimeFormat('en', { style: 'long' })
const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
] as const

export const formatRelative = (date: Date) => {
  let duration = (date.getTime() - new Date().getTime()) / 1000

  for (let i = 0; i <= DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }

  return ''
}

const lang = navigator.language === 'en-US' ? 'en-US' : 'en-GB'
const dateFormatter = new Intl.DateTimeFormat(lang)
export const format = (date: Date) => {
  return dateFormatter.format(date)
}

const shortDateformatter = new Intl.DateTimeFormat('en', {
  year: undefined,
  month: 'short',
  day: 'numeric',
})
export const formatShort = (date: Date) => {
  return shortDateformatter.format(date)
}
