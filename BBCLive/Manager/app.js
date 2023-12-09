const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const cors = require('cors');
const app = express();
const port = 3000;

// Serve static files from the specified directories
app.use(express.static(path.join(__dirname, './../../BBCLive')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'sessionKey', resave: true, saveUninitialized: true }));
app.use(cors());

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint for handling requests for admin details
app.get('/getAdminDetails', (req, res) => {
  if (req.session.theuser) {
    // Retrieve admin details from the session
    // Check if the admin session exists
    if (req.session.theuser && req.session.theuser.role === 'admin') {
      // Admin session exists, send admin details
      const adminDetails = {
        dp: req.session.theuser.dp || './../res/avatars/default.png',
        firstname: req.session.theuser.firstname || 'Admin',
        lastname: req.session.theuser.lastname || 'Name',
      };

      res.json(adminDetails);
    } else {
      // Admin session does not exist, send an empty response or an appropriate status code
      res.status(401).json({ error: 'Admin session not found' });
    }
  } else {
    response.redirect('/')
  }
});

// Endpoint for handling requests for content manager details
app.get('/getCmDetails', (req, res) => {
  if (req.session.theuser) {
    // Retrieve content manager details from the session
    const cmDetails = req.session.theuser || {
      dp: './../../res/avatars/default.png',
      firstname: 'Content',
      lastname: 'Manager',
    };

    res.json(cmDetails);
  } else {
    response.redirect('/')
  }
});

const activeSessions = {};

// Endpoint for handling login requests
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the user already has an active session
  if (activeSessions[username]) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, error: 'Server Error' });
      }
      return res.status(400).json({ success: false, error: 'User is already logged in' });
    });
    return;
  }

  // Query the database to verify credentials
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {

    if (results.length > 0) {
      const user = results[0];

      // Check if the user is banned
      if (user.banstatus === 1) {
        return res.status(403).json({ success: false, error: 'User is banned' });
      }

      req.session.theuser = user;

      // Store the active session in the global variable
      activeSessions[username] = req.sessionID;

      res.json({ success: true, redirectURL: '/' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
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
  if (req.session.theuser) {
    const username = req.params.username;
    const updateQuery = 'UPDATE users SET password = ?, banstatus = 0 WHERE username = ?';

    db.query(updateQuery, [username, username], (err, results) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ message: 'Server Error' });
      }

      res.json({ message: 'User reset successfully' });
    });
  } else {
    response.redirect('/')
  }
});

// Endpoint for handling user deletion
app.post('/deleteUser/:username', (req, res) => {
  if (req.session.theuser) {
    const username = req.params.username;
    const deleteQuery = 'DELETE FROM users WHERE username = ?';

    db.query(deleteQuery, [username], (err, results) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ message: 'Server Error' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  } else {
    response.redirect('/')
  }
});

// Endpoint for handling ban user action
app.post('/banUser/:username', (req, res) => {
  if (req.session.theuser) {
    const username = req.params.username;
    const updateQuery = 'UPDATE users SET banstatus = 1 WHERE username = ?';

    db.query(updateQuery, [username], (err, results) => {
      if (err) {
        console.error('Error updating ban status:', err);
        return res.status(500).json({ message: 'Server Error' });
      }

      res.json({ message: 'User banned successfully' });
    });
  } else {
    response.redirect('/')
  }
});

// Endpoint to check if the username already exists
app.get('/checkUsernameExists/:username', (req, res) => {
  if (req.session.theuser) {
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
  } else {
    response.redirect('/')
  }
});

// Endpoint to handle adding a user
app.post('/addUser', (req, res) => {
  if (req.session.theuser) {
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
  } else {
    response.redirect('/')
  }
});

// Endpoint to get all users that are not banned/suspended
app.get('/getActiveUsers', (req, res) => {
  if (req.session.theuser) {
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
  } else {
    response.redirect('/')
  }
});

app.get('/getSchedules', (req, res) => {
  if (req.session.theuser) {
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
  } else {
    response.redirect('/')
  }
});

// Endpoint for updating the schedule
app.post('/setSchedule', (req, res) => {
  if (req.session.theuser) {
    const selectedUsers = req.body.selectedUsers;

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
  } else {
    response.redirect('/')
  }
});

// Log out endpoint
app.get('/logout', (req, res) => {
  const user = req.session.theuser;
  let username = "";

  // Check if the user has an active session
  if (user) {
    username = user.username;
    delete activeSessions[username];
  }
  const query = `UPDATE users SET sessions = 0 WHERE username='${username.toString()}'`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error setting session status:', error);
      res.status(500).send('Server Error');
    } else {
    }
  });
  req.session.destroy();

  res.json({ success: true });
});

