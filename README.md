# mood2meal.com

The public website for Mood2Meal: landing page, support, privacy, terms and account deletion.
Static HTML, served by GitHub Pages. Pushing to `main` publishes.

## health.json — the app's kill switch

The app fetches `https://mood2meal.com/health.json` on every launch.

- `"maintenance": true` shows every user the maintenance screen. Set it back to `false` to reopen.
- `"min_version": "1.2.0"` forces anyone on an older version to update. Only raise it after
  the new version is live on the App Store, or those users are locked out with nothing to update to.

Changes take effect within about ten minutes of a push (GitHub caches the file). If the file is
missing, unreachable or invalid, the app carries on as normal.
