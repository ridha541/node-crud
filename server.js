const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebase-config');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


// Root route
app.get('/', (req, res) => {
  res.send('Firebase Realtime Database CRUD API');
});

// CREATE (POST) - Add user with JSON body
app.post('/api/users', async (req, res) => {
  try {
    const usersRef = db.ref('users');
    const newUserRef = usersRef.push();
    await newUserRef.set(req.body);
    res.status(201).json({ id: newUserRef.key, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (GET) - Add sample user for quick testing (not recommended for production)
app.get('/add-user', async (req, res) => {
  try {
    const usersRef = db.ref('users');
    const newUserRef = usersRef.push();
    const sampleUser = {
      name: 'Maryyum',
      email: 'maryyum@example.com'
    };
    await newUserRef.set(sampleUser);
    res.json({ message: 'User added', id: newUserRef.key, user: sampleUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL (GET)
app.get('/api/users', async (req, res) => {
  try {
    const usersRef = db.ref('users');
    usersRef.once('value', snapshot => {
      res.json(snapshot.val() || {});
    }, error => {
      res.status(500).json({ error: error.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE (GET) by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const userRef = db.ref(`users/${req.params.id}`);
    userRef.once('value', snapshot => {
      if (snapshot.exists()) {
        res.json(snapshot.val());
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }, error => {
      res.status(500).json({ error: error.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (PUT) by ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const userRef = db.ref(`users/${req.params.id}`);
    await userRef.update(req.body);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (DELETE) by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userRef = db.ref(`users/${req.params.id}`);
    await userRef.remove();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
