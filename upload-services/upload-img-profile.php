<?php

    $uid = $_POST["uid"];

    if(isset($_FILES['file'])){
        
        $errors= array(); 
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_name = $_FILES['file']['name'];
        $file_size = $_FILES['file']['size'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $extensions = array("jpeg","jpg","png");
        $final_name = "users/profile_imgs/" . $uid . "." . "jpg";
        
        if(in_array($file_ext,$extensions ) === false){
            $errors[] = "image extension not allowed, please choose a JPEG or PNG file.";
            $error_msg = "image extension not allowed, please choose a JPEG or PNG file.";
            $response = array('status' => "failed", "msg" => "Upload Failed.", "error" => $error_msg);
            echo json_encode($response);
        }
        if($file_size > 4097152){
            $errors[] = 'File size cannot exceed 4 MB';
            $error_msg = 'File size cannot exceed 4 MB';
            $response = array('status' => "failed", "msg" => "Upload Failed.", "error" => $error_msg);
            echo json_encode($response);
        }     
        
        
        if(empty($errors) == true){
            
            if (move_uploaded_file($file_tmp, "../" . $final_name)) {
                
                // DB CREDENTIALS ***ENTER YOUR OWN DB CREDENTIALS***
                $servername = "127.0.0.1";
                $username = "fpegios";
                $password = "1234";
                $dbname = "lifebook";   

                // Create connection
                $conn = new mysqli($servername, $username, $password, $dbname);
                // Check connection
                if ($conn->connect_error) {
                    die("Connection failed: " . $conn->connect_error);
                } 

                $query = "UPDATE users SET profile_img = '$final_name' WHERE id = '$uid'";

                if ($conn->query($query) === TRUE) {
                    $response = array('status' => "success", "msg" => "Photo Uploaded Successfully.", "img" => $final_name);
                    echo json_encode($response);
                    $conn->close();
                } else {
                    $error_msg = "Error: " . $query . "<br>" . $conn->error;
                    $response = array('status' => "failed", "msg" => "Upload Failed.", "error" => $error_msg);
                    echo json_encode($response);
                    $conn->close();
                }
            
            } else {
                $error_msg = "Sorry, there was an error uploading your file.";
                $response = array('status' => "failed", "msg" => "Upload Failed.", "error" => $error_msg);
                echo json_encode($response);
            }
        } 
    }
?>