<video id="my-video" width="640" height="360" controls autoplay></video>

<script>
const socket = new WebSocket('ws://localhost:5000');
const videoElement = document.getElementById('my-video');

socket.onmessage = (event) => {
  const videoUrl = event.data;
  console.log('Received video URL:', videoUrl);  // Debugging message
  videoElement.src = videoUrl;
};

socket.onopen = () => {
  console.log('WebSocket connection opened');
};

socket.onclose = (event) => {
  console.error(`WebSocket closed: ${event.reason}`);
};
</script>
