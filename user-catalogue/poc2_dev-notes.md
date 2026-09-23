I built the POC-2 User Catalogue as a new Angular 22 project in [user-catalogue/](user-catalogue/), next to `task-manager` and following the same conventions. The production build succeeds with no warnings, and all 18 unit tests pass. I also confirmed the public API it uses returns the user list and a 404 for unknown users, and that the dev server starts and serves the app. I haven't clicked through it in a browser.

To run it:
```bash
cd user-catalogue && npm start
```

**What's in it, checked against the brief:**
- **Data source:** users come from the free JSONPlaceholder API (`GET /users`). The list shows each user's name, email and city, with a search box on top.
- **User detail page** at `/users/:id`. An ID that doesn't exist shows a "does not exist" message.
- **Refresh button.** It's disabled while a request is running, and clicking it again cancels the earlier request.
- **Error handling:**
  - Clear messages for a network failure, a timeout (10 seconds) or a server error, each with a **Try again** button.
  - If a refresh fails, the last list stays on screen.
  - Temporary errors are retried once automatically. A 404 is not retried.
- **POST:** the brief mentions GET and POST, so I added an **Add user** form that sends `POST /users`.
- **Separation of layers:** only [user-api.service.ts](user-catalogue/src/app/services/user-api.service.ts) makes HTTP calls and knows the API's data format. [user.service.ts](user-catalogue/src/app/services/user.service.ts) holds the list and the loading and error state. Components only talk to the state service.

**Things I added or decided myself:**
- **"Simulate API down" checkbox** in the header. It makes every request fail, so you can demo the error handling without going offline.
- **Added users don't survive a reload.** JSONPlaceholder accepts a POST but doesn't save anything, and it returns ID 11 for every new user. So the app gives each new user its own ID, keeps them in memory marked **new**, and they disappear when the page reloads. The page tells the user this.
- **README:** [user-catalogue/README.md](user-catalogue/README.md) covers features, how to run it, the project structure, how the data flows and the tests. I left the top-level README alone because it's specific to POC-1.