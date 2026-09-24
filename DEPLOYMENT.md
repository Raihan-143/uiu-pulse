# UIU Pulse deployment

## 1. Deploy the backend on Render

Create a new Web Service from this project. Use these settings:

- Root Directory: `fixed_project/backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variable: `MONGO_URL` = your MongoDB Atlas connection string

Render provides the public backend URL, for example `https://uiu-pulse-api.onrender.com`.

## 2. Configure the frontend API URL

Open `js/config.js` and replace the local URL with the Render URL:

```js
window.UIU_API_URL = "https://uiu-pulse-api.onrender.com";
```

Do not include a trailing slash.

## 3. Deploy the frontend on Netlify

Deploy the `fixed_project` folder as a static site. Netlify will provide a free URL such as `https://uiu-pulse.netlify.app`.

## 4. MongoDB Atlas

In Atlas Network Access, allow the deployed backend to connect. For a simple student deployment, add `0.0.0.0/0`; use a restricted IP policy for production when possible.

Never upload `backend/.env` or share its MongoDB credentials. Store the connection string only in Render environment variables.

## Data endpoints

- `GET /api/rsvps`
- `GET /api/research-applications`
- `GET /api/competition-registrations`
