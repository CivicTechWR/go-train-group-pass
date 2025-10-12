# Changelog

All notable changes to the GO Train Group Pass project will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the CivicTechWR template guidelines.

## [Unreleased]

- Align repository layout with the CivicTechWR project template.
- Introduce shared logger and security hardening across API routes.
- Gate `/today-demo` behind `NEXT_PUBLIC_ENABLE_DEMO_PAGE`.
- Migrate legacy Week 2 documentation into `docs/legacy/`.

## [0.1.0] – 2024-12-01

- Initial prototype with Supabase-backed trip coordination.
- Admin endpoints for seeding trains, trips, and users.
- Steward workflows for pass uploads and payment tracking.
