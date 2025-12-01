# streamsight

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

docker compose --env-file .env.prod up -d

docker compose --env-file .env.dev -f docker-compose.dev.yml up -d
