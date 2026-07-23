# Metrolinx Open Data Reference

This document covers all Metrolinx data sources available to this project, what each provides, and which parts are currently integrated vs. available for future use.

**Open Data portal:** https://www.metrolinx.com/en/about-us/open-data  
**API portal:** https://api.openmetrolinx.com/OpenDataAPI/  
**Contact:** OpenData.Program@metrolinx.com  
**License:** [Open Government Licence – Ontario – Metrolinx](https://www.metrolinx.com/en/about-us/open-data)

---

## Static GTFS Feeds

No API key required. These are direct ZIP downloads.

| Feed | URL | Approx. size | Updated |
|---|---|---|---|
| GO Transit GTFS | `https://assets.metrolinx.com/raw/upload/Documents/Metrolinx/Open%20Data/GO-GTFS.zip` | ~31 MB | Periodically (check ETag) |
| UP Express GTFS | `https://assets.metrolinx.com/raw/upload/Documents/Metrolinx/Open%20Data/UP-GTFS.zip` | ~900 KB | Periodically (check ETag) |

**GTFS files included:** `agency.txt`, `routes.txt`, `stops.txt`, `trips.txt`, `stop_times.txt`, `calendar_dates.txt`, `feed_info.txt`, `shapes.txt`

### Current integration

`GtfsService` downloads and imports the GO Transit feed on demand via `POST /gtfs/import`. It uses `If-None-Match` / `If-Modified-Since` headers for conditional fetching — if the feed hasn't changed, the import is skipped. See `backend/src/gtfs/gtfs.service.ts`.

The URL is configurable via the `GTFS_URL` environment variable (defaults to the GO Transit feed above).

---

## Metrolinx Real-Time API

**Base URL:** `https://api.openmetrolinx.com/OpenDataAPI`  
**Auth:** API key required as a query parameter — register at https://api.openmetrolinx.com/OpenDataAPI/Help/Registration/en (free, manual approval, up to 10 business days)  
**Formats:** All endpoints support `.json`, `.xml`, and `.proto` (GTFS-RT protobuf) — append to path or use `Accept` header

> **Rate limits:** Metrolinx reserves the right to impose limits at any time (ToS §6). Cache all real-time responses server-side; never call per-user-request. See issue #211 for the caching implementation plan.

### GTFS Real-Time (GO Transit)

Standard GTFS-RT feeds. Protobuf format is most efficient.

| Endpoint | Description | Relevant to this project |
|---|---|---|
| `GET api/V1/Gtfs/Feed/Alerts` | Service alerts (disruptions, notices) | Yes — #187 |
| `GET api/V1/Gtfs/Feed/TripUpdates` | Real-time arrival/departure updates, delays | Yes — #163, #187 |
| `GET api/V1/Gtfs/Feed/VehiclePosition` | Live vehicle positions | Lower priority |

### GTFS Real-Time (UP Express)

| Endpoint | Description |
|---|---|
| `GET api/V1/UP/Gtfs/Feed/Alerts` | UP Express service alerts |
| `GET api/V1/UP/Gtfs/Feed/TripUpdates` | UP Express trip updates |
| `GET api/V1/UP/Gtfs/Feed/VehiclePosition` | UP Express vehicle positions |

### Fleet & Consist

| Endpoint | Parameters | Description | Relevant to this project |
|---|---|---|---|
| `GET api/V1/Fleet/Consist/All` | — | All active train consists (ordered list of coach numbers per trip) | Yes — coach check-in (#67) |
| `GET api/V1/Fleet/Consist/Engine/{EngineNumber}` | `EngineNumber` | Consist for a specific locomotive | Yes — coach check-in (#67) |
| `GET api/V1/Fleet/Occupancy/GtfsRT/Feed/VehiclePosition` | — | Vehicle positions with per-car occupancy data | Future enhancement |
| `GET api/V1/Fleet/Occupancy/GtfsRT/Feed/TripUpdates` | — | Trip updates with occupancy | Future enhancement |
| `GET api/V1/Fleet/Occupancy/GtfsRT/Feed/Alerts` | — | Alerts with occupancy context | Future enhancement |

### Service Updates (legacy REST)

Human-readable service status. The GTFS-RT alerts feed above is preferred for programmatic use.

| Endpoint | Parameters | Description |
|---|---|---|
| `GET api/V1/ServiceUpdate/ServiceAlert/All` | — | Service alerts by date |
| `GET api/V1/ServiceUpdate/InformationAlert/All` | — | Informational alerts |
| `GET api/V1/ServiceUpdate/Exceptions/All` | — | Cancelled trips and stops |
| `GET api/V1/ServiceUpdate/Exceptions/Train` | — | Train-specific exceptions |
| `GET api/V1/ServiceUpdate/UnionDepartures/All` | — | Nearest Union Station departures |
| `GET api/V1/ServiceUpdate/ServiceGuarantee/{TripNumber}/{OperationalDay}` | `TripNumber`, `OperationalDay` | Trip details for a specific day |

### Schedule (legacy REST)

Schedule queries using Metrolinx stop codes. The static GTFS feed is preferred for bulk schedule data.

| Endpoint | Parameters | Description |
|---|---|---|
| `GET api/V1/Schedule/Journey/{Date}/{FromStopCode}/{ToStopCode}/{StartTime}/{MaxJourney}` | Date, stop codes, time, max results | Full journey planner including transfers |
| `GET api/V1/Schedule/Line/All/{Date}` | `Date` | All lines in service on a given date |
| `GET api/V1/Schedule/Trip/{Date}/{TripNumber}` | `Date`, `TripNumber` | All stops for a trip on a given date |

### Stop Data

| Endpoint | Parameters | Description |
|---|---|---|
| `GET api/V1/Stop/NextService/{StopCode}` | `StopCode` | Next arrivals at a stop across all lines |
| `GET api/V1/Stop/All` | — | All stops |
| `GET api/V1/Stop/Destinations/{StopCode}/{FromTime}/{ToTime}` | `StopCode`, time range | Destinations from a stop in a time window |

### Fares

| Endpoint | Parameters | Description |
|---|---|---|
| `GET api/V1/Fares/{FromStopCode}/{ToStopCode}` | Stop codes | All fare types between two stations |
| `GET api/V1/Fares/{FromStopCode}/{ToStopCode}/{OperationalDay}` | Stop codes, date | Fares for a specific operational day |

### Service At Glance

| Endpoint | Description |
|---|---|
| `GET api/V1/ServiceataGlance/Trains/All` | All currently in-service train trips |
| `GET api/V1/ServiceataGlance/Buses/All` | All currently in-service bus trips |
| `GET api/V1/ServiceataGlance/UPX/All` | All currently in-service UP Express trips |

---

## Other Static Datasets

Available via the open data portal (no API key required):

| Dataset | Format | Notes |
|---|---|---|
| Frequent Rapid Transit Network Shapefile | Shapefile | GIS data for rapid transit corridors |
| GO Rail Parking & Utilization | — | Station parking capacity and usage |
| Fiscal Year-To-Date Ridership (Archived) | — | Historical ridership data |

---

## What This Project Uses

| Source | Status | Where |
|---|---|---|
| GO Transit GTFS (static) | **Integrated** | `GtfsService`, all GTFS entities |
| Metrolinx API — Fleet Consist | **Pending** (API key requested) | #67 — coach check-in feature |
| Metrolinx API — GTFS-RT Alerts | **Planned** | #187, #211 |
| Metrolinx API — GTFS-RT TripUpdates | **Planned** | #163, #187, #211 |
| UP Express GTFS | Not integrated | Could be added via `GTFS_URL` env var |

---

## API Terms of Use Summary

Key obligations from the [API Access and Use Agreement](https://api.openmetrolinx.com/OpenDataAPI/Help/Index/en):

- **No redistribution** — do not expose Metrolinx data through your own public API or feed (§7a). All trip schedule endpoints must be behind authentication — see PR #215.
- **No GO Transit branding** — the app must not use GO Transit logos, trademarks, or brand colours, and must not imply official affiliation (§4). See issue #210.
- **Cache responses** — rate limits may be imposed at Metrolinx's discretion (§6). Server-side caching is required before the real-time API goes live. See issue #211.
- **Data accuracy disclaimer** — data is provided "as is"; do not make reliability guarantees to users (§9).
- **Press releases** — any public announcement mentioning GO Transit requires prior written consent from Metrolinx (§5).

Full terms: https://api.openmetrolinx.com/OpenDataAPI/Help/Index/en
