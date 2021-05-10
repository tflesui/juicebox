// grab our client with destructuring from the export in index.js
const { client,
        getAllUsers,
        createUser,
        updateUser,
        createPost,
        getAllPosts,
        getPostsByUser,
        getPostsByTagName,
        getUserById,
        getPostById,
        updatePost,
        createTags,
        createPostTag,
        addTagsToPost
} = require('./index');

const createInitialUsers = async () => {
  try {
    console.log('Creating users...');

    await createUser({ username: 'alapati', password: 'pati99', name: 'albert', location: 'california' });

    await createUser({ username: 'sandra', password: '2sandy4me', name: 'sandra', location: 'washington' });

    await createUser({ username: 'glamgal', password: 'soglam', name: 'Nina', location: 'hawaii' });


    console.log('Finished creating users!');
  } catch (err) {
    console.error('Error creating users!');
    throw err;
  }
}

const createInitialPosts = async () => {
  try {
    const [alapati, sandra, glamgal] = await getAllUsers();

    console.log('Creating posts...');

    await createPost({
      authorId: alapati.id,
      title: "First Post",
      content: "My first post. Mo' queries, mo' problems",
      tags: ["#happy", "#worst-day-ever"]
    });

    await createPost({
      authorId: alapati.id,
      title: "Second Post",
      content: "My second post. I love sports!",
      tags: ["#happy", "#youcandoanything"]
    });

    await createPost({
      authorId: sandra.id,
      title: "1st Post",
      content: "My first post. Go Niners!",
      tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    });

    await createPost({
      authorId: glamgal.id,
      title: "First Post",
      content: "Blah blah blah. I'm an influencer!",
      tags: ["#worst-day-ever", "#canmandoeverything"]
    });

    console.log('Finished creating posts!');
  } catch(err) {
    console.log('Error creating posts!');
    throw err;
  }
}

const createInitialTags = async () => {
  try {
    console.log('Creating tags...');

    const [happy, sad, inspo, catman] = await createTags([
      '#happy',
      '#worst-day-ever',
      '#youcandoanything',
      '#catmandoeverything'
    ]);

    const [postOne, postTwo, postThree] = await getAllPosts();

    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad, inspo]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);

    console.log('Finished creating tags!');
  } catch(err) {
    throw err;
  }
}

const dropTables = async () => {
  try{
      console.log('Dropping tables...');

      await client.query(`
          DROP TABLE IF EXISTS post_tags;
          DROP TABLE IF EXISTS tags;
          DROP TABLE IF EXISTS posts;
          DROP TABLE IF EXISTS users;
      `);

      console.log('Finished dropping tables!');
  } catch(err) {
      console.error('Error dropping tables!');
      throw err;
  }
}

const createTables = async () => {
  try{
      console.log('Building tables...');

      await client.query(`
          CREATE TABLE users (
              id SERIAL PRIMARY KEY,
              username VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              name VARCHAR(255) NOT NULL,
              location VARCHAR(255) NOT NULL,
              active BOOLEAN DEFAULT true
          );
      `);

      await client.query(`
          CREATE TABLE posts (
              id SERIAL PRIMARY KEY,
              "authorId" INTEGER REFERENCES users(id) NOT NULL,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              active BOOLEAN DEFAULT true
          );
      `);

      await client.query(`
            CREATE TABLE tags (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE NOT NULL
            );
      `);

      await client.query(`
            CREATE TABLE post_tags (
              "postId" INTEGER REFERENCES posts(id),
              "tagId" INTEGER REFERENCES tags(id),
              UNIQUE ("postId", "tagId")
            );
      `);

      console.log('Finished building tables');
  } catch(err) {
      console.error('Error building tables!');
      throw err;
  }
}

const rebuildDB = async () => {
  try{
      client.connect();

      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
  } catch(err) {
    console.log('Error during rebuildDB');
      throw err;
  }
}

const testDB = async () => {
  try{
      console.log('Testing database...');

      console.log('Calling getAllUsers');
      const users = await getAllUsers();
      console.log('Result:', users);

      console.log('Calling updateUser on users[0]');
      const updateUserResult = await updateUser(users[0].id, {
        name: "Pati",
        location: "The Bay"
      });
      console.log('Result:', updateUserResult);

      console.log("Calling getAllPosts");
      const posts = await getAllPosts();
      console.log("Result:", posts);

      console.log("Calling updatePost on posts[0]");
      const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
      });
      console.log("Result:", updatePostResult);

      console.log("Calling updatePost on post[1], only updating tags");
      const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
      });
      console.log("Result:", updatePostTagsResult);

      console.log("Calling getPostsByTagName with #happy");
      const postsWithHappy = await getPostsByTagName("#happy");
      console.log("Result:", postsWithHappy);

      console.log("Calling getUserById with 1");
      const albert = await getUserById(1);
      console.log("Result:", albert);

      console.log('Finished database tests!');
  } catch (error) {
    console.error('Error testing database!');
    throw error;
  }
}


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());