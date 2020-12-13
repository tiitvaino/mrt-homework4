const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const UserModel = require('../models/UserModel');
const FollowModel = require('../models/FollowModel');
const jwt = require('../library/jwt');


// Public endpoints
router.post('/', (request, response) => {

    let form = {
        email: {required: true},
        password: {required: true},
        firstname: {required: true},
        lastname: {required: false},
        avatar: {required: false}
    };

    const fieldMissing = {
        code: null,
        message: 'Please provide %s field'
    };

    for (let field in form) {
        if (form[field].required === true && !request.body[field]) {

            fieldMissing.code = field;
            fieldMissing.message = fieldMissing.message.replace('%s', field);

            response.json(fieldMissing, 400);
            return;
        }
    }

    UserModel.getByEmail(request.body.email, (rows) => {
        if (Array.isArray(rows) && rows.length) {
            response.status(400).json({
                code: 'email_already_exists',
                message: 'User with such email already exists'
            })
        }
    });

    let params = {
        email: request.body.email,
        password: request.body.password,
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        avatar: request.body.avatar
    };

    UserModel.create(params, () => {
        response.status(201).json()
    });
});

router.post('/login', (request, response) => {
    let email = request.body.email;
    let password = request.body.password;

    const invalidCredentials = {
        code: 'invalid_credentials',
        message: 'User with such credentials can not be found'
    };

    const noCredentials = {
        code: 'no_credentials',
        message: 'Please provide email and password'
    };

    if (!email || !password) {
        response.status(400).json(noCredentials);
        return;
    }

    UserModel.getByEmailAndPassword(email, password, (user) => {
        if (!user) {
            response.status(404).json(invalidCredentials);
            return;
        }

        let token = jwt.createAccessToken(user)
        response.json({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            avatar: user.avatar,
            accessToken: token // THis is the place where you should pass generated access token
        })
    });
});

// Protected endpoints
router.get('/', authorize, (request, response) => {

    UserModel.getAll(request.currentUser.id, (users) => {
        response.status(200).json(users)
    });
});

router.post('/:userId/follows', authorize, (request, response) => {

    //To get currently logged in user object use request.currentUser

    let userId = request.params.userId;
    let followerId = request.currentUser.id;

    if (userId.toString() === followerId.toString()) {
        response.status(403)
            .json({
                code: 'can_not_follow_yourself',
                message: 'You can not follow yourself'
            });
        return;
    }

    FollowModel.getByUserIdAndFollowerId(userId, followerId, (rows) => {

        if (rows.length) {
            response.status(409)
                .json({
                    code: 'already_following',
                    message: 'You are already following this user'
                });
        } else {
            FollowModel.create(userId, followerId, () => {
                response.json({
                    ok: true
                })
            })
        }
    })
});

router.delete('/:userId/follows', authorize, (request, response) => {

    //To get currently logged in user object use request.currentUser

    let userId = request.params.userId;
    let followerId = request.currentUser.id;

    if (userId.toString() === followerId.toString()) {
        response.status(403)
            .json({
                code: 'can_not_unfollow_yourself',
                message: 'You can not unfollow yourself'
            });
        return;
    }

    FollowModel.getByUserIdAndFollowerId(userId, followerId, (rows) => {

        if (!rows.length) {
            response.status(409)
                .json({
                    code: 'not_following',
                    message: 'You are not following this user'
                });
        } else {
            FollowModel.delete(userId, followerId, () => {
                response.json({
                    ok: true
                })
            })
        }
    })
});

module.exports = router;
