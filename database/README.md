# Local MySQL setup

Create a local database with `database/schema.sql`, then set `DATABASE_URL` in `.env.local`. The application uses a development in-memory adapter when that variable is absent, so the UI remains runnable without MySQL. Once configured, customer records, inquiries, contact messages, and admin-managed content use MySQL.

The optional MySQL driver is loaded only when `DATABASE_URL` exists. Install it in a deployment environment with `npm install mysql2` before enabling the database connection.
