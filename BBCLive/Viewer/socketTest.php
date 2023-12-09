<video id="my-video" width="640" height="360" controls autoplay></video>

<script>
const socket = new WebSocket('ws://localhost:5000');
const videoElement = document.getElementById('my-video');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const videoUrl = data.videoUrl;
  const currentTime = data.currentTime;
  
  console.log('Received video data:', { videoUrl, currentTime });  // Debugging message
  
  // Set video URL and current time
  videoElement.src = videoUrl;
  videoElement.currentTime = currentTime;

  // Check if the video is currently playing
  if (!videoElement.paused) {
    // Video is playing, do nothing for now
    console.log('Video is playing, no need to fetch resources.');
  } else {
    // Video is not playing, fetch resources
    fetchResources();
  }
};

socket.onopen = () => {
  console.log('WebSocket connection opened');
  fetchInitialVideoInfo();
};

socket.onclose = (event) => {
  console.error(`WebSocket closed: ${event.reason}`);
};

// Disable controls and enable autoplay
videoElement.controls = false;
videoElement.autoplay = true;

// Function to fetch initial video information
function fetchInitialVideoInfo() {
  fetch('/fetchInitialVideoInfo')  // Replace with the actual endpoint to fetch video info
    .then((response) => response.json())
    .then((data) => {
      const videoUrl = data.videoUrl;
      const currentTime = data.currentTime;

      console.log('Fetched initial video info:', { videoUrl, currentTime });

      // Set video URL and current time
      videoElement.src = videoUrl;
      videoElement.currentTime = currentTime;

      // Send the initial video info to the server through WebSocket
      socket.send(JSON.stringify({ videoUrl, currentTime }));
    })
    .catch((error) => {
      console.error('Error fetching initial video info:', error);
    });
}

// Function to fetch resources
function fetchResources() {
  console.log('Fetching resources...');
  // Add your logic to fetch resources here
}
</script>
