// grab our client with destructuring from the export in index.js
const { client,
        getAllUsers,
        createUser
} = require('./index');

const createInitialUsers = async () => {
  try {
    console.log('Creating users...');

    const alapati = await createUser({ username: 'alapati', password: 'pati99' });

    const sandra = await createUser({ username: 'sandra', password: '2sandy4me' });

    const glamgal = await createUser({ username: 'glamgal', password: 'soglam' });


    console.log('Finished creating users!');
  } catch (err) {
    console.error('Error creating users!');
    throw err;
  }
}

const dropTables = async () => {
  try{
      console.log('Dropping tables...');

      await client.query(`
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
              password VARCHAR(255) NOT NULL
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
  } catch(err) {
      throw err;
  }
}

const testDB = async () => {
  try{
      console.log('Testing database...');

      const users = await getAllUsers();
      console.log('getAllUsers:', users);

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