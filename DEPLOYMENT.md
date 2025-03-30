# Delta Flight Tracker Web Application Deployment Guide

This guide provides instructions for deploying the Delta Flight Tracker web application to Cloudflare for permanent hosting.

## Prerequisites

Before deploying, ensure you have the following:

1. A Cloudflare account
2. Cloudflare API token with appropriate permissions
3. Node.js 20.x or later installed
4. Git installed

## Local Setup and Testing

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/delta-flight-tracker.git
   cd delta-flight-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   # API Keys
   FLIGHTLABS_API_KEY=your_flightlabs_api_key
   SERPAPI_API_KEY=your_serpapi_api_key
   
   # Email Configuration
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_username
   SMTP_PASSWORD=your_smtp_password
   EMAIL_FROM=notifications@deltaflighttracker.com
   
   # SMS Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_FROM_NUMBER=your_twilio_phone_number
   
   # Security
   JWT_SECRET=your_jwt_secret
   CRON_SECRET=your_cron_secret
   
   # Base URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Initialize the database:
   ```bash
   npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Run tests:
   ```bash
   npm test
   ```

## Manual Deployment to Cloudflare

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy ./out --project-name=delta-flight-tracker
   ```

3. Set up environment variables in Cloudflare:
   - Go to the Cloudflare Dashboard
   - Navigate to Workers & Pages > delta-flight-tracker
   - Go to Settings > Environment variables
   - Add all the environment variables from your `.env.local` file

4. Set up D1 Database in Cloudflare:
   - Create a D1 database in Cloudflare Dashboard
   - Update the `wrangler.toml` file with your database ID
   - Deploy the database schema:
     ```bash
     npx wrangler d1 migrations apply DB
     ```

5. Set up Cron Triggers:
   - Go to the Cloudflare Dashboard
   - Navigate to Workers & Pages > delta-flight-tracker
   - Go to Triggers > Cron Triggers
   - Add the following triggers:
     - `0 */12 * * *` (every 12 hours) for price checking
     - `0 */1 * * *` (every hour) for processing ecredit requests

## Automated Deployment with GitHub Actions

The repository includes a GitHub Actions workflow that automatically deploys the application to Cloudflare Pages when changes are pushed to the main branch.

To set up automated deployment:

1. Fork or push the repository to GitHub
2. Add the following secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token

3. Push changes to the main branch to trigger deployment

## Accessing the Deployed Application

Once deployed, your application will be available at:
- https://delta-flight-tracker.pages.dev

## Troubleshooting

If you encounter issues during deployment:

1. Check the Cloudflare deployment logs
2. Verify that all environment variables are correctly set
3. Ensure the D1 database is properly configured
4. Check that the cron triggers are set up correctly

For additional help, refer to the Cloudflare documentation or contact support.
