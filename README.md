# AWS Serverless Event-Driven Architecture Console (React + Vite)

A modern, high-performance web application designed as the frontend for an AWS Serverless Event-Driven processing pipeline. Built with **React 18**, **Vite**, **vanilla CSS**, and modern cloud console aesthetics.

---

## Architecture Overview

```
[React / Vite Frontend]
       |
       +---> [Amazon Cognito User Pool] (Authentication & JWT Issuance)
       |
       v  (HTTPS POST with Bearer Token)
[AWS Lambda Function URL] (Ingress & Validation)
       |
       v
[Amazon EventBridge Custom Bus] (Decoupled Event Routing)
       |
       +---> [SQS FIFO Queue] ---> [Worker Lambda Function] ---> [DynamoDB / S3]
```

---

## Quick Start & Terminal Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Update `.env` with your AWS Lambda Function URL and Cognito credentials when ready:
```env
VITE_LAMBDA_FUNCTION_URL=https://your-lambda-id.lambda-url.us-east-1.on.aws/
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## AWS Integration Guide

### 1. Connecting AWS Lambda Function URL
In `src/services/jobService.js`, the app inspects `VITE_LAMBDA_FUNCTION_URL`:
- If specified, `submitDataProcessingJob()` makes a real HTTP `fetch` request passing your JSON payload and the Cognito `Bearer` token in the `Authorization` header.
- If omitted, the app simulates realistic cloud network latency (800ms) and creates a mock EventBridge job response with state progression (`PENDING` → `PROCESSING` → `COMPLETED`).

**Important Lambda Configuration:**
- In your AWS Lambda Function URL configuration:
  - **Auth type:** `NONE` (if using custom Cognito JWT verification inside the Lambda) or `AWS_IAM`.
  - **CORS:** Enable CORS with `Allow-Origin: *` (or your domain), `Allow-Methods: POST, OPTIONS`, and `Allow-Headers: content-type, authorization`.

### 2. Connecting Amazon Cognito
To swap the mock authentication in `src/components/Auth.jsx` with live Amazon Cognito:
```bash
npm install aws-amplify @aws-amplify/auth
```
Configure Amplify in `src/main.jsx`:
```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});
```
Then in `src/components/Auth.jsx`, replace mock toggle with `signIn({ username, password })`.

---

## Project Structure

```
aws-project/
├── .env.example               # Template for AWS endpoints
├── .gitignore                 # Standard git ignore rules
├── index.html                 # HTML shell with Inter & JetBrains Mono fonts
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration with React plugin
├── src/
│   ├── App.jsx                # Main application state & toast container
│   ├── index.css              # AWS cloud console design system & styles
│   ├── main.jsx               # React DOM entry point
│   ├── components/
│   │   ├── ArchitectureBanner.jsx # Collapsible event pipeline diagram
│   │   ├── Auth.jsx           # Amazon Cognito login screen placeholder
│   │   ├── Dashboard.jsx      # Metrics overview and 2-column layout
│   │   ├── JobSubmitForm.jsx  # JSON payload editor with validation & async submit
│   │   ├── JobTable.jsx       # Event status table, search, filter & modal
│   │   └── Navbar.jsx         # Header with region badge and Cognito profile
│   ├── services/
│   │   └── jobService.js      # Lambda Function URL fetch & mock fallback
│   └── utils/
│       └── mockData.js        # Seed payloads (Image, Order, IoT telemetry)
```
