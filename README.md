# denoise

Anonymous social network with fleeting posts.



## Development stack

-  NodeJS - [nodejs.org](https://nodejs.org/)
-  ExpressJS - [expressjs.com](https://expressjs.com/)
-  NPM - [npmjs.com](https://www.npmjs.com/)
-  MongoDB - [mongodb.com](https://www.mongodb.com/)
-  Mongoose - [mongoosejs.com](https://mongoosejs.com/)
-  Joi - [joi.dev](https://joi.dev/)

## API Endpoints and Features

### /auth
- POST /register	- Creates new user account by username and password
- POST /login	- Logs user in and return refresh token and access token
- POST /refresh	- Refreshes the access token by the refresh token
- PATCH /reset-password - Resets current user's password
- DELETE /logout	- Logs out current user
- DELETE /terminate - Terminates current logged in user's account

### /users
- GET /me - Get's current logged in user's info
- PATCH /me - Updates current user's info
- GET /me/posts - Gets list of current users posts
- GET /me/blocked - Gets list of blocked users by current logged in user
- DELETE /me/clear - Deletes all user's posts at once
- GET /:username - Gets user's profile/info by username
- POST /:username/follow - Follows a user
- POST /:username/unfollow - Unfollows a user
- POST /:username/block - Blocks a user
- POST /:username/unblock - Unblocks a user
- POST /:username/posts - Gets user's posts by username

### /posts
- POST / -
- GET /:postId -
- POST /:postId/like - 
- POST /:postId/unlike - 
- GET /postId/likes - 
- POST /postId/comments - 
- DELETE /:postId - 
- GET /:postId/comments - 
- DELETE /:postId/comments/:commentId - 
- GET /newsfeed/:type - 
- POST /:postId/report - 
- POST /:postId/comments/:commentId/report - 
- GET /:postId/comments/:commentId - 
- POST /:postId/comments/:commentId/replies - 
- GET /:postId/comments/:commentId/replies - 
- DELETE /:postId/comments/:commentId/replies/:replyId - 
- POST /:postId/comments/:commentId/replies/:replyId/report - 

### /notifications
- GET / - Gets all notifications for current logged in user
- POST /:notificationId/read - Marks a specific notification as read
- POST /read-all - Marks all notifications as read at once


# TODO:
- [] Get posts by searched hashtags
- [] Get psots by flags/tags
- [] Implement Upvote/Downvote system for comments and replies
- [] Get list of reported posts for moderators to evaluate
