# Blog API v1

https://github.com/sollertis8/Blog-API

• Serves client that:
    • makes AJAX calls back to API endpoints to initially retrieve and display       existing blog posts.
    • allows users to read, create, update , and delete blog posts
• Uses express.Router to route requests for /blog-posts to a separate module.
• CRUD (create, read, update, delete) operations for blog posts
• Note: uses volatile, in memory storage, since we haven't studied data              persistence yet in the course.