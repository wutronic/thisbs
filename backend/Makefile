# Backend Makefile
# Usage: make start | make clean
# Set the PORT variable at the top of this file to change the backend port (default: 3001)
PORT ?= 3001

.PHONY: start check-port services clean

# To add a new service, define a target below and add it to the 'services' target.
# Example:
# .PHONY: start-another-service
# start-another-service:
# 	command-to-start-service

check-port:
	@if lsof -i :$(PORT) > /dev/null; then \
		echo "Port $(PORT) is already in use. Please free the port or set a different PORT at the top of the Makefile."; \
		exit 1; \
	else \
		echo "Port $(PORT) is available."; \
	fi

start: check-port services
	npm install
	PORT=$(PORT) npm start

services:
	@echo "All required services are running. Add service startup commands here if needed."

clean:
	@if lsof -i :$(PORT) > /dev/null; then \
		PID=$$(lsof -ti :$(PORT)); \
		echo "Killing process on port $(PORT) (PID: $$PID)"; \
		kill -9 $$PID; \
	else \
		echo "No process running on port $(PORT)."; \
	fi
	@echo "Cleaned up server port $(PORT)." 