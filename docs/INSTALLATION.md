# Installation

## 1. Quick development start

1. Clone the repository.
2. You will need a working, local PostgreSQL database, to which you should import "./shared/database_schema.sql".
3. Git clone the Repository in a folder on your host OS.
4. Rename `.env.example` to `.env`., and edit the contents of the ".env" file, to connect to your database.
5. Edit the contents of the ".env" file to use your Google app credentials (see [Google OAuth setup](#9-google-oauth-setup)).
6. Run `npm install` and `npm run dev`, like for any other TypeScript app.
7. Open your browser at  `http://localhost:5000`.

## 2. Automated Docker installation

This is the recommended production-style installation. Docker Compose builds
the application image, starts PostgreSQL, imports the supplied schema on the
first database start, and restarts the services after a host reboot.

### Requirements

- Docker Engine 24+ and the Docker Compose plugin (`docker compose version`)
- Git
- A Google OAuth application if sign-in is required

### Install and configure

```bash
git clone https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer.git
cd ancient-greek-verse-to-music-composer
cp .env.example .env
chmod 600 .env
```

Edit the host-side `.env` file. It is supplied to the application only when
the container starts; it is excluded from the Docker build and is never baked
into the image. It uses the same `DATABASE_URL`, `PGDATABASE`, `PGHOST`,
`PGPORT`, `PGUSER`, and `PGPASSWORD` variables as a manual installation. For
Docker Compose, leave `PGHOST=db`. At minimum, replace the password in both
`PGPASSWORD` and `DATABASE_URL` with the **same** strong value and replace
`SESSION_SECRET` with a long random secret. If the database password contains
URL-reserved characters, percent-encode it in `DATABASE_URL`.

For a public deployment, set both URLs to the public HTTPS address, for
example:

```dotenv
CORS_ORIGIN=https://music.example.org
GOOGLE_CALLBACK_URL=https://music.example.org/auth/google/callback
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if Google login is wanted.
The callback URL must also be registered as an Authorized Redirect URI in the
Google Cloud Console. If those two values are blank, Google login is disabled
but the rest of the application remains available.

Start the complete installation:

```bash
docker compose up -d --build
docker compose logs -f app
```

For a local installation, open **`http://localhost:5000`** in a browser.
`0.0.0.0` is a server binding address, not a browser address. For a direct
connection to a remote server, use `http://SERVER_IP:5000`; this is suitable
only for controlled/internal access or initial testing. For an Internet-facing
deployment, a TLS reverse proxy and a real domain are strongly recommended;
use the domain URL rather than exposing port 5000 publicly.

Stop the log view with `Ctrl+C`; the containers keep running.

### Starting and stopping the Docker installation

The command-line method above is the normal method and works on Linux, macOS,
and Windows whenever Docker Engine and the Compose plugin are installed:

```bash
# Start both the app and database.
docker compose up -d

# Check service state and inspect app logs.
docker compose ps
docker compose logs -f app

# Stop both services while retaining the database volume and downloads.
docker compose down
```

**Optional Docker Desktop GUI:** The command line above remains the standard
method, especially on Linux. On systems using Docker Desktop, run `docker
compose up -d` once first; then select the
`ancient-greek-verse-midi-composer` **Compose project** in Docker Desktop and
use its project-level Play/Stop controls to start or stop the `app` and `db`
services together. Do not press Play on the application image by itself: that
starts only the app and omits PostgreSQL.

### Persistent files and routine updates

- The host `downloads/` directory is mounted at `/app/downloads`; generated
  MIDI and MusicXML files therefore survive application-container replacement.
- PostgreSQL data is stored in the named `postgres-data` volume.
- To change Google OAuth, the database password, or any other setting, edit
  the host `.env`, then apply it with:

  ```bash
  docker compose up -d --force-recreate app
  ```

- To update application code after `git pull`:

  ```bash
  docker compose up -d --build
  ```

`shared/database_schema.sql` is automatically imported only when
`postgres-data` is created for the first time. It intentionally drops existing
tables, so **never** manually run it against a populated database. Database
schema changes after the first install require a reviewed migration.

To remove the containers while keeping data, run `docker compose down`.
`docker compose down -v` also destroys the PostgreSQL volume and is only
appropriate when intentionally resetting all stored database data.

### Recommended production networking

The Compose setup exposes port 5000 for local testing. For a public service,
place Nginx or another TLS reverse proxy in front of it; this is strongly
recommended rather than optional. The proxy terminates HTTPS and forwards to
the Docker host's `localhost:5000`. Configure `CORS_ORIGIN` and
`GOOGLE_CALLBACK_URL` in `.env` with the public `https://` domain, then
register that same callback URL with Google OAuth.

## 3. Manual installation (tested on Debian/Ubuntu)

### 1. Initial Server Setup

Login to your server as root:

```bash
ssh root@your_server_ip
```

### 2. Install Dependencies

Update system and install PostgreSQL:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

### 3. Configure PostgreSQL

Create database and user:

```bash
sudo -u postgres psql
```

Then run these SQL commands:

```sql
CREATE DATABASE myappdb;
CREATE USER myappuser WITH ENCRYPTED PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE myappdb TO myappuser;
```

Update user password if needed:

```sql
ALTER USER myappuser WITH ENCRYPTED PASSWORD 'strongpassword';
```

Configure authentication by editing the config file:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add this line AFTER `local   all             all                                     peer`:

```
local   all             myappuser                               md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 4. Import Database Schema

Run as root to avoid permission issues:

```bash
sudo -u postgres
psql -d myappdb < ./shared/database_schema.sql
```

Then grant privileges:

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myappuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myappuser;
GRANT USAGE ON SCHEMA public TO myappuser;
```

### 5. Transfer Table Ownership

```bash
sudo -u postgres psql -d myappdb
```

Run this SQL block:

```sql
DO $$ DECLARE r RECORD;
BEGIN FOR r IN
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' LOOP
EXECUTE 'ALTER TABLE ' || quote_ident(tablename) || ' OWNER TO myappuser;';
END LOOP;
FOR r IN
SELECT sequence_name
FROM information_schema.sequences
WHERE sequence_schema = 'public' LOOP
EXECUTE 'ALTER SEQUENCE ' || quote_ident(sequence_name) || ' OWNER TO myappuser;';
END LOOP;
END$$;
```

### 6. Clone Repository

Create app directory and clone:

```bash
cd /var
mkdir www && cd www
git clone https://github.com/ChristosTsirkas/ancient-greek-verse-to-music-composer.git
cd ChristosTsirkas/ancient-greek-verse-to-music-composer
shopt -s dotglob nullglob && mv * .. && cd .. && rmdir ancient-greek-verse-to-music-composer
```

### 7. Install Application

```bash
npm install --ignore-scripts
npm install dotenv --ignore-scripts
npm rebuild esbuild bufferutil
npm audit
```

### 8. Configure Environment

Rename ".env.example" to ".env", and edit your .env file to match your configuration:

```bash
nano .env
```

Add your PostgreSQL credentials, Google API Client ID and secret, etc.

### 9. Google OAuth setup

In the `.env` file at the project root, set:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**`GOOGLE_CALLBACK_URL` (for user login support).**, default ``http://localhost:5000/auth/google/callback``

#### Google Cloud Console Setup

1. Go to APIs & Services → Credentials in the Google Cloud Console.
2. Create a new OAuth 2.0 Client ID (or edit an existing one):
   - Application type: Web Application
3. Configure Authorized Redirect URIs to match whatever
   `GOOGLE_CALLBACK_URL` is set to (or the default, if unset):
   - Production: your custom domain via `GOOGLE_CALLBACK_URL`
   - Development: `http://localhost:5000/auth/google/callback`
4. Save changes.
5. Copy the Client ID and Client Secret into your `.env` file.

#### Notes

- Remove any old or unnecessary redirect URIs in the Google Cloud
  Console to prevent conflicts.
- Include the localhost callback only for local development.
- If Google OAuth credentials aren't set, `setupGoogleAuth()` logs a
  warning and disables auth entirely rather than failing — see
  `server/auth/google.ts`.

### 10. Build and test the Application

```bash
npm run build
npm start
```

The app should be available on http://YOUR_SERVER_IP:5000

### 11. Configure Firewall

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 5000
ufw enable
```

### 12. Create System Service

Create service file:

```bash
sudo nano /etc/systemd/system/myapp.service
```

Add this content:

```ini
[Unit]
Description = Greek Music Composer
After = network.target

[Service]
User = root
WorkingDirectory = /var/www
ExecStart = /usr/bin/npm start
Restart = always
EnvironmentFile = /var/www/.env

[Install]
WantedBy = multi-user.target
```

### 13. Start System Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp
```

The app should be available on http://YOUR_SERVER_IP:5000

### 14. SSL Setup with Nginx (Optional)

#### Step 1: Generate Self-Signed Certificate

Replace YOUR_IP_OR_DOMAIN with your actual server IP or domain:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/ssl/private/selfsigned.key \
-out /etc/ssl/certs/selfsigned.crt \
-subj "/CN=YOUR_IP_OR_DOMAIN"
```

#### Step 2: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

#### Step 3: Configure Nginx

Edit the default config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace contents with (replace YOUR_IP_OR_DOMAIN with your actual IP or domain):

```nginx
server {
    listen 443 ssl;
    server_name YOUR_IP_OR_DOMAIN;

    ssl_certificate /etc/ssl/certs/selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/selfsigned.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name YOUR_IP;
    return 301 https://$host$request_uri;
}
```

#### Step 4: Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Update Firewall

```bash
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
```

#### Step 6: Block Direct Access to Port 5000

```bash
sudo ufw deny 5000/tcp
sudo iptables -F
```

Allow SSH first:

```bash
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

Allow HTTP and HTTPS:

```bash
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

Allow localhost access to port 5000:

```bash
sudo iptables -A INPUT -p tcp -s 127.0.0.1 --dport 5000 -j ACCEPT
```

Block all other external access to port 5000:

```bash
sudo iptables -A INPUT -p tcp --dport 5000 -j DROP
```

Verify rules:

```bash
sudo iptables -L -n
```

You should see:

- SSH, 80, 443 ACCEPT
- 5000 ACCEPT from 127.0.0.1 only
- 5000 DROP for everything else

The app will now be available at: https://YOUR_IP

Notes:

- Users will need to accept the self-signed certificate security warning in their browser.
- Ideally, you can use "certbot", in order to install a proper domain SSL certificate in Nginx; however, this is out of
  the scope of this installation guide.
