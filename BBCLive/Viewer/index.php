<!-- 
    Authors:
        DELA CRUZ, Janbert
        DIMACALI, Paul Ivan
        LACORTE, Abby Gaile
        PALAFOX, Leoneil Luis
        ROSANTO, Marvin
        SLAY, America Eloise
 -->

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
    <h1>Welcome to BBC Live's Livestream for
      <?php echo $livestreamDate; ?>
    </h1>
  </header>

  <section>
    <video id="my-video" width="100%" height="92%" controls autoplay></video>
    <canvas id="liveStream" width="1080" height="720"></canvas>
  </section>

  <?php include "../res/footer.html"
?>

</body>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://192.168.1.9:5000');
    const videoElement = document.getElementById('my-video');
    const streamedCanvas = document.getElementById('liveStream');
    const ctx = streamedCanvas.getContext('2d');

    let currentVideoUrl = null; // Track the current video URL

    // Function to fetch video information
    function fetchVideoInfo() {
      fetch('http://192.168.1.9:3000/getVideoInfo')
        .then((response) => response.json())
        .then((data) => {
          const videoUrl = data.currentSrc;
          const currentTime = (data.currentTimeStamp + 1.05);

          console.log('Fetched video info:', { videoUrl, currentTime });
          console.log("Data Type");
          console.log(data.type);

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

    function updateStreamedCanvas(receivedData) {
      const { width, height, data } = receivedData;

      // Create a Uint8ClampedArray from the received data
      const uint8Array = new Uint8ClampedArray(data);

      // Create a new ImageData object from the array
      const imageData = new ImageData(uint8Array, width, height);

      // Clear the canvas before drawing
      ctx.clearRect(0, 0, streamedCanvas.width, streamedCanvas.height);

      // Draw the image data onto the canvas
      ctx.putImageData(imageData, 0, 0);
    }

    // Add a click event listener to the play button
    videoElement.addEventListener('play', () => {
      console.log('Play button clicked');
      fetchVideoInfo();
    });

    // WebSocket event handlers
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'stream') {
        videoElement.pause();
        videoElement.style.display = 'none';
        streamedCanvas.style.display = 'block'
        updateStreamedCanvas(data);


      } else {
        videoElement.style.display = 'block';
        streamedCanvas.style.display = 'none'
        const videoUrl = data.videoUrl;
        const currentTime = data.currentTime;

        console.log('Received video data:', { videoUrl, currentTime });

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

  });

</script>