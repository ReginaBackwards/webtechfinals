<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="viewerstyles/css/viewer-style.css">
    <link href="https://vjs.zencdn.net/8.6.1/video-js.css" rel="stylesheet">
    <script src="https://vjs.zencdn.net/7.15.4/video.js"></script>
    <title>Viewer</title>
</head>
<body>
    <header>
        <div class="logo"><img src="../res/slu-logo.png" alt="logo" id="sluLogo"> </div>
    </header>

    <section>
    <h1>Welcome to BBC Live!</h1>
        <div class="container">
            <video id="my-video" class="video-js vjs-default-skin" controls width="640" height="360">
            </video>
            <div class="title-below-video" id="livestream-title">
                <p>Livestream for <span id="livestream-date"></span></p>
            </div>
        </div>

        <script>
            function updateVideoPlayer() {
                // Fetch video information from Node.js server
                fetch('localhost:3000/fetchVideoInfo')
                    .then(response => response.json())
                    .then(data => {
                        const videoInfo = data.videoInfo;

                        // Update video player
                        const player = videojs('my-video');
                        player.src({ src: `./../..${videoInfo.filepath}`, type: 'video/mp4' });

                        // Update livestream date
                        document.getElementById('livestream-date').textContent = videoInfo.date;
                    })
                    .catch(error => {
                        console.error('Error fetching video information:', error);
                    });
            }

            // Periodically update the video player
            setInterval(updateVideoPlayer, 1000); 
        </script>

    </section>
</body>

