/**
 * Converts minutes to a formatted time string (e.g., "2h 30m")
 * @param minutes - Total minutes
 * @returns Formatted time string
 */
export function formatMinutesToTime(minutes: number): string {
  if (minutes === 0) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Converts hours (decimal) to formatted time string (e.g., "2h 30m")
 * @param hours - Total hours as decimal
 * @returns Formatted time string
 */
export function formatHoursToTime(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  return formatMinutesToTime(totalMinutes);
}

/**
 * Converts minutes to hours with one decimal place
 * @param minutes - Total minutes
 * @returns Hours as decimal
 */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

/**
 * Converts hours to minutes
 * @param hours - Total hours
 * @returns Total minutes
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}
