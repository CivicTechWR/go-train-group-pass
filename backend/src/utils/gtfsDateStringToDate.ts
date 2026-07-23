// Returns midnight UTC for the given YYYYMMDD string.
// Using Date.UTC avoids new Date(y,m,d) creating a server-local-timezone date,
// which would be the wrong calendar day on non-UTC servers.
export function gtfsDateStringToDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(Date.UTC(year, month, day));
}
