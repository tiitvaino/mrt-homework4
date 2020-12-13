const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const PostModel = require('../models/PostModel');


router.get('/', authorize, (request, response) => {

    // Endpoint to get posts of people that currently logged in user follows or their own posts

    PostModel.getAllForUser(request.currentUser.id, (postIds) => {

        if (postIds.length) {
            PostModel.getByIds(postIds, request.currentUser.id, (posts) => {
                response.status(201).json(posts)
            });
            return;
        }
        response.json([])

    })

});

router.post('/', authorize,  (request, response) => {
    // if this is empty post
    if (!request.body || !request.body.text){
        response.status(403).json();
        return;
    }

    // Endpoint to create a new post
    const params = {
        "userId": request.currentUser.id,
        "text": request.body.text,
        "media": request.body.media
    }

    PostModel.create(params, () => {
        response.status(201).json();
    });

});


router.put('/:postId/likes', authorize, (request, response) => {
    // Endpoint for current user to like a post

    // if this is empty request
    if (!request.params.postId || !request.currentUser.id){
        response.status(403).json();
        return;
    }
    
    const userId = request.currentUser.id;
    const postId = request.params.postId;

    PostModel.like(userId, postId, () => {
        response.status(200).json();
    })
});

router.delete('/:postId/likes', authorize, (request, response) => {
    // Endpoint for current user to unlike a post
    if (!request.params.postId || !request.currentUser.id){
        response.status(403).json();
        return;
    }

    const userId = request.currentUser.id;
    const postId = request.params.postId;

    PostModel.unlike(userId, postId, () => {
        response.status(200).json();
    })
});

module.exports = router;
