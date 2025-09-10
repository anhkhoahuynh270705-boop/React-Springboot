# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# POST API used
```json
{
  "movieId": "movie123",
  "cinemaId": "cinema456", 
  "cinemaName": "CGV Vincom Center",
  "cinemaAddress": "72 Lê Thánh Tôn, Quận 1, TP.HCM",
  "startTime": "2024-12-25T19:30:00.000Z",
  "showDate": "2024-12-25",
  "time": "19:30",
  "room": "1",
  "price": 100000,
  "totalSeats": 100,
  "availableSeats": 100,
  "isActive": true
}
