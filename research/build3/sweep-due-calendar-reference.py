#!/usr/bin/env python3
"""Independent stdlib reference; no application code imported. Reminder policy is unverified."""
from datetime import date
from calendar import monthrange
from pathlib import Path
import json


def anniversary(original, months):
    total = (original.year - 1) * 12 + original.month - 1 + months
    year, month = total // 12 + 1, total % 12 + 1
    return date(year, month, min(original.day, monthrange(year, month)[1]))


def reference(last, today, interval):
    event, as_of = date.fromisoformat(last), date.fromisoformat(today)
    age = (as_of.year - event.year) * 12 + as_of.month - event.month
    age -= as_of < anniversary(event, age)
    warning, due = anniversary(event, (2 * interval + 2) // 3), anniversary(event, interval)
    return dict(last=last, asOf=today, intervalMonths=interval,
                ageFullCalendarMonths=age, warning=warning.isoformat(), due=due.isoformat(),
                status='red' if as_of >= due else 'yellow' if as_of >= warning else 'green')


if __name__ == '__main__':
    cases = json.loads(Path(__file__).with_name('sweep-due-calendar-cases.json').read_text())
    for case in cases:
        assert reference(case['last'], case['asOf'], case['intervalMonths']) == case, case
    print(f'Sweep-due independent calendar references: {len(cases)} cases matched')
