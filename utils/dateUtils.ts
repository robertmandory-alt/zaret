
export const getTodayJalali = (): string => {
  // A simple implementation for formatting date to Jalali.
  // In a real production app, libraries like 'date-fns-jalali' or 'jalaali-js' are recommended.
  // Since we can't install new packages, we use Intl.DateTimeFormat which supports persian calendar.
  
  const date = new Date();
  return new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatJalali = (isoDate?: string): string => {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return '-';
  }
};
