# Twilio Setup Guide

This app uses Twilio for phone verification authentication. You'll need to set up the following environment variables:

## Required Environment Variables

```bash
# Twilio Account Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Setup Steps

### 1. Create Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### 2. Get Account Credentials

1. In the Twilio Console, go to Account > API Keys & Tokens
2. Copy your Account SID and Auth Token
3. Set these as `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

### 3. Create Verify Service

1. In the Twilio Console, go to Verify > Services
2. Click "Create Service"
3. Name it "GO Train Group Pass"
4. Copy the Service SID and set as `TWILIO_VERIFY_SERVICE_SID`

### 4. Get Phone Number

1. In the Twilio Console, go to Phone Numbers > Manage > Active Numbers
2. Buy a phone number or use the trial number
3. Copy the phone number and set as `TWILIO_PHONE_NUMBER`

### 5. Configure Environment Variables

Add the environment variables to your deployment platform (Vercel, Railway, etc.) or create a `.env.local` file:

```bash
# .env.local
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Testing

Once configured, users can:

1. Enter their phone number on the login page
2. Receive an SMS with a verification code
3. Enter the code to sign in
4. Set their display name for the group

## Troubleshooting

- **"Service not found"**: Check that `TWILIO_VERIFY_SERVICE_SID` is correct
- **"Invalid phone number"**: Ensure phone numbers are in E.164 format (+1234567890)
- **"SMS not received"**: Check that `TWILIO_PHONE_NUMBER` is valid and verified
- **"Authentication failed"**: Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
