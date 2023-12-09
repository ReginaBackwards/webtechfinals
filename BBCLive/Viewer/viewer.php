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
    
        <div class="container">
            <iframe src="http://localhost:3000/Manager/Content%20Manager/cm-home.html#my-video" scrolling="no" frameborder="0" 
            height="650px" width="100%" style="position:absolute; clip:rect(69px,1400px,800px,80px); margin-top: -69px;"></iframe>
        </div>

    </section>
</body>

