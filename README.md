# streamsight studio

A web-based studio for evaluating and analyzing streaming recommendation algorithms.

## Prerequisites

- Docker
- Docker Compose
- Git

## Installation

1. Clone the streamsight repository:
   ```bash
   git clone https://github.com/HiIAmTzeKean/streamsight.git
   ```

2. Clone the streamsight-studio repository in the same directory:
   ```bash
   git clone https://github.com/HiIAmTzeKean/streamsight-studio.git
   ```

3. Navigate to the streamsight-studio directory:
   ```bash
   cd streamsight-studio
   ```

4. Ensure you have a `.env` file in the root directory with necessary environment variables (copy from `.env.example` if available, or create one based on your setup).

## Running the Application

To start the entire server stack (PostgreSQL database, backend API, and frontend), run:

```bash
make up
```

This will:
- Start a PostgreSQL database on port 5432
- Start the backend API server on port 9000
- Start the frontend development server on port 8000

You can then access the application at `http://localhost:8000`.

## Development

For development, you can use the provided Makefile targets:

- `make up` - Start services in detached mode
- `make down` - Stop and remove services
- `make logs` - Follow logs for all services
- `make build` - Build Docker images

## Project Structure

- `streamsight-studio-backend/` - Python FastAPI backend
- `streamsight-studio-frontend/` - React/TypeScript frontend
- `docker-compose.yml` - Docker Compose configuration
- `Makefile` - Convenience commands for development
