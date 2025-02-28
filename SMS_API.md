# SMS Messaging API Documentation

This documentation covers the SMS functionality of the CRM system, including sending immediate and scheduled SMS messages.

## Prerequisites

Before using the SMS features, ensure you have:

1. **Twilio Account**: You need a Twilio account with:
   - Account SID
   - Auth Token
   - Twilio phone number for SMS

2. **Environment Configuration**: Set the following environment variables:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_SMS_NUMBER=your_twilio_sms_number
   ```

## API Endpoints

### Send Immediate SMS

#### Send a Single SMS

**Endpoint**: `POST /sms/send`

**Request Body**:
```json
{
  "to": "+1234567890",
  "body": "Hello! This is a test SMS from our CRM system.",
  "from": "+0987654321"  // Optional
}
```

#### Send Bulk SMS Messages

**Endpoint**: `POST /sms/bulk`

**Request Body**:
```json
{
  "recipients": [
    {
      "to": "+1234567890",
      "body": "Hello John! This is a personalized message for you."  // Optional
    },
    {
      "to": "+0987654321"  // Will use the default body
    }
  ],
  "body": "Hello! This is the default message that will be sent to all recipients without a personalized message.",
  "from": "+1112223333"  // Optional
}
```

### Send Template-Based SMS

#### Send a Single Template SMS

**Endpoint**: `POST /sms/send-template`

**Request Body**:
```json
{
  "to": "+1234567890",
  "templateId": "template-uuid",
  "variables": {
    "name": "John",
    "company": "ACME Corp",
    "date": "March 1, 2025"
  },
  "from": "+0987654321"  // Optional
}
```

#### Send Bulk Template SMS Messages

**Endpoint**: `POST /sms/bulk-template`

**Request Body**:
```json
{
  "recipients": [
    {
      "to": "+1234567890",
      "variables": {
        "name": "John",
        "company": "ACME Corp"
      }
    },
    {
      "to": "+0987654321",
      "variables": {
        "name": "Jane",
        "company": "XYZ Inc"
      }
    }
  ],
  "templateId": "template-uuid",
  "from": "+1112223333"  // Optional
}
```

### Schedule SMS Messages

#### Schedule a Single SMS

**Endpoint**: `POST /sms-schedule/schedule`

**Request Body**:
```json
{
  "to": "+1234567890",
  "body": "Hello! This is a scheduled SMS.",
  "from": "+0987654321",  // Optional
  "scheduledTime": "2025-03-01T09:00:00Z"  // ISO format date
}
```

#### Schedule a Template SMS

**Endpoint**: `POST /sms-schedule/schedule-template`

**Request Body**:
```json
{
  "to": "+1234567890",
  "templateId": "template-uuid",
  "variables": {
    "name": "John",
    "company": "ACME Corp"
  },
  "from": "+0987654321",  // Optional
  "scheduledTime": "2025-03-01T09:00:00Z"  // ISO format date
}
```

#### Schedule Bulk SMS

**Endpoint**: `POST /sms-schedule/bulk-schedule`

**Request Body**:
```json
{
  "recipients": [
    {
      "to": "+1234567890",
      "body": "Hello John! This is a personalized message for you."  // Optional
    },
    {
      "to": "+0987654321"  // Will use the default body
    }
  ],
  "body": "Hello! This is the default message.",
  "from": "+1112223333",  // Optional
  "scheduledTime": "2025-03-01T09:00:00Z"  // ISO format date
}
```

#### Schedule Bulk Template SMS

**Endpoint**: `POST /sms-schedule/bulk-schedule-template`

**Request Body**:
```json
{
  "recipients": [
    {
      "to": "+1234567890",
      "variables": {
        "name": "John",
        "company": "ACME Corp"
      }
    },
    {
      "to": "+0987654321",
      "variables": {
        "name": "Jane",
        "company": "XYZ Inc"
      }
    }
  ],
  "templateId": "template-uuid",
  "from": "+1112223333",  // Optional
  "scheduledTime": "2025-03-01T09:00:00Z"  // ISO format date
}
```

### Manage Scheduled Messages

#### Get Scheduled SMS Messages

**Endpoint**: `GET /sms-schedule`

**Query Parameters**:
- `status` (optional): Filter by status (PENDING, SENT, FAILED, CANCELLED)
- `messageType` (optional): Default is 'SMS'
- `limit` (optional): Maximum number of records to return
- `offset` (optional): Pagination offset

#### Cancel a Scheduled SMS

**Endpoint**: `DELETE /sms-schedule/:id`

### View SMS Logs

**Endpoint**: `GET /sms/logs`

**Query Parameters**:
- `to` (optional): Filter by recipient number
- `from` (optional): Filter by sender number
- `status` (optional): Filter by status
- `limit` (optional): Maximum number of records to return
- `offset` (optional): Pagination offset

## Response Format

All API endpoints return responses in the following format:

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Message Templates

For template-based messages, you'll need to create message templates first. A template contains placeholders that will be replaced with actual values when sending. For example:

```
Hello {{name}}, your appointment with {{company}} is scheduled for {{date}}.
```

You can create message templates using the `/message-templates` API endpoints (not documented here).

## Best Practices

1. **Phone Number Format**: Always use the E.164 format for phone numbers (e.g., +1234567890)
2. **Rate Limits**: Be aware of Twilio's rate limits for sending SMS messages
3. **Scheduled Messages**: Schedule messages at appropriate times considering recipients' time zones
4. **Template Variables**: Ensure all required template variables are provided when sending template-based messages
5. **Message Length**: Keep SMS messages under 160 characters when possible to avoid splitting into multiple messages

## Troubleshooting

Common issues and solutions:

1. **Message Failed**: Check that the recipient number is valid and can receive SMS
2. **Invalid Template**: Verify the template ID exists and all required variables are provided
3. **Authentication Errors**: Ensure your Twilio credentials are correct
4. **Rate Limit Exceeded**: If sending many messages, space them out or use bulk endpoints

For persistent issues, check the SMS logs endpoint to see detailed error information.