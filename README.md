# ChainPulse AI - Smart Supply Chain Optimization

A full-stack web application for intelligent supply chain management with real-time tracking, AI-powered risk prediction, and automated rerouting capabilities.

## Features

- **Real-time Dashboard**: Live shipment tracking with Google Maps integration
- **Risk Prediction**: AI-powered risk assessment and delay prediction
- **Disruption Management**: Track and manage supply chain disruptions
- **Auto-Rerouting**: Automatic route optimization when high risks are detected
- **Analytics**: Comprehensive performance metrics and insights
- **Simulation Mode**: Test disruption scenarios and their impact
- **Real-time Updates**: Live data synchronization using Supabase

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Maps**: Google Maps JavaScript API
- **Real-time**: Supabase Realtime
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Maps API key (optional, works with mock data)
- OpenAI API key (optional, for advanced predictions)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Note**: The app works with mock data if API keys are not provided.

### 3. Database Setup

The database schema is already created via Supabase migrations. To seed with demo data:

```bash
npm run seed
```

This creates sample shipments and disruptions for testing.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
chainpulse-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── app-sidebar.tsx # Main navigation sidebar
│   │   ├── app-header.tsx  # Top header with search
│   │   ├── map-view.tsx    # Google Maps integration
│   │   └── shipment-card.tsx
│   ├── pages/              # Application pages
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── shipments.tsx   # Shipment management
│   │   ├── disruptions.tsx # Disruption tracking
│   │   ├── analytics.tsx   # Analytics & reports
│   │   └── settings.tsx    # Application settings
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client & types
│   │   ├── mock-data.ts    # Demo data for testing
│   │   └── utils.ts        # Utility functions
│   └── App.tsx             # Main app component
├── supabase/
│   └── functions/
│       └── predict-risk/   # Edge function for risk prediction
├── scripts/
│   └── seed-database.ts    # Database seeding script
└── package.json
```

## Key Features Explained

### Dashboard
- **Live Map**: Shows all active shipments and disruptions
- **Risk Heatmap**: Color-coded zones (green/yellow/red) based on risk levels
- **Shipment Cards**: Quick overview of each shipment's status and risk
- **Simulate Button**: Create test disruptions to see real-time impact

### Shipment Management
- Create new shipments with source/destination
- Track current location and estimated delivery
- View risk scores and delay predictions
- Filter by status (pending, in transit, delayed, delivered)

### Disruption System
- Report new disruptions (weather, traffic, strikes, accidents)
- Set severity levels (low, medium, high, critical)
- Toggle active/inactive status
- Real-time impact on nearby shipments

### Risk Prediction
- Automatic calculation based on route and disruptions
- Risk score: 0-100 (0 = no risk, 100 = critical)
- Delay estimation in hours
- Automatic status updates for high-risk shipments

### Auto-Rerouting
- Triggered when risk score exceeds 70
- Generates alternate routes avoiding disruption zones
- Updates map display in real-time
- Notifications for route changes

## API Endpoints

### Supabase Edge Functions

#### POST /functions/v1/predict-risk
Calculates risk score and suggests alternate routes.

**Request Body:**
```json
{
  "route": [
    { "lat": 40.7128, "lng": -74.0060 },
    { "lat": 34.0522, "lng": -118.2437 }
  ],
  "disruptions": [
    {
      "location": { "lat": 36.1627, "lng": -86.7816 },
      "type": "weather",
      "severity": "high"
    }
  ]
}
```

**Response:**
```json
{
  "risk_score": 65,
  "delay_hours": 4,
  "reason": "Weather disruption detected near route",
  "suggested_route": [...]
}
```

## Database Schema

### Shipments Table
- `id`: UUID primary key
- `shipment_id`: Unique identifier (SHP-XXX)
- `source`: Origin location
- `destination`: Destination location
- `current_location`: JSONB with lat/lng/address
- `status`: pending | in_transit | delayed | delivered
- `estimated_delivery`: Timestamp
- `route`: JSONB array of coordinates
- `risk_score`: Integer 0-100
- `delay_hours`: Integer

### Disruptions Table
- `id`: UUID primary key
- `location`: JSONB with lat/lng/address
- `type`: weather | traffic | strike | accident | other
- `severity`: low | medium | high | critical
- `description`: Text description
- `active`: Boolean flag

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
npm run build
vercel --prod
```

### Supabase Edge Functions

Edge functions are automatically deployed. To redeploy:

```bash
npx supabase functions deploy predict-risk
```

## Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript checks
npm run seed       # Seed database with demo data
```

## Features Demo

### Simulate Disruption Flow
1. Click "Simulate Disruption" on dashboard
2. Random disruption is created
3. Risk scores recalculate automatically
4. High-risk shipments update to "delayed" status
5. Map updates with new disruption zone
6. Notifications appear for affected shipments

### Create Shipment Flow
1. Navigate to Shipments page
2. Click "Create Shipment"
3. Enter source and destination
4. Shipment appears in list with pending status
5. Real-time sync across all connected clients

## Troubleshooting

### Map not showing
- Check if `VITE_GOOGLE_MAPS_API_KEY` is set
- Enable Maps JavaScript API in Google Cloud Console
- App works without maps using mock data

### Database connection issues
- Verify Supabase credentials in `.env`
- Check network connection
- App falls back to mock data if DB unavailable

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run typecheck`

## Contributing

This is a demo application. Feel free to fork and customize for your needs.

## License

MIT

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.
