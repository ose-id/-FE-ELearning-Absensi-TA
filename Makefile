.PHONY: help dev build start lint lint-fix install clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev       - Start development server"
	@echo "  make build     - Build for production"
	@echo "  make start     - Start production server"
	@echo "  make lint      - Run ESLint"
	@echo "  make lint-fix  - Run ESLint with auto-fix"
	@echo "  make install   - Install dependencies"
	@echo "  make clean     - Remove node_modules and build files"

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Start production server
start:
	npm run start

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint -- --fix

# Dependencies
install:
	npm install

# Clean
clean:
	rm -rf node_modules .next
