# Project Setup & Verification Guide

This repository contains a full-stack Cinema Ticket Booking System built with **Spring Boot** (Backend) and **React + Vite** (Frontend), utilizing **Redis** for distributed seat locking and **Elasticsearch** for movie search.

---

## 🚀 Getting Started

### 1. Infrastructure Services (Docker)
Ensure Docker Desktop is running and launch required services (MongoDB, Redis Master/Sentinel, Elasticsearch, Prometheus, Grafana):
```bash
docker-compose up -d
```

---

### 2. Backend (Spring Boot)

1. Navigate to the server directory:
   ```bash
   cd spring_boot_server/Server
   ```
2. Verify connection properties in `src/main/resources/application.properties` (MongoDB, Redis, Elasticsearch).
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   > Backend API will be available at: `http://localhost:8080`

---

### 3. Frontend (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   > Frontend will be available at: `http://localhost:5173`

---

##  Inspecting Seat Locks in Redis

Seat locks are managed via Redis with the key format `seat_lock:<showtimeId>:<seatId>` and hold the value of the holding `userId` (with a 10-minute TTL).

### 1. Access Redis CLI
Run the CLI inside the `redis-master` Docker container:
```bash
docker exec -it redis-master redis-cli
```

### 2. Redis Commands for Seat Lock Management

- **List all currently locked seats:**
  ```redis
  KEYS "seat_lock:*"
  ```

- **List locked seats for a specific showtime:**
  ```redis
  KEYS "seat_lock:<showtimeId>:*"
  ```

- **Get the user holding a locked seat:**
  ```redis
  GET "seat_lock:<showtimeId>:<seatId>"
  ```

- **Check remaining lock duration (TTL in seconds):**
  ```redis
  TTL "seat_lock:<showtimeId>:<seatId>"
  ```

- **Manually release/delete a seat lock:**
  ```redis
  DEL "seat_lock:<showtimeId>:<seatId>"
  ```

---

##  Inspecting Data in Elasticsearch

Movie data is indexed in Elasticsearch under the `movies` index for full-text search capability.

* **Elasticsearch Endpoint:** `http://localhost:9200`
* **Target Index Name:** `movies`
* **Default Credentials:** Username: `elastic` | Password: `27072005`

### 1. List All Elasticsearch Indices
```bash
curl -u elastic:27072005 http://localhost:9200/_cat/indices?v
```

### 2. Retrieve All Indexed Movies
```bash
curl -u elastic:27072005 http://localhost:9200/movies/_search?pretty
```

### 3. Search Movies by Title/Keyword
```bash
curl -u elastic:27072005 -X POST "http://localhost:9200/movies/_search?pretty" \
     -H "Content-Type: application/json" \
     -d "{\"query\": {\"match\": {\"title\": \"Batman\"}}}"
```

### 4. Check Total Number of Indexed Movies
```bash
curl -u elastic:27072005 http://localhost:9200/movies/_count?pretty
```

### 5. Access via Browser or Postman
- **URL:** `http://localhost:9200/movies/_search`
- **Authentication:** Select **Basic Auth** with `Username: elastic` and `Password: 27072005`.