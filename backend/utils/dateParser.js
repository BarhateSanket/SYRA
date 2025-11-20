import chrono from 'chrono-node';

/**
 * Utility for parsing natural language dates and times
 */
export class DateParser {
  /**
   * Parse natural language date/time string
   * @param {string} dateString - Natural language date/time (e.g., "tomorrow at 3pm", "next Monday")
   * @param {string} timezone - User's timezone (default: 'Asia/Calcutta')
   * @returns {Object} Parsed date information
   */
  static parseDateTime(dateString, timezone = 'Asia/Calcutta') {
    try {
      // Parse the date using chrono
      const results = chrono.parse(dateString, new Date(), {
        forwardDate: true
      });

      if (!results || results.length === 0) {
        return {
          success: false,
          error: 'Unable to parse date/time',
          original: dateString
        };
      }

      const result = results[0];
      const startDate = result.start.date();
      const endDate = result.end ? result.end.date() : null;

      // Convert to user's timezone
      const userTimezoneOffset = this.getTimezoneOffset(timezone);
      const utcDate = new Date(startDate.getTime() - (userTimezoneOffset * 60 * 1000));

      return {
        success: true,
        startDate: utcDate.toISOString(),
        endDate: endDate ? new Date(endDate.getTime() - (userTimezoneOffset * 60 * 1000)).toISOString() : null,
        isAllDay: !result.start.isCertain('hour'),
        timezone: timezone,
        original: dateString,
        parsed: {
          text: result.text,
          start: result.start,
          end: result.end
        }
      };
    } catch (error) {
      console.error('Date parsing error:', error);
      return {
        success: false,
        error: error.message,
        original: dateString
      };
    }
  }

  /**
   * Parse period strings for calendar viewing (today, tomorrow, this week, etc.)
   * @param {string} period - Period string
   * @param {string} timezone - User's timezone
   * @returns {Object} Date range for the period
   */
  static parsePeriod(period, timezone = 'Asia/Calcutta') {
    const now = new Date();
    const userTimezoneOffset = this.getTimezoneOffset(timezone);
    const localNow = new Date(now.getTime() + (userTimezoneOffset * 60 * 1000));

    let startDate, endDate;

    switch (period.toLowerCase()) {
      case 'today':
        startDate = new Date(localNow);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(localNow);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'tomorrow':
        startDate = new Date(localNow);
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'this week':
        startDate = new Date(localNow);
        startDate.setDate(localNow.getDate() - localNow.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'next week':
        startDate = new Date(localNow);
        startDate.setDate(localNow.getDate() - localNow.getDay() + 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'this month':
        startDate = new Date(localNow.getFullYear(), localNow.getMonth(), 1);
        endDate = new Date(localNow.getFullYear(), localNow.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        // Try to parse as a specific date
        const parsed = this.parseDateTime(period, timezone);
        if (parsed.success) {
          startDate = new Date(parsed.startDate);
          endDate = parsed.endDate ? new Date(parsed.endDate) : new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Default to today
          startDate = new Date(localNow);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(localNow);
          endDate.setHours(23, 59, 59, 999);
        }
    }

    // Convert back to UTC for API calls
    const utcStart = new Date(startDate.getTime() - (userTimezoneOffset * 60 * 1000));
    const utcEnd = new Date(endDate.getTime() - (userTimezoneOffset * 60 * 1000));

    return {
      startDate: utcStart.toISOString(),
      endDate: utcEnd.toISOString(),
      timezone: timezone,
      period: period
    };
  }

  /**
   * Get timezone offset in minutes
   * @param {string} timezone - Timezone string
   * @returns {number} Offset in minutes
   */
  static getTimezoneOffset(timezone) {
    // Simple timezone offset mapping
    const offsets = {
      'Asia/Calcutta': 330, // IST (UTC+5:30)
      'America/New_York': -300, // EST
      'America/Los_Angeles': -480, // PST
      'Europe/London': 0, // GMT
      'Europe/Paris': 60, // CET
      'Asia/Tokyo': 540, // JST
      'Australia/Sydney': 600, // AEST
      'UTC': 0
    };

    return offsets[timezone] || 0;
  }

  /**
   * Validate if a date string is parseable
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if parseable
   */
  static isValidDateString(dateString) {
    const result = this.parseDateTime(dateString);
    return result.success;
  }

  /**
   * Format date for display
   * @param {string} isoString - ISO date string
   * @param {string} timezone - Timezone
   * @returns {string} Formatted date string
   */
  static formatDate(isoString, timezone = 'Asia/Calcutta') {
    const date = new Date(isoString);
    const userTimezoneOffset = this.getTimezoneOffset(timezone);
    const localDate = new Date(date.getTime() + (userTimezoneOffset * 60 * 1000));

    return localDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    });
  }
}

export default DateParser;