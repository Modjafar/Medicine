# TODO: Fix INTERNAL_SERVER_ERROR

## Plan Steps:
- [x] Update backend/server.js: Add conditional check for frontend/build existence before static/SPA serving
- [ ] (Optional) Enhance backend/middleware/globalErrorHandler.js: Handle ENOENT as operational error
- [ ] Restart backend server
- [ ] Test: Access http://localhost:5000/ should return 404 (notFound) instead of 500
- [ ] Build frontend: cd frontend && npm run build
- [ ] Verify logs: No more UNEXPECTED ERROR / INTERNAL_SERVER_ERROR for root path

Current progress: Starting implementation...
