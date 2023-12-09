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
const socket = new WebSocket('ws://localhost:5000');
const videoElement = document.getElementById('my-video');

socket.onmessage = (event) => {
    console.log('Received raw data:', event.data);  // Log raw data
  const data = JSON.parse(event.data);
  const videoUrl = data.videoUrl;
  const currentTime = data.currentTime;
  
  console.log('Received video data:', { videoUrl, currentTime });  // Debugging message
  
  // Set video URL and current time
  videoElement.src = videoUrl;
  videoElement.currentTime = currentTime;
};

socket.onopen = () => {
  console.log('WebSocket connection opened');
};

socket.onclose = (event) => {
  console.error(`WebSocket closed: ${event.reason}`);
};

// Disable controls and enable autoplay
videoElement.controls = false;
videoElement.autoplay = true;
</script>
