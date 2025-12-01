# Makefile for streamsight
# Provides convenient targets for running docker compose without relying on a .env file

# Environment selection (dev or prod). Default is dev.
ENV ?= dev

# Set project name and compose file based on ENV. Users can still override PROJECT_NAME or COMPOSE_FILE on the CLI.
ifeq ($(ENV),prod)
PROJECT_NAME ?= streamsight-prod
COMPOSE_FILE ?= docker-compose.yml
else
PROJECT_NAME ?= streamsight-dev
COMPOSE_FILE ?= docker-compose.dev.yml
endif

DC = COMPOSE_PROJECT_NAME=$(PROJECT_NAME) docker compose -f $(COMPOSE_FILE)

.PHONY: help up down build logs logs-backend logs-frontend ps restart frontend-shell backend-shell

help:
	@echo "Makefile targets:"
	@echo "  make up                -> start services (detached, builds first). Default ENV=dev"
	@echo "  make down              -> stop and remove services" 
	@echo "  make build             -> build images defined in compose file"
	@echo "  make logs              -> follow logs for all services"
	@echo "  make logs-backend      -> follow logs for backend service"
	@echo "  make logs-frontend     -> follow logs for frontend service"
	@echo "  make ps                -> show compose service status"
	@echo "  make restart           -> recreate services (down then up)"
	@echo "  make frontend-shell    -> open a shell in the frontend container"
	@echo "  make backend-shell     -> open a shell in the backend container"
	@echo ""
	@echo "Examples:"
	@echo "  make up                # starts dev (uses docker-compose.dev.yml)"
	@echo "  ENV=prod make up       # starts prod (uses docker-compose.yml)"
	@echo "  make up-prod           # convenience target for prod"

up:
	$(DC) up -d --build

down:
	$(DC) down

build:
	$(DC) build

logs:
	$(DC) logs -f

logs-backend:
	$(DC) logs -f backend

logs-frontend:
	$(DC) logs -f frontend

ps:
	$(DC) ps

restart: down up

frontend-shell:
	$(DC) exec frontend sh

backend-shell:
	$(DC) exec backend sh

# Convenience targets for explicit dev/prod workflows
.PHONY: up-dev down-dev build-dev logs-dev logs-backend-dev logs-frontend-dev ps-dev restart-dev up-prod down-prod build-prod logs-prod logs-backend-prod logs-frontend-prod ps-prod restart-prod

up-dev:
	ENV=dev $(MAKE) up 

down-dev:
	ENV=dev $(MAKE) down

build-dev:
	ENV=dev $(MAKE) build

logs-dev:
	ENV=dev $(MAKE) logs

logs-backend-dev:
	ENV=dev $(MAKE) logs-backend

logs-frontend-dev:
	ENV=dev $(MAKE) logs-frontend

ps-dev:
	ENV=dev $(MAKE) ps

restart-dev:
	ENV=dev $(MAKE) restart

up-prod:
	ENV=prod $(MAKE) up

down-prod:
	ENV=prod $(MAKE) down

build-prod:
	ENV=prod $(MAKE) build

logs-prod:
	ENV=prod $(MAKE) logs

logs-backend-prod:
	ENV=prod $(MAKE) logs-backend

logs-frontend-prod:
	ENV=prod $(MAKE) logs-frontend

ps-prod:
	ENV=prod $(MAKE) ps

restart-prod:
	ENV=prod $(MAKE) restart
