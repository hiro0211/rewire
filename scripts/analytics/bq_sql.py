"""Shared SQL fragments for reading the GA4 BigQuery export.

Responsibility: encode *how* to read the export — where a param's value lands,
which timestamp is in which timezone, where install date really comes from.
The analysis modules own what the numbers mean; this module owns the handful of
GA4 facts that every one of them would otherwise rediscover the hard way.

Each fragment below exists because reading it wrong produces a plausible but
empty or shifted result rather than an error. Those are recorded inline.
"""
import re
from datetime import date

#: The GA4 property's reporting timezone. `event_date` is already in it;
#: `event_timestamp` is not (it is UTC microseconds).
REPORTING_TZ = "Asia/Tokyo"

#: Param/property keys are interpolated straight into SQL, so restrict them to
#: plain identifiers. Every key we use is a literal in our own source, but a
#: future caller passing user input should hit an error, not a query.
_IDENTIFIER = re.compile(r"^[a-z][a-z0-9_]*$")


def _check(key: str) -> str:
    if not _IDENTIFIER.match(key or ""):
        raise ValueError(
            f"Not a plain snake_case identifier: {key!r}. "
            "Param keys are interpolated into SQL and must not be caller-supplied text."
        )
    return key


def param_string(key: str) -> str:
    """A string event param."""
    return (
        f"(SELECT value.string_value FROM UNNEST(event_params) "
        f"WHERE key = '{_check(key)}')"
    )


def param_bool(key: str) -> str:
    """A boolean event param.

    Booleans arrive in `int_value` as 0/1 — measured on `granted`, `cancelled`,
    `urge_resolved`, `success`. There is no boolean column in the export.
    """
    return (
        f"(SELECT value.int_value FROM UNNEST(event_params) "
        f"WHERE key = '{_check(key)}')"
    )


def param_number(key: str) -> str:
    """A numeric event param, as INT64, regardless of which column it landed in.

    ⚠️ The React Native Firebase SDK ships every JS `number` as a double, so an
    integer-looking param is in `double_value`, not `int_value`. Measured
    2026-08-08: `step_index` had 944 rows in `double_value` and 0 in
    `int_value`. A query reading only `int_value` returns an empty funnel and
    no error — which is exactly what happened before this helper existed.

    `int_value` is still read first so a future native integer keeps working.
    """
    _check(key)
    return (
        f"CAST(COALESCE("
        f"(SELECT value.int_value FROM UNNEST(event_params) WHERE key = '{key}'), "
        f"CAST((SELECT value.double_value FROM UNNEST(event_params) "
        f"WHERE key = '{key}') AS INT64)"
        f") AS INT64)"
    )


def user_property_string(key: str) -> str:
    """A string user property.

    `user_properties` is a different array from `event_params`. Reading a user
    property out of `event_params` yields NULL on every row, silently.
    """
    return (
        f"(SELECT value.string_value FROM UNNEST(user_properties) "
        f"WHERE key = '{_check(key)}')"
    )


# --- Time -------------------------------------------------------------------
#
# `event_date` is a YYYYMMDD string already in the property timezone (JST) —
# verified 2026-08-08 by comparing it against both UTC and JST renderings of
# `event_timestamp`: it matched JST on every row that straddled midnight.
# So dates are parsed, never re-converted; only timestamps are converted.

EVENT_DATE_JST = "PARSE_DATE('%Y%m%d', event_date)"

EVENT_TS_JST = f"TIMESTAMP_MICROS(event_timestamp)"

#: Hour of day 0-23, local. Reading the raw UTC hour would move Japanese
#: late-night usage — the pattern this app most needs to see — into the afternoon.
EVENT_HOUR_JST = (
    f"EXTRACT(HOUR FROM TIMESTAMP_MICROS(event_timestamp) AT TIME ZONE '{REPORTING_TZ}')"
)

#: Day of week as 1=Sunday … 7=Saturday (BigQuery's DAYOFWEEK convention).
EVENT_WEEKDAY_JST = (
    f"EXTRACT(DAYOFWEEK FROM TIMESTAMP_MICROS(event_timestamp) "
    f"AT TIME ZONE '{REPORTING_TZ}')"
)


# --- Install date -----------------------------------------------------------

#: The device's install date, from the export rather than from the app.
#:
#: `user_first_touch_timestamp` is populated on 100% of rows (measured
#: 4,273/4,273 across all 47 devices, reaching back to 2026-03-26), and it is
#: retroactive — unlike the app's `days_since_install` param, which only exists
#: on `app_open` and was measured wrong: it reported 0 on a device 52 days past
#: install, because the local install date is seeded at first launch of a new
#: version rather than at true install.
#:
#: Caveat it does share with `user_pseudo_id`: it resets on reinstall.
INSTALL_DATE = f"DATE(TIMESTAMP_MICROS(user_first_touch_timestamp), '{REPORTING_TZ}')"

DAYS_SINCE_INSTALL = (
    f"DATE_DIFF(PARSE_DATE('%Y%m%d', event_date), {INSTALL_DATE}, DAY)"
)


# --- Scan control -----------------------------------------------------------


def table_suffix_between(start: date, end: date) -> str:
    """A `_TABLE_SUFFIX` predicate bounding the `events_*` wildcard scan.

    Two jobs. Cost: an unbounded wildcard scans every daily table, which is
    cheap at today's 4k rows and will not stay cheap. Correctness: the suffix
    range only matches 8-digit dates, so an `events_intraday_YYYYMMDD` table
    cannot join the scan and double-count a day. Streaming export is currently
    off, but turning it on should not silently inflate every number.

    Raises:
        ValueError: when ``end`` precedes ``start``.
    """
    if end < start:
        raise ValueError(f"end ({end}) is before start ({start})")
    return (
        f"_TABLE_SUFFIX BETWEEN '{start.strftime('%Y%m%d')}' "
        f"AND '{end.strftime('%Y%m%d')}'"
    )
