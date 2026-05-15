# Lottery - Lotomania Results App

A Node.js web application that displays Brazilian Lotomania lottery results with real-time data synchronization and PDF export functionality.

## Features

- 📊 **Live Lottery Data** — Fetches latest Lotomania results from official Caixa API
- 🗄️ **Local SQLite Database** — Stores draw history for fast access
- 📄 **PDF Export** — Generate and download lottery results as PDF
- 🔄 **Auto Sync** — Automatically syncs database with latest API data
- 🎨 **Web Interface** — Clean EJS template-based UI with Express.js
- 📱 **Responsive Design** — Works on desktop and mobile browsers

## Tech Stack

- **Runtime:** Node.js v20+
- **Framework:** Express.js 4.x
- **Database:** SQLite (better-sqlite3)
- **HTTP Client:** Axios 1.16+
- **Template Engine:** EJS 3.x
- **PDF Generation:** Puppeteer 24.x
- **Dev Tool:** Nodemon

## Installation

### Prerequisites
- Node.js v20 or higher
- npm

### Setup

```bash
# Clone or navigate to project
cd Lottery

# Install dependencies
npm install

# Create environment file (optional)
cp .env_sample .env

# Start development server
npm start
```

The app will start on **http://localhost:3000**

## Usage

### View Lottery Results
```
http://localhost:3000/lotomania
```
Displays the last 25 Lotomania draws with:
- Draw number and date
- Numbers grouped by quadrants (G1-G25)
- Number of winning groups

### Download PDF
```
http://localhost:3000/download
```
Generates and downloads a formatted PDF of the lottery results.

## Environment Variables

Optional configuration in `.env`:

```env
# For production
NODE_ENV=production
APP_URL=https://your-domain.com

# For development (default)
NODE_ENV=development
LOTTERY_API_TOKEN=your_api_token_here
```

**Note:** For the Caixa API, no token is required. The `LOTTERY_API_TOKEN` is optional for custom API endpoints.

## Project Structure

```
Lottery/
├── index.js              # Express server & routes
├── db.js                 # SQLite database operations
├── api.js                # Caixa API client
├── helpers.js            # Sync & data processing utilities
├── package.json          # Project dependencies
├── lottery.db            # SQLite database (auto-created)
├── public/               # Static files
│   └── table.pdf         # Generated PDF
└── views/
    └── table.ejs         # Lottery results template
```

## API Integration

The app fetches data from the **Caixa Lottery API**:
- **Endpoint:** `https://servicebus2.caixa.gov.br/portaldeloterias/api/`
- **Lottery Code:** `lotomania`
- **Data:** Draw numbers, dates, winning numbers, prizes

### Key API Functions

**`apiGetDrawings(drawNumber)`**
- Get results for a specific draw
- Returns: Full draw data (numbers, prizes, dates)

**`apiGetLastResult()`**
- Get the latest draw number
- Returns: Current draw number

## Database Schema

**Table: `lotomania`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `draw_number` | INTEGER | Unique draw identifier |
| `draw_date` | TEXT | Draw date (DD/MM/YY) |
| `number_of_groups` | INTEGER | Count of winning groups |
| `drawing_tens` | TEXT | JSON of numbers grouped by quadrant |

## Development

### Run in Development Mode
```bash
npm start
```
Uses `nodemon` for auto-restart on file changes.

### Database
- SQLite database stores locally in `lottery.db`
- Auto-creates schema on first run
- Uses WAL (Write-Ahead Logging) for better concurrency

### PDF Generation
- Uses Puppeteer for headless Chrome rendering
- **Development:** Renders from `http://localhost:3000/lotomania`
- **Production:** Renders from configured `APP_URL`

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
APP_URL=https://your-production-url.com
```

### Database
The SQLite database persists locally. For multi-instance deployments, consider:
- Shared storage for `lottery.db`
- Or migrate to PostgreSQL/MySQL

### PDF Generation
Puppeteer in production requires Chromium installed on the server. Run once after deploy:

```bash
make setup
```

This installs Node 20 via nvm and downloads Chrome for Puppeteer.

## Troubleshooting

### Connection Refused (localhost:3000)
- Check if port 3000 is available
- Kill existing process: `lsof -ti:3000 | xargs kill -9`

### PDF Download Fails
- Ensure `./public/` directory exists
- Check Puppeteer can access the `/lotomania` page
- Verify `APP_URL` is correct in production

### Database Errors
- Delete `lottery.db` to reset
- Check file permissions in project directory

## Security Notes

- ✅ No authentication required (public lottery data)
- ✅ Dependencies kept up-to-date with security patches
- ✅ Input validation on API parameters
- ⚠️ PDF generation uses external network requests

## License

ISC

## Author

Adriano Dias
