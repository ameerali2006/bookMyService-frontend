export function getTimeBasedIndicator(
  startTime: string,
  status: | 'confirmed'
    | 'in-progress' 
    | 'awaiting-final-payment'
): string | null {
  // If already in progress, show that
  if (status === "in-progress") {
    return "Ongoing"
  }

  // Parse start time (format: "HH:MM")
  const [hours, minutes] = startTime.split(":").map(Number)
  const now = new Date()
  const serviceStart = new Date()
  serviceStart.setHours(hours, minutes, 0, 0)

  const diffInMinutes = Math.floor((serviceStart.getTime() - now.getTime()) / (1000 * 60))

  // If service has already started but not marked as in-progress
  if (diffInMinutes < 0) {
    return "Delayed"
  }

  // If service starts within 60 minutes
  if (diffInMinutes <= 60) {
    return `Starts in ${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""}`
  }

  // If service starts within 2 hours
  if (diffInMinutes <= 120) {
    const hours = Math.floor(diffInMinutes / 60)
    const mins = diffInMinutes % 60
    if (mins === 0) {
      return `Starts in ${hours} hr${hours !== 1 ? "s" : ""}`
    }
    return `Starts in ${hours}h ${mins}m`
  }

  // Otherwise, no indicator needed
  return null
}
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
