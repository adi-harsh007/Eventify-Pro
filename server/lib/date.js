function normalizeEventDateTime(event) {
    if (!event || !event.date || !event.time) {
        throw new Error("Invalid event object: missing date or time");
    }

    let dateStr;
    if (event.date instanceof Date) {
        if (isNaN(event.date)) throw new Error("Invalid event date object");
        dateStr = event.date.toISOString().split('T')[0];
    } else {
        dateStr = String(event.date).trim();
        const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            dateStr = dateMatch[1];
        } else {
            const parsed = new Date(dateStr);
            if (isNaN(parsed)) throw new Error("Invalid event date format");
            dateStr = parsed.toISOString().split('T')[0];
        }
    }

    let timeStr = String(event.time).trim();
    if (!timeStr) throw new Error("Event time cannot be empty");

    const ampmMatch = timeStr.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)$/i);
    const hr24Match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (ampmMatch) {
        let h = parseInt(ampmMatch[1], 10);
        const m = ampmMatch[2] || "00";
        const s = ampmMatch[3] || "00";
        const modifier = ampmMatch[4].toUpperCase();

        if (h === 12) h = 0;
        if (modifier === 'PM') h += 12;

        timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else if (hr24Match) {
        const h = hr24Match[1];
        const m = hr24Match[2];
        const s = hr24Match[3] || "00";
        timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
        throw new Error("Invalid event time format");
    }

    const finalDate = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(finalDate)) {
        throw new Error("Resulting event date and time is invalid");
    }
    return finalDate;
}

module.exports = {
    normalizeEventDateTime
};
