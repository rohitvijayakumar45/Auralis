# Auralis API

Express API for the AWS-backed Auralis photo gallery.

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill Cognito, S3, and RDS values.
3. Run the schema in `src/db/schema.sql` against RDS MySQL.
4. Start the API:

```bash
npm install
npm run dev
```

## AWS responsibilities

- Cognito authenticates users and issues JWTs.
- Express verifies Cognito JWTs with the Cognito JWKS endpoint.
- S3 stores originals and thumbnails privately.
- Lambda should listen to original-object uploads and write thumbnail WebP files.
- RDS MySQL stores metadata, favorites, archive/delete flags, albums, and users.
- EC2 can run this API behind nginx while serving the built frontend.
