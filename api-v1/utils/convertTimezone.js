// api-v1/utils/dateUtils.js

// Convert local date to UTC for database queries
export const toUTC = (localDate) => {
    const date = new Date(localDate);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

// Convert UTC to Myanmar timezone for display
export const toMyanmarTime = (utcDate) => {
    return new Date(utcDate).toLocaleString("en-US", {
        timeZone: "Asia/Yangon",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

// Create date range in UTC for queries
export const createDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const utcStart = toUTC(start);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const utcEnd = toUTC(end);

    return { utcStart, utcEnd };
};
