# Drone Fleet Tracker: Step 1

First milestone: register and list drones through an Express API backed by MongoDB.
React, flights, maintenance rules and authentication come later.

## Run in Windows VS Code

Requires Node.js 22 or newer and a running MongoDB server, local or Atlas.
Open the extracted folder in VS Code, then run:

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

Before running, start your local MongoDB service. If using Atlas, put your
connection string with a database name into .env and configure your Atlas database
user and network access. Keep .env private. The API waits for MongoDB before starting.
A startup failure means check the database service, credentials and connection settings.

Open http://localhost:3000/api/health in your browser.
Expected: {"message":"Drone Fleet API is running"}

## Register a drone in Postman

POST http://localhost:3000/api/drones
Choose Body -> raw -> JSON, with Content-Type: application/json.

```json
{"serialNumber":"GLIDEX-001","model":"GlideX Prototype","status":"active","flightHours":0}
```

Expected: HTTP 201 and the stored drone with a generated _id.
Open http://localhost:3000/api/drones in your browser to list the fleet.
Duplicate serial numbers return 409. Negative flight hours and missing required
fields return 400. Register two drones with different serial numbers as your first exercise.

## Understand the code

- server.js: connect to MongoDB, then start the HTTP server.
- app.js: receive requests, call the model, return JSON.
- models/Drone.js: define fields and validation rules.
- .env: local database settings, separate from source code.

Request flow: client -> Express route -> Mongoose model -> MongoDB -> JSON response.
Explain req.body, await, res.json and status(201) before adding more features.
The active label is a recorded status, not an airworthiness certification.
This beginner milestone runs on localhost and has no authentication.

References:
https://expressjs.com/en/starter/installing.html
https://mongoosejs.com/docs/guide.html
https://mongoosejs.com/docs/validation.html
