export interface CronExpression {
  expression: string;
  description: string;
  isValid: boolean;
  error?: string;
}

export function parseNaturalLanguage(input: string): CronExpression {
  const normalized = input.toLowerCase().trim();

  // Every X minutes
  const minuteMatch = normalized.match(/every (\d+) minute(s)?/);
  if (minuteMatch) {
    const minutes = parseInt(minuteMatch[1]);
    if (minutes >= 1 && minutes <= 59) {
      return {
        expression: `*/${minutes} * * * *`,
        description: `Every ${minutes} minute${minutes > 1 ? 's' : ''}`,
        isValid: true
      };
    }
  }

  // Every X hours
  const hourMatch = normalized.match(/every (\d+) hour(s)?/);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    if (hours >= 1 && hours <= 23) {
      return {
        expression: `0 */${hours} * * *`,
        description: `Every ${hours} hour${hours > 1 ? 's' : ''}`,
        isValid: true
      };
    }
  }

  // Every X days
  const dayMatch = normalized.match(/every (\d+) day(s)?/);
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    if (days >= 1) {
      return {
        expression: `0 0 */${days} * *`,
        description: `Every ${days} day${days > 1 ? 's' : ''}`,
        isValid: true
      };
    }
  }

  // At specific time (e.g., "at 2 AM", "at 14:30", "at 2:30 PM")
  const timeMatch = normalized.match(/at (\d{1,2})(?::(\d{2}))?\s?(am|pm)?/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3];

    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return {
        expression: `${minute} ${hour} * * *`,
        description: `Daily at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        isValid: true
      };
    }
  }

  // Every weekday
  if (normalized.includes('every weekday') || normalized.includes('weekdays')) {
    return {
      expression: '0 9 * * 1-5',
      description: 'Every weekday at 9:00 AM',
      isValid: true
    };
  }

  // Every weekend
  if (normalized.includes('every weekend') || normalized.includes('weekends')) {
    return {
      expression: '0 9 * * 0,6',
      description: 'Every weekend at 9:00 AM',
      isValid: true
    };
  }

  // Specific days of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (normalized.includes(`every ${days[i]}`)) {
      return {
        expression: `0 9 * * ${i}`,
        description: `Every ${days[i].charAt(0).toUpperCase() + days[i].slice(1)} at 9:00 AM`,
        isValid: true
      };
    }
  }

  // Every hour
  if (normalized === 'every hour' || normalized === 'hourly') {
    return {
      expression: '0 * * * *',
      description: 'Every hour',
      isValid: true
    };
  }

  // Every day / daily
  if (normalized === 'every day' || normalized === 'daily') {
    return {
      expression: '0 0 * * *',
      description: 'Daily at midnight',
      isValid: true
    };
  }

  // Every week / weekly
  if (normalized === 'every week' || normalized === 'weekly') {
    return {
      expression: '0 0 * * 0',
      description: 'Weekly on Sunday at midnight',
      isValid: true
    };
  }

  // Every month / monthly
  if (normalized === 'every month' || normalized === 'monthly') {
    return {
      expression: '0 0 1 * *',
      description: 'Monthly on the 1st at midnight',
      isValid: true
    };
  }

  return {
    expression: '',
    description: '',
    isValid: false,
    error: 'Could not parse input. Try "every 10 minutes", "at 2 AM", "every Monday", etc.'
  };
}

export function getNextRuns(cronExpression: string, count: number = 5): Date[] {
  const parts = cronExpression.split(' ');
  if (parts.length !== 5) return [];

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const now = new Date();
  const runs: Date[] = [];
  let currentDate = new Date(now);

  for (let i = 0; i < 1000 && runs.length < count; i++) {
    currentDate = new Date(currentDate.getTime() + 60000);

    if (!matchesCronPart(minute, currentDate.getMinutes())) continue;
    if (!matchesCronPart(hour, currentDate.getHours())) continue;
    if (!matchesCronPart(dayOfMonth, currentDate.getDate())) continue;
    if (!matchesCronPart(month, currentDate.getMonth() + 1)) continue;
    if (!matchesCronPart(dayOfWeek, currentDate.getDay())) continue;

    runs.push(new Date(currentDate));
    currentDate = new Date(currentDate.getTime() + 59000);
  }

  return runs;
}

function matchesCronPart(pattern: string, value: number, min: number = 0, max: number = 59): boolean {
  if (pattern === '*') return true;

  if (pattern.includes('/')) {
    const [range, step] = pattern.split('/');
    const stepNum = parseInt(step);
    if (range === '*') {
      return value % stepNum === 0;
    }
  }

  if (pattern.includes(',')) {
    const values = pattern.split(',').map(v => parseInt(v));
    return values.includes(value);
  }

  if (pattern.includes('-')) {
    const [startRaw, endRaw] = pattern.split('-');
    const start = Math.max(min, parseInt(startRaw));
    const end = Math.min(max, parseInt(endRaw));
    return value >= start && value <= end;
  }

  return parseInt(pattern) === value;
}
