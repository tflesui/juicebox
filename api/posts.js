const express = require('express');
const postsRouter = express.Router();
const { getAllPosts } = require('../db');
const { createPost } = require('../db');
const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;
    const { id } = req.user;
    const tagsArr = tags.trim().split(/\s+/);
    const postData = {};

    // only send the tags if there are some to send
    if (tagsArr.length) {
        postData.tags = tagsArr;
    }

    try {
        postData.title = title;
        postData.content = content;
        postData.authorId = id;

        const post = await createPost(postData);

        res.send({ post });
    } catch ({ name, message }) {
        next({ name, message });
    }
});

postsRouter.use((req, res, next) => {
    console.log('A request is being made to /posts');

    next();
});

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

module.exports = postsRouter;