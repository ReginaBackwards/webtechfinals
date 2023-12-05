const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const port = 3000;

// Serve static files from the specified directories
app.use(express.static(path.join(__dirname, './../../BBCLive')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'sessionKey', resave: true, saveUninitialized: true }));

// Connect to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bbc_live_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database');
});

app.listen(port, 'localhost', () => {
  console.log(`Server is running at http://localhost:${port}`);
});


// Endpoint for handling requests for admin details
app.get('/getAdminDetails', (req, res) => {
  // Retrieve admin details from the session
  const adminDetails = req.session.admin || {
    dp: './../res/avatars/default.png', // Default image URL
    firstname: 'Admin', // Default first name
    lastname: 'Name', // Default last name
  };

  res.json(adminDetails);
});

// Endpoint for handling login requests
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query the database to verify credentials
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error executing database query:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    if (results.length > 0) {
      const user = results[0];
      req.session.theuser = user;

      // Redirect to the root URL '/'
      res.redirect('/');
    } else {
      // Invalid credentials, redirect to login page
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

// Entry point for the root URL '/'
app.get('/', (req, res) => {
  // Check if user session exists
  if (req.session.theuser) {
    // User session exists
    const user = req.session.theuser;

    if (user.role === 'admin') {
      // Fetch the list of content managers from the database
      const userListQuery = 'SELECT users.*, GROUP_CONCAT(schedules.day) AS schedule_days FROM users LEFT JOIN schedules ON users.username = schedules.username WHERE users.role = ? GROUP BY users.username';

      db.query(userListQuery, ['cm'], (err, userList) => {
        if (err) {
          console.error('Error fetching user list:', err);
          return res.status(500).json({ message: 'Server Error' });
        }

        // Construct HTML for user list
        let userListHTML = '';
        userList.forEach((user, index) => {
          // Split the concatenated days into an array
          const scheduleDaysArray = user.schedule_days ? user.schedule_days.split(',') : [];

          userListHTML += `
            <tr>
              <td>${index + 1}</td>
              <td><img src="${user.dp}" class="avatar" alt="Avatar"> ${user.firstname} ${user.lastname}</td>
              <td>${user.username}</td>
              <td>
              ${scheduleDaysArray.map(day => `<div>${day.trim()}</div>`).join('')}
              </td>
              <td>${user.sessions}</td>
              <td>
                <span class="status text-${user.banstatus === 0 ? 'success' : 'danger'}">&bull;</span>
                ${user.banstatus === 0 ? 'Active' : 'Suspended'}
              </td>
              <td>
                <a href="#" class="reset" title="Reset" data-toggle="tooltip" data-username="${user.username}"><i class="material-icons">&#xF053;</i></a>
                <a href="#" class="delete" title="Delete" data-toggle="tooltip" data-username="${user.username}"><i class="material-icons">&#xE872;</i></a>
                <a href="#" class="ban" title="Ban" data-toggle="tooltip" data-username="${user.username}"><i class="material-icons">&#xE14B;</i></a>
              </td>
            </tr>
          `;
        });

        const adminHomeHTML = require('fs').readFileSync(path.join(__dirname, './Admin/admin-home.html'), 'utf8');
        const finalHTML = adminHomeHTML.replace('<!-- USER_LIST_PLACEHOLDER -->', userListHTML);
        res.send(finalHTML);
      });
    } else if (user.role === 'cm') {
      // Redirect to cm page
      return res.sendFile(path.join(__dirname, './Content Manager/cm-home.html'));
    }
  } else {
    // User session does not exist, redirect to login page
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});


// Endpoint for handling reset password action and unbanning user
app.post('/resetUser/:username', (req, res) => {
  const username = req.params.username;
  const updateQuery = 'UPDATE users SET password = ?, banstatus = 0 WHERE username = ?';

  db.query(updateQuery, [username, username], (err, results) => {
    if (err) {
      console.error('Error updating password:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    res.json({ message: 'User reset successfully' });
  });
});


// Endpoint for handling user deletion
app.post('/deleteUser/:username', (req, res) => {
  const username = req.params.username;
  const deleteQuery = 'DELETE FROM users WHERE username = ?';

  db.query(deleteQuery, [username], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Endpoint for handling ban user action
app.post('/banUser/:username', (req, res) => {
  const username = req.params.username;
  const updateQuery = 'UPDATE users SET banstatus = 1 WHERE username = ?';

  db.query(updateQuery, [username], (err, results) => {
    if (err) {
      console.error('Error updating ban status:', err);
      return res.status(500).json({ message: 'Server Error' });
    }

    res.json({ message: 'User banned successfully' });
  });
});

// Endpoint to check if the username already exists
app.get('/checkUsernameExists/:username', (req, res) => {
  const username = req.params.username;

  const checkQuery = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';

  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username existence:', err);
      return res.status(500).json({ exists: false });
    }

    const count = results[0].count;
    res.json({ exists: count > 0 });
  });
});


// Endpoint to handle adding a user
app.post('/addUser', (req, res) => {
  const defaultDp = '/res/avatars/default.png'
  // Extract form data from the request body
  const { firstName, lastName, userName } = req.body;
  const addQuery = 'INSERT INTO users VALUES (?,?,?,?,?,?,?,?)'
  //username as the default password
  db.query(addQuery, [userName, defaultDp, userName, firstName, lastName, 'cm', 0, 0], (err, results) => {
    if (err) {
      console.error('Error adding user to the database:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
    res.json({ message: 'User added successfully' });
  });
});

// Endpoint to get all users that are not banned/suspended
app.get('/getActiveUsers', (req, res) => {
  const query = "SELECT username FROM users WHERE role = 'cm' AND banstatus = 0;";

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching active users:', error);
      res.status(500).send('Server Error');
    } else {
      const userList = results.map(result => ({ username: result.username }));
      res.json(userList);
    }
  });
});

// Add this route in your Node.js server file
app.get('/getSchedules', (req, res) => {
  const query = 'SELECT day, username FROM schedules;';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).send('Server Error');
    } else {
      const schedules = results.map(result => ({ day: result.day, username: result.username }));
      res.json(schedules);
    }
  });
});