const contentHostingDir = path.join(__dirname, './../../BBCLive/Content Hosting/');

if (!fs.existsSync(contentHostingDir)) {
  fs.mkdirSync(contentHostingDir);
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());


app.post('/upload', upload.array('file'), async (req, res) => {
  if (req.session.theuser) {
    try {
      const files = req.files;
      const username = req.session.theuser.username;

      const fileTypeMapping = {
        '.mp3': 'audio',
        '.mp4': `videos/clips/${username}`,
        '.jpg': 'images',
        '.jpeg': 'images',
        '.png': 'images',
      };

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      for (const file of files) {
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (!fileTypeMapping[fileExtension]) {
          console.log('Unsupported file type:', fileExtension);
          return res.status(400).json({ error: 'Unsupported file type' });
        }

        const fileType = fileTypeMapping[fileExtension];
        const userUploadDir = path.join(contentHostingDir, fileType);

        if (!fs.existsSync(userUploadDir)) {
          fs.mkdirSync(userUploadDir, { recursive: true });
        }

        let filename = path.join(userUploadDir, file.originalname);

        // Check for duplicate filenames
        let counter = 1;
        while (fs.existsSync(filename)) {
          const fileNameWithoutExt = path.parse(file.originalname).name;
          const newFileName = `${fileNameWithoutExt} (${counter})${fileExtension}`;
          filename = path.join(userUploadDir, newFileName);
          counter++;
        }

        if (fileType === 'images') {
          await sharp(file.buffer).toFile(filename);
        } else {
          fs.writeFileSync(filename, file.buffer);
        }

        const relativePath = path.relative(contentHostingDir, filename).replace(/\\/g, '/');;
        const adjustedFileType = fileType === `videos/clips/${username}` ? 'videos' : fileType;

        const insertQuery =
          'INSERT INTO resources (filename, filepath, author, dateuploaded, type) VALUES (?, ?, ?, NOW(), ?)';
        const values = [path.basename(filename), '/Content Hosting/' + relativePath, username, adjustedFileType];

        db.query(insertQuery, values, (err, result) => {
          if (err) {
            console.error('MySQL insert error:', err);
            return res
              .status(500)
              .json({ error: 'Error inserting into the database', details: err });
          } else {
            console.log('File inserted into the database:', result);
          }
        });
      }

      res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(500).json({ error: 'Internal server error', details: error });
    }
  } else {
    res.redirect('/');
  }
});

app.get('/resources', (req, res) => {
  if (req.session.theuser) {
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('text/html')) {
      res.sendFile(path.join(__dirname, './../../BBCLive/Manager/Content Manager/resources.html'));
    } else {
      const username = req.session.theuser.username;
      const fetchQuery = 'SELECT dateuploaded, filename, type FROM resources WHERE author = ?';

      db.query(fetchQuery, [username], (err, results) => {
        if (err) {
          console.error('MySQL fetch error:', err);
          res.status(500).json({ error: 'Error fetching resources from database', details: err });
        } else {
          console.log(username);
          res.status(200).json(results);
        }
      });
    }
  } else {
    response.redirect('/')
  }
});

// Endpoint to handle the redirect to resources.html
app.get('/gotoresources', (req, res) => {
  res.json({ success: true });
});

// Endpoint to handle the redirect to logs.html
app.get('/gotologs', (req, res) => {
  res.json({ success: true });
});

// Endpoint to handle the redirect to settings.html
app.get('/gotoeditprofile', (req, res) => {
  res.json({ success: true });
});

