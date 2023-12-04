// const videojs = require('video.js');
// const express = require('express');
// const path = require('path');
// const mysql = require('mysql');

// const app = express();
// const port = 3000;

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'bbc_live_db',
//   });

//   db.connect((err) => {
//     if (err) {
//       console.error('Error connecting to database:', err);
//       return;
//     }
//     console.log('Connected to the database');
//   });

//   app.use(express.static(path.join(__dirname, 'public')));

//   app.get('/', (req, res) => {
//     const sql = 'SELECT * FROM resources';
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error('Error query database', err);
//             res.status(500).send('Interrnal Server Error');
//             return;
//         }
//         res.send(getHtmlPage(results));
//     });
//   });

//   function getHtmlPage(videodata) {
//     const videoElements = videodata.map(row => {
//         const mp4file = row.filename;
//         return `<video id="my-video-${row.id}" class="video-js" preload="auto" height="500" width="1000" controls poster="../res/dog_style.jpg" data-setup="{}">
//         <source src="data:video/mp4;base64,${Buffer.from(mp4file).toString('base64')}" type="video/mp4">
//       </video>`;
//     });
//     return ``
//   }
  
//   app.listen(port, 'localhost', () => {
//     console.log(`Server is running at http://localhost:${port}`);
//   });