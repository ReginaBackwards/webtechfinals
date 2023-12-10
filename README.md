PRECONDITION:
    The project folder (webtechfinals) must be located within WAMP 
    Navigate to C:\wamp64\www and make sure webtechfinals is located within

STEP 1: Running WAMP
	1. Open wamp server
	2. Make sure the apache and mysql services are up and running
	3. Click on wamp and naviagte to Apache.
	4. Under Apache, open and configure these files
			httpd.conf 
			httpd-vhosts.conf
		** Replace all 'denied' keywords with 'granted' 

STEP 2: Run app.js
	1. Open the Command Prompt
	2. Navigate to where app.js is located. 
		cd C:\wamp64\www\webtechfinals\BBCLive\Manager\app.js  (Replace the path with the actual location of app.js)
	3. Run this command to start app.js
		node app.js
	4. You should see a confirmation message that the server is running and that you are connected to the database
		Server is running at http://localhost:3000
		Connected to the database

STEP 3: Run server.php
Preconditions:
            Make sure PHP is available.

            Make sure Composer is installed, if not, you can download the installer here:
			https://getcomposer.org/download/

            ** In the Composer Installation Wizard (Settings Check), make sure to select the option 'Add this PHP to your path?' 
            (This option does not appear if PHP is already setup in the system variables)

            ** The command-line PHP path selected for this project is at C:\wamp64\bin\php\php8.2.0\php.exe (Latest version if possible)

	1. Open the Command Prompt
	2. Navigate to where server.php is located
		cd C:\wamp64\www\webtechfinals\BBCLive\Viewer  (Replace the path with the actual location of app.js on your computer)
	3. Run this command to start server.php
		php server.php

        ** If there are errors regarding the version of PHP required by Composer, run this command:
        composer update

STEP 4: Accessing the web application (to be used as Content Manager or Admin) 
	1. The confirmation message provided earlier in Step 1 contains the URL of the hosted web application, type it into your browser.
		http://localhost:3000
	2. The displayed page should be the Tubero Login
	3. You can choose whether to login as an Admin or as a Content Manager and access the role's features

STEP 5: Viewing the hosted program schedules as a Viewer
Precondition:
            The IP address within the code of index.php is set to the IP address of the server
            Edit these lines of code: Replace with the IP address of the server
                const socket = new WebSocket('ws://192.168.2.103:5000');
                  fetch('http://192.168.2.103:3000/getVideoInfo')

	1. To access the Viewer website, type the IP address of the server and the path of the index.php for the Viewer
		xxx.xxx.xxx.xxx/webtechfinals/BBCLive/Viewer/ (Replace xxx.xxx.xxx.xxx with the actual IP address of the server)

** Accessing the Viewer module on a diufferent terminal
	Make sure the firewall protection for both Private and Public networks is turned off