.PHONY: start-all
start-all:
	(cd backend && make start) & \
	(cd frontend && npm run dev) & \
	wait
# END TEMP 