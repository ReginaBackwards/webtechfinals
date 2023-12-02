const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

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

// Endpoint for handling login requests
app.post('/home', (req, res) => {
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
    
      // Assuming you have a 'role' field in your users table
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
                  <a href="#" class="reset" title="Reset" data-toggle="tooltip"><i class="material-icons">&#xF053;</i></a>
                  <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
                  <a href="#" class="ban" title="Ban" data-toggle="tooltip"><i class="material-icons">&#xE14B;</i></a>
                </td>
              </tr>
            `;
          });
    
          // Read the admin-home.html file
          const adminHomeHTML = require('fs').readFileSync(path.join(__dirname, './Admin/admin-home.html'), 'utf8');

          // Replace the placeholder with the generated user list HTML
          const finalHTML = adminHomeHTML.replace('<!-- USER_LIST_PLACEHOLDER -->', userListHTML);

          // Send the modified HTML to the client
          res.send(finalHTML);
        });
      } else if (user.role === 'cm') {
        // Redirect to cm page
        return res.sendFile(path.join(__dirname, './Content Manager/cm-home.html'));
      }
    } else {
      // Inform the user about invalid credentials
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, 'localhost', () => {
  console.log(`Server is running at http://localhost:${port}`);
});