// Endpoint for updating the schedule
app.post('/setSchedule', (req, res) => {
  const selectedUsers = req.body.selectedUsers; // Access the array directly

  if (selectedUsers && selectedUsers.length > 0) {
    // Array to store promises for each query
    const queryPromises = [];

    selectedUsers.forEach(({ day, username }) => {
      const query = 'UPDATE schedules SET username = ? WHERE day = ?';
      const values = [username, day];

      // Creating a promise for each query
      const queryPromise = new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
          if (error) {
            console.error(`Error updating schedule for ${day}:`, error);
            reject(`Failed to update schedule for ${day}.`);
          } else {
            resolve();
          }
        });
      });

      queryPromises.push(queryPromise);
    });

    // Waiting for all promises to resolve before sending the response
    Promise.all(queryPromises)
      .then(() => {
        res.status(200).json({ success: true, message: 'Schedules updated successfully.' });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  } else {
    console.error('Selected users array is undefined or empty');
    res.status(400).json({ error: 'Selected users array is undefined or empty' });
  }
});

// Log out endpoint
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('./index.html');
});


// ALWIN MALWIN

const uploadDir = path.join('uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.post('/upload', upload.array('file'), async (req, res) => {
  try {
    const files = req.files;
    const username = 'alwin'; // This for testing only

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    for (const file of files) {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const allowedTypes = ['.mp3', '.mp4', '.jpg', '.jpeg', '.png'];

      if (!allowedTypes.includes(fileExtension)) {
        console.log('Unsupported file type:', fileExtension);
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      const fileType = getFileType(fileExtension);
      const userUploadDir = path.join(uploadDir, username, 'resources', fileType, `${Date.now()}_${file.originalname}`);

      if (!fs.existsSync(userUploadDir)) {
        fs.mkdirSync(userUploadDir, { recursive: true });
      }

      let filename;

      if (fileType === 'images') {
        filename = path.join(userUploadDir, `${Date.now()}_${file.originalname}`);
        await sharp(file.buffer).toFile(filename);
      } else {
        filename = path.join(userUploadDir, `${Date.now()}_${file.originalname}`);
        fs.writeFileSync(filename, file.buffer);
      }

      const insertQuery = 'INSERT INTO resources (filename, filepath, author, dateuploaded, type) VALUES (?, ?, ?, NOW(), ?)';
      const values = [file.originalname, userUploadDir, username, fileType];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('MySQL insert error:', err);
          return res.status(500).json({ error: 'Error inserting into database', details: err });
        } else {
          console.log('File inserted into database:', result);
        }
      });
    }

    res.status(200).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

app.get('/resources', (req, res) => {
  const acceptHeader = req.headers.accept || '';

  if (acceptHeader.includes('text/html')) {
    res.sendFile(path.join(__dirname, './../../BBCLive/Manager/Content Manager/resources.html'));
  } else {
    const fetchQuery = 'SELECT dateuploaded, filename, type FROM resources';

    db.query(fetchQuery, (err, results) => {
      if (err) {
        console.error('MySQL fetch error:', err);
        res.status(500).json({ error: 'Error fetching resources from database', details: err });
      } else {
        res.status(200).json(results);
      }
    });
  }
});

function getFileType(fileExtension) {
  if (fileExtension === '.mp3') {
    return 'Audio';
  } else if (fileExtension === '.mp4') {
    return 'video';
  } else if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
    return 'image';
  }
}

