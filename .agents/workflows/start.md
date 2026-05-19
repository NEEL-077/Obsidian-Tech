---
description: Start both backend and frontend dev servers together
---

// turbo
1. Run both backend and frontend together from the root directory using concurrently:

```
npm run dev
```

Run this command from: `c:\Users\sacha\Desktop\obsidian-tech`

This starts:
- Backend (Express + nodemon) on http://localhost:5001
- Frontend (Vite + React) on http://localhost:5000

Both services run in a single terminal window. Open http://localhost:5000 in your browser after both are ready.
