# AWS Setup Runbook

This repository now contains the code paths that can be wired to AWS. You still need to create the cloud resources and fill `.env` values.

## 1. Local modes

Frontend mock mode:

```bash
copy .env.example .env
npm install
npm run dev -- --host 127.0.0.1 --port 5180
```

Frontend AWS mode:

```env
VITE_DATA_ADAPTER=aws
VITE_API_URL=http://127.0.0.1:4000
```

Backend:

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

## 2. Cognito

Create a User Pool and App Client.

Required settings:

- Email sign-in enabled.
- App client has no client secret.
- `USER_PASSWORD_AUTH` enabled if using the included `/auth/login` route.
- Email verification enabled or manually confirm test users.

Put these in `server/.env`:

```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=...
COGNITO_APP_CLIENT_ID=...
```

## 3. S3

Create two private buckets:

```text
auralis-originals-<unique>
auralis-thumbnails-<unique>
```

Add CORS to originals bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["http://127.0.0.1:5180"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Put bucket names in `server/.env`.

## 4. RDS MySQL

Create an RDS MySQL instance in the same VPC as the future EC2 instance.

Run:

```sql
SOURCE server/src/db/schema.sql;
```

Or paste the SQL from `server/src/db/schema.sql` into a MySQL client.

Put DB values in `server/.env`.

## 5. Lambda thumbnails

Create Lambda:

- Runtime: Node.js 20 or newer.
- Handler: `index.handler`.
- Env:

```env
THUMBNAILS_BUCKET=auralis-thumbnails-<unique>
THUMBNAIL_WIDTH=720
```

Build package:

```bash
cd lambda/thumbnail
npm install
npm run package
```

Upload `thumbnail-lambda.zip`. The package script creates a clean staging directory and runs `npm ci --omit=dev --os=linux --cpu=x64 --libc=glibc` so Sharp includes AWS Lambda Linux x64 binaries even when packaged from Windows.

Add S3 trigger:

```text
Bucket: auralis-originals-<unique>
Event: ObjectCreated
Prefix: users/
Suffix: .jpg, .jpeg, .png, or .webp
```

IAM permissions for Lambda:

```text
s3:GetObject on originals bucket
s3:PutObject on thumbnails bucket
logs:CreateLogGroup
logs:CreateLogStream
logs:PutLogEvents
```

## 6. EC2

On Ubuntu EC2:

```bash
sudo apt update
sudo apt install -y nginx nodejs npm
sudo npm install -g pm2
```

Deploy frontend:

```bash
npm install
npm run build
sudo mkdir -p /var/www/auralis
sudo cp -r dist/* /var/www/auralis/
```

Deploy API:

```bash
cd server
npm install
npm run build
pm2 start dist/index.js --name auralis-api
pm2 save
```

Nginx should serve `/var/www/auralis` and proxy `/api` or API subdomain traffic to `127.0.0.1:4000`.

## 7. Acceptance checks

- `npm test`
- `npm run lint`
- `npm run build`
- `cd server && npm test`
- `cd server && npm run build`
- Signup/login through Cognito.
- `GET /auth/me` returns the synced user.
- Upload creates original S3 object.
- Lambda creates thumbnail object.
- `/uploads/complete` creates RDS metadata.
- Gallery lists RDS photos through Express.
