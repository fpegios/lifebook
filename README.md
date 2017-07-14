# Lifebook Social network

### Prerequisites
  - XAMPP Installation
  - Bower
  
### Instructions
- Clone the project to the path **./xampp/htdocs**
- Open XAMPP control panel and start Apache Server and MySQL
- Open the browser and go to **http://localhost/phpmyadmin/**
- Create a new database and import the sql file **/xampp/htdocs/lifebook/lifebook_db.sql** which contains all the tables
- Open  **./xampp/htdocs/lifebook/services.api.php** nd insert your database details in lines 9 to 12
- Open  **./xampp/htdocs/lifebook/upload-services/upload-img-cover.php** and insert your database details in lines 34 to 37
- Open  **./xampp/htdocs/lifebook/upload-services/upload-img-profile.php** and insert your database details in lines 34 to 37
- Go to **./xampp/htdocs/lifebook** and execute the following command to load dependencies:
``sh
$ bower install
``
- Open browser and go to **http://localhost/lifebook/** to run the project