# Issue Tracking - GO Train Group Pass App

## Completed Issues ✅

### Issue #1: Departed Trips Filtering
- **Status**: ✅ Completed
- **Date**: 2025-10-09
- **Description**: Departed trips should not appear as available to join, but users should still see their joined trips
- **Solution**: 
  - Added `trips.myTrips` endpoint to fetch user's joined trips (including departed)
  - Updated `trips.list` to filter out departed trips
  - Modified `/today` page to show two sections: "Your Trips" and "Available to Join"
- **Files Changed**: `server/routers/trips.ts`, `app/today/page.tsx`
- **Commit**: `8efe1b8`

### Issue #2: Trip Sorting by Departure Time
- **Status**: ✅ Completed
- **Date**: 2025-10-09
- **Description**: Trips should be sorted by departure time within each date
- **Solution**:
  - Added `.order('train(departure_time)')` to database queries
  - Added client-side sorting as backup
  - Applied to both available trips and user's joined trips
- **Files Changed**: `server/routers/trips.ts`
- **Commit**: `e044e94`

### Issue #3: Direct Train Route Validation
- **Status**: ✅ Completed
- **Date**: 2025-10-09
- **Description**: Only direct train routes (no bus transfers) should be supported for group passes
- **Solution**:
  - Added validation to `trips.list`, `trips.myTrips`, `trips.join`, and `trips.leave`
  - Routes must be outbound to Union Station without bus connections
  - Clear error messages for invalid routes
- **Files Changed**: `server/routers/trips.ts`
- **Commit**: `a76e39f`

## Open Issues 🔄

### Issue #4: User Profile Authentication Error
- **Status**: 🔄 Open
- **Priority**: High
- **Description**: Join functionality fails with "User profile not found for ID: d9f85de2-dc1f-4508-8af7-dbf70f0a0772"
- **Root Cause**: Mismatch between hardcoded test user ID and actual session user ID
- **Impact**: Users cannot join trips
- **Solution Needed**: 
  - Implement proper phone-based authentication via Twilio
  - Create user profiles automatically on first login
  - Remove hardcoded test user ID

### Issue #5: Authentication Bypass in Development
- **Status**: 🔄 Open
- **Priority**: Medium
- **Description**: Currently using hardcoded test user ID for development
- **Impact**: Not production-ready, security risk
- **Solution Needed**:
  - Implement Twilio phone verification
  - Remove development bypasses
  - Add proper session management

### Issue #6: Missing Return Trip Support
- **Status**: 🔄 Open
- **Priority**: Low
- **Description**: Currently only supports outbound trips (Kitchener → Union)
- **Impact**: Users cannot coordinate return trips
- **Solution Needed**:
  - Add inbound trip support
  - Update UI to show both directions
  - Modify group formation logic for return trips

## Technical Debt 📋

### Issue #7: Debug Logging Cleanup
- **Status**: ✅ Completed
- **Description**: Remove debug console.log statements from production code
- **Solution**: Cleaned up debug logging in `app/today/page.tsx` and `lib/trpc/Provider.tsx`

### Issue #8: Build Optimization
- **Status**: 🔄 Open
- **Description**: Webpack cache warnings and module not found errors
- **Impact**: Development server instability
- **Solution Needed**: Investigate and fix build cache issues

### Issue #9: Administrative Backend System
- **Status**: 🔄 Open
- **Priority**: Medium
- **Description**: Create admin dashboard for system monitoring and management
- **Impact**: Cannot monitor system health or manage basic operations
- **Solution Needed**: 
  - Admin authentication and access control
  - User management (view profiles, basic moderation)
  - Trip monitoring (view all trips, groups, memberships)
  - System analytics and reporting
  - Fare inspection alert monitoring
  - Database maintenance tools
  - Real-time system health monitoring

## Next Steps 🎯

1. **Immediate**: Fix user profile authentication error (Issue #4)
2. **Short-term**: Implement Twilio phone verification (Issue #5)
3. **Medium-term**: Add return trip support (Issue #6)
4. **Medium-term**: Build administrative backend system (Issue #9)
5. **Long-term**: Performance optimization and monitoring

---

**Last Updated**: 2025-10-09
**Maintainer**: Claude Code Assistant
