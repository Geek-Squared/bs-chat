# Using AWS SES Email Service with Postman

This guide explains how to send emails through our AWS SES service using Postman.

## Prerequisites

- [Postman](https://www.postman.com/downloads/) installed
- AWS SES credentials (see below)
- API base URL (e.g., `http://localhost:3000` for local testing)

## AWS SES Credentials Setup

Before using the email service, you'll need AWS credentials:

1. **Get AWS Credentials**: Contact your system administrator to get:
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Region (defaults to `us-east-1`)
   - SES From Email (sender email address)

2. **Verify Domain/Email**: Ensure your sending domain or email is verified in AWS SES.

## Available Endpoints

All endpoints accept JSON payloads and return JSON responses.

### Send Individual Email

**Endpoint**: `POST /aws-email/send`

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "htmlBody": "<h1>Hello World</h1><p>This is a test email sent via AWS SES</p>",
  "textBody": "Hello World. This is a test email sent via AWS SES." 
}
```

### Send Templated Email

**Endpoint**: `POST /aws-email/send-template`

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "templateName": "WelcomeTemplate",
  "templateData": {
    "name": "John Doe",
    "companyName": "ACME Corp"
  }
}
```

### Send Bulk Templated Emails

**Endpoint**: `POST /aws-email/bulk-template`

**Request Body**:
```json
{
  "templateName": "WelcomeTemplate",
  "recipients": [
    {
      "to": "recipient1@example.com",
      "templateData": {
        "name": "John Doe",
        "companyName": "ACME Corp"
      }
    },
    {
      "to": "recipient2@example.com",
      "templateData": {
        "name": "Jane Smith",
        "companyName": "ACME Corp"
      }
    }
  ]
}
```

### Send Bulk Emails

**Endpoint**: `POST /aws-email/bulk`

**Request Body**:
```json
{
  "recipients": [
    {
      "to": "recipient1@example.com",
      "subject": "Test Email 1",
      "htmlBody": "<h1>Hello Recipient 1</h1><p>This is a test email sent via AWS SES</p>",
      "textBody": "Hello Recipient 1. This is a test email sent via AWS SES."
    },
    {
      "to": "recipient2@example.com",
      "subject": "Test Email 2",
      "htmlBody": "<h1>Hello Recipient 2</h1><p>This is a test email sent via AWS SES</p>",
      "textBody": "Hello Recipient 2. This is a test email sent via AWS SES."
    }
  ]
}
```

## Postman Setup

1. **Create a new request**:
   - Set request type to `POST`
   - Enter the full URL (e.g., `http://localhost:3000/aws-email/send`)
   - Go to the "Headers" tab and add:
     ```
     Content-Type: application/json
     ```

2. **Add request body**:
   - Go to the "Body" tab
   - Select "raw" and "JSON" format
   - Enter your JSON payload (examples above)

3. **Send the request**:
   - Click "Send" to execute the request
   - Check the response for success or error messages

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "messageId": "0102018abc123def-12345678-90ab-cdef-1234-567890abcdef-000000"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Error details here"
}
```

## Troubleshooting

1. **Authentication Errors**: Ensure AWS credentials are properly configured on the server.
2. **Invalid Parameters**: Check that your request payload matches the required format.
3. **Rate Limiting**: AWS SES has sending limits that may affect bulk operations.
4. **Email Not Received**: Check spam folders and verify that the destination email is not on the SES bounce list.

## Email Tracking

You can track email delivery status using the email logs endpoint:

**Endpoint**: `GET /email-logs`

**Query Parameters**:
- `email` (optional): Filter by recipient email
- `status` (optional): Filter by email status

## Need Help?

Contact the development team for assistance with API integration or AWS SES configuration.