// Endpoint to handle the redirect to cm-home.html
app.get('/cm-home', (req, res) => {
  res.json({ success: true, redirectURL: '/' })
});

app.get('/gotoeditor', (req, res) => {
  res.json({ success: true });
});

// Endpoint to check if the current password input matches the password in the database
app.post('/checkCurrentPasswordMatch/:currentPassword', (req, res) => {
  const username = req.session.theuser.username;
  const currentPassword = req.params.currentPassword;

  const checkQuery = 'SELECT password FROM users WHERE username = ?';

  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking passwords match', err);
      return res.status(500).json({ exists: false });
    }

    if (results.length > 0) {
      const password = results[0].password;
      if (currentPassword === password) {
        res.json({ exists: true });
      }
    }
  });
});

// Endpoint to update the password
app.post('/updatePassword/:newPassword', (req, res) => {
  const username = req.session.theuser.username;
  const newPassword = req.params.newPassword;

  // Update the password in the database
  const updatePasswordQuery = 'UPDATE users SET password = ? WHERE username = ?';

  db.query(updatePasswordQuery, [newPassword, username], (updateErr) => {
    if (updateErr) {
      console.error('Error updating password:', updateErr);
      return res.status(500).json({ message: 'Error updating password' });
    }

    res.json({ message: 'Password updated successfully' });
  });
});

// Endpoint to get the profile picture
app.post('/getProfilePicturePath', (req, res) => {
  const username = req.session.theuser.username;

  const checkQuery = 'SELECT dp FROM users WHERE username = ?';

  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error getting profile picture path', err);
      return res.status(500).json({ exists: false });
    }

    if (results.length > 0) {
      const dp = results[0].dp;
      res.json(dp);
    }
  });
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../res/avatars/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname);
  }
});

const uploadProfile = multer({ storage: profileStorage });

