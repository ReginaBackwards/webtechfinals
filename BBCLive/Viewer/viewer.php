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
            <?php include 'fetchDate.php'; ?>
            <p>Livestream for <?php echo $livestreamDate; ?></p>
            </div>
        </div>

        <script>
            function updateVideoPlayer() {
                // Fetch video information from Node.js server
                fetch('http://localhost:3000/fetchVideo')
                    .then(response => response.json())
                    .then(data => {
                        const videoInfo = data.videos;

                        if (videos && videos.length > 0) {
            const video = videos[0];
            const player = videojs('my-video');
            console.log(video);

            // Check if the video is not already playing
            if (player.paused()) {
              // Change the source and play the video
              player.src({ src: `./..${video.filepath}`, type: 'video/mp4' });
              player.load();
              player.play();
            }
        
        }
        })
        .catch((error) => {
          console.error('Error fetching video:', error);
        });
    }

            // Periodically update the video player
            setInterval(updateVideoPlayer, 15000); 
        </script>

    </section>
</body>

