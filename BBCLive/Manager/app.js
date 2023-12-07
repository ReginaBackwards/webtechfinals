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
  if (req.session.theuser) {
    // Retrieve admin details from the session
    // Check if the admin session exists
    if (req.session.theuser && req.session.theuser.role === 'admin') {
      // Admin session exists, send admin details
      const adminDetails = {
        dp: req.session.theuser.dp || './../res/avatars/default.png', // Default image URL
        firstname: req.session.theuser.firstname || 'Admin', // Default first name
        lastname: req.session.theuser.lastname || 'Name', // Default last name
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
      dp: './../../res/avatars/default.png', // Default image URL
      firstname: 'Content', // Default first name
      lastname: 'Manager', // Default last name
    };
    
    res.json(cmDetails);
  } else {
    response.redirect('/')
  }
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
        // res.redirect('/');
        res.json({success:true, redirectURL: '/'})
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
      // return res.sendFile(path.join(__dirname, './Content Manager/resources.html'));
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

// Add this route in your Node.js server file
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
  } else {
    response.redirect('/')
  }
});

// Log out endpoint
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});


// ALWIN MALWIN

// const uploadDir = path.join('uploads');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

const contentHostingDir = path.join(__dirname ,'./../../BBCLive/Content Hosting/');

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
      // const username = 'alwin'; // This for testing only
      const username = req.session.theuser.username;
      
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
        const userUploadDir = path.join(contentHostingDir, fileType);
        
        if (!fs.existsSync(userUploadDir)) {
          fs.mkdirSync(userUploadDir, { recursive: true });
        }
        
        let filename;
        
        if (fileType === 'images') {
          filename = path.join(userUploadDir, file.originalname);
          await sharp(file.buffer).toFile(filename);
        } else {
          filename = path.join(userUploadDir, file.originalname);
          fs.writeFileSync(filename, file.buffer);
        }
        
        const relativePath = path.relative(contentHostingDir, filename);
        
        const insertQuery = 'INSERT INTO resources (filename, filepath, author, dateuploaded, type) VALUES (?, ?, ?, NOW(), ?)';
        const values = [file.originalname, relativePath, username, fileType];
        
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
  } else {
    response.redirect('/');
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

function getFileType(fileExtension) {
  if (fileExtension === '.mp3') {
    return 'audio';
  } else if (fileExtension === '.mp4') {
    return 'videos/clips';
  } else if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
    return 'images';
  }
}

// Endpoint to handle the redirect to resources.html
app.get('/gotoresources', (req, res) => {
  //if checks for user session existence
  res.json({ success: true });
});

// Endpoint to handle the redirect to cm-home.html
app.get('/cm-home', (req, res) => {
  //if checks for user session existence
  res.json({success:true, redirectURL: '/'})
  // res.json({ success: true });
});

app.get('/gotoeditor', (req, res) => {
  //if checks for user session existence
  res.json({ success: true });
});

app.get('/settings', (req, res) => {
  const { username, currentPassword, newPassword, confirmPassword, newProfilePicture } = req.body;
  
  // Query the database to get the current user's information
  const query = 'SELECT * FROM users WHERE username = ?';
  
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error executing database query:', err);
      return res.status(500).json({ message: 'Server Error' });
    }
    
    if (results.length > 0) {
      const user = results[0];
      
      // Check if the db password matches the current
      if (currentPassword == password) {
        if (newPassword == confirmPassword) {
          // Update the password in the database
          const updatePasswordQuery = 'UPDATE users SET password = ? WHERE username = ?';
          
          db.query(updatePasswordQuery, [newPassword, username], (updateErr) => {
            if (updateErr) {
              console.error('Error updating password:', updateErr);
              return res.status(500).json({ message: 'Error updating password' });
            }
          });
        } else {
          
          alert("Password does not match!");
        }
      } else { 
        alert("Wrong password!");
      }
      
      if (newProfilePicture) {
        const uploadProfileDir = path.join(__dirname, './../res/avatars');
        
        const profile = req.files;
        
        if (!profile || profile.length === 0) {
          return res.status(400).json({ error: 'No picture uploaded' });
        }
        
        const fileExtension = path.extname(profile[0].originalname).toLowerCase();
        const allowedTypes = ['.jpg', '.jpeg', '.png'];
        
        if (!allowedTypes.includes(fileExtension)) {
          console.log('Unsupported file type:', fileExtension);
          return res.status(400).json({ error: 'Unsupported file type' });
        }
        
        const filePath = path.join(uploadProfileDir, username);
        
        // Check if the file with the same name already exists
        if (fs.existsSync(filePath)) {
          // Delete the existing file
          fs.unlinkSync(filePath);
        }
        
        fs.writeFileSync(filePath, profile[0].buffer);
        
        const updateProfilePictureQuery = 'UPDATE users SET dp = ? WHERE username = ?';
        
        db.query(updateProfilePictureQuery, [filePath, username], (updateErr) => {
          if (updateErr) {
            console.error('Error updating profile picture:', updateErr);
            return res.status(500).json({ message: 'Error updating profile picture' });
          }
          
          res.status(200).json({ message: 'Profile picture updated successfully' });
        });
      }
      
      // Redirect to the root URL '/'
      res.redirect('/');
    } else {
      // User not found, redirect to login page
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

//BOLS
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
    response.redirect('/')
  }
});

app.get('/inserToScene', (req, res) => {
  const fetchVidQuery = 'SELECT filepath FROM resources';

  db.query(fetchVidQuery, (err, results) => {
    if(err) {
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
});

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




