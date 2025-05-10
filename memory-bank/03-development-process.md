# Development Process

**NOTE:** Always use the Makefile in /backend to start the server and check for port conflicts. Set the backend port once at the top of the Makefile (PORT variable). Both `make start` and `make clean` will use this port, ensuring consistent and conflict-free backend management for all maintainers.

**Service Management:**
- To add a new backend service (e.g., database, cache, worker), define a new target in the Makefile and add it to the 'services' target. This ensures all required services are started consistently.
- Example pattern is included in the Makefile as a comment for maintainers.

- Use Git for version control and feature branches for each component.
- Start with backend API and file processing logic for rapid prototyping.
- Develop frontend landing and transcript pages with Tailwind dark UI.
- Integrate frontend with backend API.
- Test end-to-end flow with real video links.
- Iterate on UI/UX based on feedback.
- Document all endpoints and update Memory Bank as new decisions are made. 