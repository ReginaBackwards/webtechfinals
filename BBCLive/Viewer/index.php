<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="viewerstyles/css/viewer-style.css">
    <link href="https://vjs.zencdn.net/8.6.1/video-js.css" rel="stylesheet">
    <script src="https://vjs.zencdn.net/7.15.4/video.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <title>Viewer</title>
</head>
<body>
    <header>
        <div class="logo"><img src="../res/slu-logo.png" alt="logo" id="sluLogo"> </div>
        <?php include 'fetchDate.php'; ?>
        <h1>Welcome to BBC Live's Livestream for <?php echo $livestreamDate; ?></h1>
    </header>

    <section>

<video id="my-video" width="640" height="360" controls autoplay></video>
</section>
</body>
<script>
const socket = new WebSocket('ws://192.168.2.103:5000');
const videoElement = document.getElementById('my-video');

let currentVideoUrl = null; // Track the current video URL

// Function to fetch video information
function fetchVideoInfo() {
  fetch('http://192.168.2.103:3000/getVideoInfo')  // Replace with the actual endpoint to fetch video info
    .then((response) => response.json())
    .then((data) => {
      const videoUrl = data.currentSrc;
      const currentTime = (data.currentTimeStamp + 1.05);

      console.log('Fetched video info:', { videoUrl, currentTime });

      // Check if the video URL is the same
      if (videoUrl === currentVideoUrl) {
        // Set only the current time
        videoElement.currentTime = currentTime;
      } else {
        // Set both the video URL and current time
        videoElement.src = videoUrl;
        videoElement.currentTime = currentTime;
        currentVideoUrl = videoUrl; // Update the current video URL
      }

      // Send the video info to the server through WebSocket
      socket.send(JSON.stringify({ videoUrl, currentTime }));
    })
    .catch((error) => {
      console.error('Error fetching video info:', error);
    });
}

// Add a click event listener to the play button
videoElement.addEventListener('play', () => {
  console.log('Play button clicked');
  fetchVideoInfo();
});

// WebSocket event handlers
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const videoUrl = data.videoUrl;
  const currentTime = data.currentTime;

  console.log('Received video data:', { videoUrl, currentTime });  // Debugging message
  
  // Check if the video URL is the same
  if (videoUrl === currentVideoUrl) {
    // Set only the current time
    videoElement.currentTime = currentTime;
  } else {
    // Set both the video URL and current time
    videoElement.src = videoUrl;
    videoElement.currentTime = currentTime;
    currentVideoUrl = videoUrl; // Update the current video URL
  }
};

socket.onopen = () => {
  console.log('WebSocket connection opened');
  fetchVideoInfo(); // Fetch initial video info when WebSocket connection is opened
};

socket.onclose = (event) => {
  console.error(`WebSocket closed: ${event.reason}`);
};

// Enable controls for the video
videoElement.controls = true;


</script>
