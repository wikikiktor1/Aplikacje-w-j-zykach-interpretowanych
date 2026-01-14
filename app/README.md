# Frontend klienta (React + Vite)

Prosty frontend dla API z zadania 3. Używa React, Vite, Bootstrap i axios.

Uruchomienie:

1. Przejdź do katalogu client:

   cd client

2. Zainstaluj zależności:

   npm install

3. Uruchom w trybie deweloperskim:

   npm run dev

Zakładam, że backend API jest dostępny pod `/api` (ta sama domena i port albo skonfigurowany proxy). Jeśli backend działa na innym porcie, zaktualizuj `src/api/client.js` — `baseURL`.

Obsługa błędów RFC7807: axios interceptor zamienia odpowiedzi `application/problem+json` na wyjątek z `err.problem` zawierającym `title`, `detail`, `status` itp. UI wyświetla komunikaty w alertach i mapuje `invalid-params` do błędów formularzy przy składaniu zamówienia.

