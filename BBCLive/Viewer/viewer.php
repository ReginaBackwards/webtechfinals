<?php
include("index.html");

$server = "localhost";
$username = "root";
$password = "";
$database = "bbc_live_db";

$conn = new mysqli($server, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection Failed: " . $conn ->connect_error);
}

// $currentTime = date('G');
// $currentMinute = date('i');

$query = "SELECT * FROM resources";
$stmt = $conn->stmt_init();
$stmt->prepare($query);
$stmt->execute();
// $result = $conn->query($query);
// $query2 = "SELECT * FROM scenes";
// $real = $conn->real_init();
// $real->prepare($query2);
// $real->execute();

// $real->bind_result($scenename, $filepath, $date, $starttime, $endtime);

//     while ($row = $real->fetch()) {
//         if (!$row) {
//             die('Video not found')
//         }
//         if($currentTime === $starttime && $currentMinute <= $endtime) {
//             $timeDif = $currentMinute - $starttime;

//             echo "
//             <video
//             id='my-video'
//             class='video-js'
//             preload='auto'
//             height='500'
//             width='1000'
//             controls: 'false'
//             poster='../res/dog style.jpg'
//             data-setup='{}'
//             start='$timeDif'
//             >

//         <source src='../Manager/$filepath/$filename' type ='video/mp4' />

//         <p>
//             <a href = 'https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
//         </p>
//         </video>";
//         }
//     }
        

$stmt->bind_result($filename, $filepath, $author, $dateuploaded, $type);

    while ($row = $stmt->fetch()) {
        if (!$row) {
            die('Video not found');
        }


        echo "
        <video
        id='my-video'
        class='video-js'
        preload='auto'
        height='500'
        width='1000'
        controls: 'false'
        poster='../res/dog style.jpg'
        data-setup='{}'
        >

        <source src='../Manager/$filepath/$filename' type ='video/mp4' />

        <p>
            <a href = 'https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
        </p>
        </video>";
    }
$stmt->close();
$conn->close();
?>
