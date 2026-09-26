# English — User Inspector

Full-stack application for searching public GitHub users and exploring profile information, statistics, photos and repositories.

## Features
- GitHub user search
- Avatar / profile photo
- Detailed public profile
- Repository list with stars, forks and languages
- Aggregate statistics and language analytics
- Recent public GitHub activity
- Editable application-specific bio, location, website and notes
- Express REST API
- Persistent custom data in `data/users.json`
- Responsive desktop/mobile UI

## Run locally
Requires Node.js 20+.
```bash
npm install
npm start
```
Open http://localhost:3000

## API
- GET /api/health
- GET /api/users/search?q=...
- GET /api/users/:login
- PUT /api/users/:login/profile

GitHub public data is requested by the server. GitHub API rate limits still apply.

## Architecture
Frontend: HTML + CSS + vanilla JavaScript  
Backend: Node.js + Express  
External data: GitHub REST API  
Persistence: JSON file

For production, replace JSON storage with a real database and add authentication before allowing multiple people to edit data.