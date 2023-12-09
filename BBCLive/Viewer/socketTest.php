<video id="my-video" width="640" height="360" controls autoplay></video>

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
