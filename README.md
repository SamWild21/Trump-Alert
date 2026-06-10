# Truth Social Email Monitor

A Node.js service that polls CNN's Truth Social archive for Donald Trump's latest posts and sends a Gmail SMTP email alert when a new post appears.

The monitor stores the latest post ID in `STATE_FILE`, so restarts and redeploys do not resend duplicate alerts.

## Alert Format

Every alert email is plain text and uses only the source post's raw `created_at` and `content` fields.

```text
Subject: Trump Alert

Time: [created_at]
Content: [content]
```

The alert body does not include URL, ID, media, likes, replies, reblogs, JSON metadata, or any other fields.

## Source and Polling

The configured source is:

```text
https://ix.cnn.io/data/truth-social/truth_archive.json
```

The service polls every 300 seconds:

```env
POLL_INTERVAL_SECONDS=300
```

On the first run, the app saves the newest post ID without emailing, so old posts do not create alerts. Keep `SEND_INITIAL_ALERTS=false` for deployment.

## Environment Variables

Required:

| Variable | Value |
| --- | --- |
| `TRUTH_SOCIAL_SOURCE_URL` | `https://ix.cnn.io/data/truth-social/truth_archive.json` |
| `GMAIL_USER` | Gmail address used to send alerts. |
| `GMAIL_APP_PASSWORD` | Gmail app password, not your regular Google password. |
| `EMAIL_TO` | Recipient address. Use commas for multiple recipients. |
| `POLL_INTERVAL_SECONDS` | `300` |
| `STATE_FILE` | Local: `./data/state.json`; Render disk: `/var/data/state.json` |
| `SEND_INITIAL_ALERTS` | `false` |

Optional:

| Variable | Description |
| --- | --- |
| `EMAIL_FROM` | Optional sender display value. Defaults to `GMAIL_USER`. |
| `TRUTH_SOCIAL_AUTH_TOKEN` | Optional bearer token if the source ever requires one. |
| `PORT` | Optional locally. Render provides this automatically for web services. |

## Run Locally

Install dependencies:

```bash
npm install
```

Send a sample email using the same production alert format:

```bash
npm run test:email
```

Start the monitor:

```bash
npm start
```

Health check:

```bash
curl http://localhost:3000/healthz
```

Run tests:

```bash
npm test
```

## Render Deployment

Render web services build and deploy from a linked Git repository, use `npm install` as a common Node build command, and `npm start` as a common Node start command. Render web services must bind to `0.0.0.0` and should use the `PORT` environment variable; this app already does both. The included `render.yaml` also defines `/healthz` as the health check and mounts a persistent disk for the state file.

1. Push this project to GitHub.
2. In Render, choose **New > Blueprint** if you want to use `render.yaml`, or choose **New > Web Service** and connect the GitHub repo manually.
3. Use these settings if creating the service manually:

| Setting | Value |
| --- | --- |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/healthz` |

4. Add a persistent disk:

| Disk Setting | Value |
| --- | --- |
| Name | `monitor-state` |
| Mount Path | `/var/data` |
| Size | `1 GB` |

5. Add these Render environment variables:

```env
TRUTH_SOCIAL_SOURCE_URL=https://ix.cnn.io/data/truth-social/truth_archive.json
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
EMAIL_TO=recipient@example.com
POLL_INTERVAL_SECONDS=300
STATE_FILE=/var/data/state.json
SEND_INITIAL_ALERTS=false
```

Do not add your local `.env` file to GitHub. It is already listed in `.gitignore`.

6. Deploy the service.
7. Open the Render service URL and confirm `/healthz` returns `ok: true`.
8. Check logs for `Truth Social monitor started.` and `Initial checkpoint set to post ...`.

Official Render docs:

- https://render.com/docs/web-services
- https://render.com/docs/configure-environment-variables
- https://render.com/docs/disks

## Gmail SMTP Notes

Use a Gmail app password with 2-Step Verification enabled. Do not use your regular Google account password.

The test email command sends this sample body:

```text
Time: 2026-06-10T13:30:58.894Z
Content: Wow! CITI was ranked Number 1 in topping M&A Advisory Market by Value in Q1. Congratulations to Jane F and ALL of her great people. They've worked really hard! BIG comeback for CITI!!! President DONALD J. TRUMP
```
