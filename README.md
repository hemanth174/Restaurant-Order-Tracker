# Restaurant Order Tracker

A full-stack application for managing restaurant orders in real-time.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + SQL.js

## Local Development

### Backend
```bash
cd Server
npm install
npm start
```
Server runs on http://localhost:3001

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Set root directory: `Server`
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel)
1. Import project on Vercel
2. Set root directory: `Frontend`
3. Add env variable: `API_URL` = your Render backend URL + `/api/orders`
