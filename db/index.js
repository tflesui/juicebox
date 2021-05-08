const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

const createUser = async ({ 
    username, 
    password, 
    name, 
    location }) => {
    try {
        const { rows: [ user ] } = await client.query(`
            INSERT INTO users(username, password, name, location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, password, name, location]);

        return user;
    } catch (err) {
        throw err;
    }
}

const getAllUsers = async () => {
    const { rows } = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
    `);

    return rows;
}

const updateUser = async (id, fields = {}) => {
    // build the set string
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    // return early if this is called without fields
    if(setString.length === 0) {
        return;
    }

    try {
        const { rows: [ user ] } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));

        return user;
    } catch(err) {
        throw err;
    }
}

const createPost = async ({ 
    authorId, 
    title, 
    content
    }) => {
    try {
        const { rows: [ posts ] } = await client.query(`
            INSERT INTO posts("authorId", title, content)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [authorId, title, content]);

        return posts;
    } catch (err) {
        throw err;
    }
}

const updatePost = async (id, fields = {
    title,
    content,
    active
}) => {
    // build the set string
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');

    // return early if this is called without fields
    if(setString.length === 0) {
        return;
    }

    try {
        const { rows: [ posts ] } = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
        `, Object.values(fields));

        return posts;
    } catch(err) {
        throw err;
    }
}

const getAllPosts = async () => {
    try{
        const { rows } = await client.query(
            `SELECT *
            FROM posts;
        `);
    
        return rows;
    }catch (err) {
        throw err;
    }
    
}

const getPostsByUser = async userId => {
    try {
        const { rows } = client.query(`
            SELECT * 
            FROM posts
            WHERE "authorId"=${ userId };
        `);

        return rows;
    } catch(err) {
        throw err;
    }
}

const getUserById = async userId => {
    // Grab all columns except password from user object
    try{
        const { rows: [ user ]} = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE id=${ userId };    
        `);

        if(!user){
            return null;
        }

        user.posts = await getPostsByUser(userId);

        return user;
    } catch(err) {
        throw err;
    }
    
}

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getUserById,
    getAllPosts,
    getPostsByUser
}


