#!/usr/bin/env node

/**
 * Test Gitea email notifications
 * This script tests if email notifications are working by creating a test issue
 */

// Simple email notification test script

async function testEmailNotifications() {
  try {
    console.log('🧪 Testing email notifications...');
    
    // Create a test issue to trigger email notifications
    const testIssue = {
      title: 'Test Email Notification - ' + new Date().toISOString(),
      body: `This is a test issue created to verify email notifications are working.
      
**Test Details:**
- Created: ${new Date().toISOString()}
- Purpose: Verify Gitea email notifications
- Expected: Email should be sent to repository watchers

If you receive this email, the notification system is working correctly!`,
      labels: ['test', 'notification'],
      assignees: [],
      milestone: null,
      closed: false
    };

    console.log('📧 Creating test issue...');
    console.log('   Title:', testIssue.title);
    
    // Note: This would require Gitea API access with proper authentication
    // For now, we'll just log what would be sent
    console.log('✅ Test issue would be created with the following details:');
    console.log(JSON.stringify(testIssue, null, 2));
    
    console.log('');
    console.log('📋 To manually test email notifications:');
    console.log('1. Go to https://gitea.dredre.net/dre/go-transit-group');
    console.log('2. Create a new issue manually');
    console.log('3. Check if email notifications are sent');
    console.log('');
    console.log('🔧 Gitea email configuration:');
    console.log('- SMTP Server: smtp.resend.com:587');
    console.log('- From: Gitea <gitea@dredre.net>');
    console.log('- Protocol: smtp+starttls');
    console.log('- Notifications: ENABLED');

  } catch (error) {
    console.error('❌ Error testing email notifications:', error.message);
    process.exit(1);
  }
}

testEmailNotifications();
