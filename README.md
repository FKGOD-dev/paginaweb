# Manga & Anime Platform

This is a Vite + React project for an experimental manga and anime platform. Some screens use the public [Jikan API](https://docs.api.jikan.moe/) to retrieve data while other sections are still mocked.

## Development

```bash
npm install
npm run dev
```

The project was created with Vite and uses TailwindCSS for styling. Build assets with:

```bash
npm run build
```

## Notes

- API requests are made to Jikan. You can replace or extend the service layer in `src/services` to connect to your own backend.
- Authentication logic is provided in `src/contexts/AuthContext.jsx` but requires an API to work.