app.post('/updateProfilePicture', uploadProfile.single('profilePicture'), (req, res) => {
  const username = req.session.theuser.username;
  const newProfilePicture = req.file;

  // Ensure a file was uploaded
  if (!newProfilePicture) {
    return res.status(400).json({ error: 'No picture uploaded' });
  }

  const allowedTypes = ['.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(newProfilePicture.originalname).toLowerCase();

  // Check if the uploaded file is of an allowed type
  if (!allowedTypes.includes(fileExtension)) {
    return res.status(400).json({ error: 'Unsupported file type' });
  }

  const existingProfilePicturePath = path.join(`res/avatars/${username}${fileExtension}`)

  // Check if the file exists before renaming
  if (fs.existsSync(existingProfilePicturePath)) {
    fs.unlinkSync(existingProfilePicturePath);
  }

  // Rename the uploaded file
  fs.renameSync(newProfilePicture.path, `../${existingProfilePicturePath}`);

  // Update the password in the database
  const updateProfileQuery = 'UPDATE users SET dp = ? WHERE username = ?';

  // Replace backslashes with forward slashes in the file path
  const sanitizedProfilePath = existingProfilePicturePath.replace(/\\/g, '/');

  db.query(updateProfileQuery, [sanitizedProfilePath, username], (updateErr) => {
    if (updateErr) {
      console.error('Error updating profile picture:', updateErr);
      return res.status(500).json({ message: 'Error updating profile picture' });
    }
  });

  try {
    // Respond with the path of the updated profile picture
    res.json(sanitizedProfilePath);
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/editor', (req, res) => {
  if (req.session.theuser) {
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('text/html')) {
      res.sendFile(path.join(__dirname, './../../BBCLive/Manager/Content Manager/cm-editor.html'));
    } else {
      const username = req.session.theuser.username;
      const fetchQuery = 'SELECT filename, filepath, type FROM resources WHERE author = ?';

      db.query(fetchQuery, [username], (err, results) => {
        if (err) {
          console.error('MySQL fetch error:', err);
          res.status(500).json({ error: 'Error fetching resources from database', details: err });
        } else {
          console.log(username);
          res.status(200).json(results);
        }
      });
    }
  } else {
    res.redirect('/')
  }
});

app.get('/inserToScene', (req, res) => {
  const fetchVidQuery = 'SELECT filepath FROM resources';

  db.query(fetchVidQuery, (err, results) => {
    if (err) {
      console.error("video unavailable");
      return
    }
    const insertQuery = 'INSERT INTO filepath(scenes) VALUES ?';

    const videoV = results.map((row) => [row.filePath]);

    db.query(insertQuery, [videoV], (err, results) => {
      if (err) {
        console.error("Can't insert video");
      }
    });
  });
})


app.get('/fetchFromRes', (req, res) => {
  const fetchQuery = 'SELECT filepath, filename, type FROM resources';

  db.query(fetchQuery, (err, results) => {
    if (err) {
      console.error(err + "Unable to retrieve from Database");
      return
    } else {

    }
  })
})

app.get('/getDateTime', (req, res) => {
  const now = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = daysOfWeek[now.getDay()];
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  res.json({ dayOfWeek, date, time });
});

app.get('/fetchVideo', async (req, res) => {
  const videoData = await fetchVideoForCurrentTime();
  res.json({ videos: videoData });
});

const fetchVideoForCurrentTime = () => {
  return new Promise((resolve, reject) => {
    // Get the current time
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];

    // Log the SQL query and the parameter value
    const queryString = 'SELECT filepath, starttime FROM scenes WHERE date=? AND starttime LIKE ?';
    const queryParam = `${currentTime}%`;
    console.log(queryParam)
    // Execute a query to get the video with a start time that matches the hour and minute of the current time
    db.query(
      queryString,
      [getCurrentDate(), queryParam],
      (error, results) => {
        if (error) {
          console.error('Error querying the database:', error);
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

app.get('/getDate', (req, res) => {
  const currentDate = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  res.json({ date: formattedDate });
});

function getCurrentDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}

app.get('/getResourceFilePath', (req, res) => {
  try {
    const content = req.query.content;

    // Execute a query to get the file path based on the content
    db.query(
      'SELECT filePath FROM resources WHERE filename = ?',
      [content],
      (error, results) => {
        if (error) {
          console.error('Error querying the database:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          if (results.length > 0) {
            const filePath = results[0].filePath;
            res.json(filePath); // Return only the file path
          } else {
            res.status(404).json({ error: 'File path not found for the given content' });
          }
        }
      }
    );
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getUserSchedules', (req, res) => {
  if (req.session.theuser) {
    const username = req.session.theuser.username;
    const query = 'SELECT day, username FROM schedules WHERE username = ?;';
    db.query(query, [username], (error, results) => {
      if (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).send('Server Error');
      } else {
        const schedules = results.map(result => ({ day: result.day, username: result.username }));
        console.log(username)
        console.log(schedules)
        res.json(schedules);
      }
    });
  } else {
    res.redirect('/');
  }
});

// Endpoint to fetch scenes from the database
app.get('/fetchScenes', (req, res) => {
  const query = 'SELECT * FROM scenes';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

app.post('/saveScene', (req, res) => {
  const resources = req.body.resources;

  // Insert scene information into the MySQL database
  const query = 'INSERT INTO scenes (scenename, filepath, date, starttime, endtime) VALUES ?';

  const values = resources.map(resource => [
    resource.title,
    // Convert the full URL to a relative path
    path.relative('http://localhost:3000', resource.videoSrc),
    new Date().toISOString().split('T')[0], // Current date
    resource.startTime,
    resource.endTime,
  ]);

  db.query(query, [values], (err, results) => {
    if (err) {
      console.error('Error saving scene to MySQL:', err);
      res.json({ success: false, error: err.message });
    } else {
      console.log('Scene saved to MySQL');
      res.json({ success: true });
    }
  });
});

let currentSrc = "";
let currentTimeStamp = "";

app.post('/setVideoInfo', (req, res) => {
  const { src, currentTime } = req.body;
  // Update global variables
  currentSrc = src.substring(3);
  currentTimeStamp = currentTime;
  res.json({ success: true });
});

app.get('/getVideoInfo', (req, res) => {
  // Retrieve global variables
  res.json({ currentSrc, currentTimeStamp });
});