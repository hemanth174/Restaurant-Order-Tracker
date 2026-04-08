# Restaurant Order Tracker

## Problem Statement

Build a system to manage food orders in a restaurant.

Each order moves through these stages:

`Preparing -> Ready -> Completed`

## Tech Stack

- Node.js
- React
- SQL

## What to Build

- Create order
- Update order status
- View all orders

## Constraints

- Orders follow a fixed status flow: `Preparing -> Ready -> Completed`

## Project Structure

- `Server` - Node.js backend API
- `Frontend` - React frontend

## Local Development

### Backend

```bash
cd Server
npm install
npm start
```

Backend runs on `http://localhost:3001`

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Set root directory to `Server`
3. Build command: `npm install`
4. Start command: `npm start`
5. After deployment, verify `https://your-render-url/api/health` returns JSON

### Frontend (Vercel)

1. Import the project on Vercel
2. Set root directory to `Frontend`
3. Add env variable `VITE_API_URL` with your Render backend base URL
4. Example: `VITE_API_URL=https://your-render-url.onrender.com`
