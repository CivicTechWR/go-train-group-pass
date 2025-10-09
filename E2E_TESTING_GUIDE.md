# End-to-End Testing Guide

This guide provides comprehensive testing strategies for the GO Train Group Pass Coordination App.

## 🧪 Testing Strategy Overview

### 1. **Multi-User Testing**
Test the core group formation algorithm with multiple users joining trips simultaneously.

### 2. **Real-Time Features Testing**
Verify real-time updates, group rebalancing, and notifications work correctly.

### 3. **Payment Workflow Testing**
Test the complete steward workflow from pass upload to payment tracking.

### 4. **Edge Case Testing**
Test boundary conditions, error handling, and unusual scenarios.

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start the development server
npm run dev
```

### Basic Functionality Test
1. **Open the app**: Navigate to `http://localhost:3000/today`
2. **Verify schedule**: Check that real GO Transit times are displayed
3. **Test join/leave**: Click "Join Train" on a future trip
4. **Check real-time updates**: Verify the UI updates immediately

---

## 👥 Multi-User Testing

### Automated Multi-User Test
```bash
# Run the automated multi-user test
node test-e2e-multi-user.js
```

This script will:
- Create 10 test users
- Have them join the same trip
- Test group formation algorithm
- Verify real-time updates
- Check group rebalancing

### Manual Multi-User Testing
1. **Open multiple browser windows/tabs**
2. **Use different user accounts** (or incognito mode)
3. **Have users join the same trip simultaneously**
4. **Verify group formation and real-time updates**

---

## 🔄 Real-Time Features Testing

### Group Formation Testing
1. **Join a trip** with multiple users
2. **Verify groups are formed** according to the algorithm
3. **Check group numbers** are assigned correctly
4. **Verify group sizes** are optimized (4-5 people per group)

### Real-Time Updates Testing
1. **Open two browser windows** with different users
2. **Have one user join a trip**
3. **Verify the other window updates immediately**
4. **Test leaving trips** and verify updates

### Group Rebalancing Testing
1. **Create a group** with 5 people
2. **Have one person leave**
3. **Verify the group rebalances** to 4 people
4. **Check that group numbers are updated**

---

## 💳 Payment Workflow Testing

### Steward Workflow
1. **Join a trip as a user**
2. **Volunteer as steward** (click steward button)
3. **Upload pass screenshot** (test with sample image)
4. **Verify OCR extraction** works correctly
5. **Generate payment requests** for group members
6. **Test payment tracking** (mark payments as sent)

### Payment Tracking Testing
1. **Create a group** with multiple members
2. **Have steward upload pass**
3. **Test payment status updates** in real-time
4. **Verify payment reminders** are sent

---

## 🚨 Fare Inspection Alert Testing

### Alert System Testing
1. **Join a trip** with multiple users
2. **Trigger fare inspection alert** (test button)
3. **Verify push notifications** are sent
4. **Test SMS fallback** if push fails
5. **Check acknowledgment system** works

### Alert Rate Limiting Testing
1. **Try to send multiple alerts** quickly
2. **Verify rate limiting** prevents spam
3. **Check alert logging** for abuse detection

---

## 📱 Mobile Testing

### Responsive Design Testing
1. **Test on different screen sizes**:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)
2. **Verify navigation** works on mobile
3. **Test touch interactions** (buttons, forms)
4. **Check PWA functionality** (install prompt, offline mode)

### Mobile-Specific Features
1. **Test push notifications** on mobile devices
2. **Verify camera access** for pass uploads
3. **Test SMS functionality** for alerts

---

## 🔍 Edge Case Testing

### Boundary Conditions
1. **Test with 1 user** (solo rider)
2. **Test with 2 users** (minimum group)
3. **Test with 20+ users** (large groups)
4. **Test joining at exactly 30 minutes** before departure
5. **Test joining after cutoff time** (should fail)

### Error Handling
1. **Test with invalid trip IDs**
2. **Test with expired trips**
3. **Test with network failures**
4. **Test with invalid pass images**
5. **Test with OCR failures**

### Data Validation
1. **Test with invalid phone numbers**
2. **Test with invalid email addresses**
3. **Test with missing required fields**
4. **Test with oversized images**

---

## 🛠️ Performance Testing

### Load Testing
1. **Test with 100+ concurrent users**
2. **Monitor database performance**
3. **Check real-time update latency**
4. **Verify memory usage** stays reasonable

### Stress Testing
1. **Rapid join/leave operations**
2. **Multiple simultaneous alerts**
3. **Large group formations**
4. **Concurrent pass uploads**

---

## 🐛 Bug Testing

### Common Issues to Test
1. **Hydration mismatches** (server vs client rendering)
2. **Timezone issues** (date/time display)
3. **Race conditions** (concurrent operations)
4. **Memory leaks** (long-running sessions)
5. **State synchronization** (real-time updates)

### Regression Testing
1. **Test previously fixed bugs**
2. **Verify new features don't break existing functionality**
3. **Check performance hasn't degraded**

---

## 📊 Testing Tools

### Browser DevTools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls and performance
- **Application**: Check local storage and service workers
- **Performance**: Profile app performance

### Supabase Dashboard
- **Database**: Monitor query performance
- **Realtime**: Check subscription status
- **Auth**: Verify user authentication
- **Storage**: Check file uploads

### External Tools
- **Lighthouse**: Performance and accessibility testing
- **WebPageTest**: Load time analysis
- **GTmetrix**: Performance monitoring

---

## 📝 Test Documentation

### Test Cases
Document each test case with:
- **Test ID**: Unique identifier
- **Description**: What is being tested
- **Steps**: Detailed test steps
- **Expected Result**: What should happen
- **Actual Result**: What actually happened
- **Status**: Pass/Fail/Blocked

### Bug Reports
When reporting bugs, include:
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Browser/device information**
- **Console errors**
- **Screenshots/videos**

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Users can join/leave trips
- ✅ Groups form correctly (4-5 people)
- ✅ Real-time updates work
- ✅ Payment tracking functions
- ✅ Fare inspection alerts work
- ✅ Mobile experience is smooth

### Performance Requirements
- ✅ Page loads in <3 seconds
- ✅ Real-time updates in <1 second
- ✅ App works with 100+ concurrent users
- ✅ No memory leaks after 1 hour of use

### Quality Requirements
- ✅ No JavaScript errors in console
- ✅ All features work on mobile and desktop
- ✅ App is accessible (keyboard navigation, screen readers)
- ✅ Error messages are clear and helpful

---

## 🚀 Continuous Testing

### Automated Testing
- **Unit tests**: Test individual functions
- **Integration tests**: Test API endpoints
- **E2E tests**: Test complete user journeys
- **Performance tests**: Monitor app performance

### Manual Testing
- **Daily smoke tests**: Basic functionality
- **Weekly regression tests**: Full feature testing
- **Monthly user acceptance tests**: Real user scenarios

---

## 📞 Support and Reporting

### Getting Help
- **Documentation**: Check this guide and code comments
- **Issues**: Report bugs in Gitea issues
- **Discord**: Community support channel
- **Email**: support@gotraingroup.ca

### Contributing Tests
- **Add test cases** to this guide
- **Improve test scripts** in the repository
- **Share testing strategies** with the community
- **Report testing gaps** you discover

---

*This testing guide is a living document. Please update it as you discover new testing scenarios or improve existing tests.*
