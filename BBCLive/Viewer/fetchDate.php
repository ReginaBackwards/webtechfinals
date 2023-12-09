<!-- 
    Authors:
        DELA CRUZ, Janbert
        DIMACALI, Paul Ivan
        LACORTE, Abby Gaile
        PALAFOX, Leoneil Luis
        ROSANTO, Marvin
        SLAY, America Eloise
 -->
 
<?php

// Fetch date from the Node.js server
$dateJson = file_get_contents('http://localhost:3000/getDate');
$dateData = json_decode($dateJson, true);
$livestreamDate = isset($dateData['date']) ? $dateData['date'] : 'Unknown Date';

?>
