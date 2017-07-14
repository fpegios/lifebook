<?php
 	require_once("Rest.inc.php");
	
	class API extends REST {
	
		public $data = "";
        
        // DB CREDENTIALS ***ENTER YOUR OWN DB CREDENTIALS***
        const DB_SERVER = "localhost";
        const DB_USER = "fpegios";
        const DB_PASSWORD = "1234";
        const DB = "lifebook";

		private $db = NULL;
		private $mysqli = NULL;
        
		public function __construct(){
			parent::__construct();				// Init parent contructor
			$this->dbConnect();					// Initiate Database connection
		}
		
		/*
		 *  Connect to Database
		*/
		private function dbConnect(){
			$mysqli = $this->mysqli = new mysqli(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD, self::DB);
            mysqli_set_charset($mysqli, "utf8");
            if ($mysqli->connect_errno) {
                $this->response('', 204); // server error 
            }
		}
		
		/*
		 * Dynmically call the method based on the query string
		 */
		public function processApi(){
			$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
			if((int)method_exists($this,$func) > 0) {
                $this->$func();
            }
			else {
               $this->response('',404); // If the method not exist with in this class "Page not found". 
            }
				
		}
        
				
		private function validateSignup(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $data = json_decode(file_get_contents("php://input"));
            $email = $data->email;
            $username = $data->username;     
            $emailAvailable = true;
            $usernameAvailable = true;
                    
            $query = "SELECT * FROM users WHERE email = '$email'";
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) {
                    $emailAvailable = false;
                }                
            } else {
                $this->response('', 204); // server error 
            }
            
            $query = "SELECT * FROM users WHERE username = '$username'";
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) {
                    $usernameAvailable = false;
                }
            } else {
                $this->response('', 204); // server error
            }
            
            
            // If success everythig is good send header as "OK" and details
            $response = array('status' => "SUCCESS", "emailAvailable" => $emailAvailable, "usernameAvailable" => $usernameAvailable);
            $this->response($this->json($response),200);   
		}
		
		private function signup(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$user = json_decode(file_get_contents("php://input"));
            $firstname= $user->firstname;
            $lastname = $user->lastname;
            $username = $user->username;
            $email = $user->email;
            $password= md5($user->password);
            $gender = $user->gender;
            $birthdate = $user->birthdate;
            $profile_img = "img/profile-default.jpg";
            $cover_img = "img/cover-default.jpg";
                        
            
            $query = "INSERT INTO users (firstname, lastname, username, email, password, gender, birthdate, profile_img, cover_img) VALUES ('$firstname', '$lastname', '$username', '$email', '$password', '$gender', '$birthdate', '$profile_img', '$cover_img')";
            
            $result = $this->mysqli->query($query);
            
			if($result != NULL){
				$response = array('status' => "SUCCESS");
				$this->response($this->json($response),200); // user signed up
			} else {
                $this->response('',204); // server error
            }
		}		
		
        private function login(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $data = json_decode(file_get_contents("php://input"));
            $email = $data->email;
            $password = md5($data->password); 
                    
            $query = "SELECT id,email,firstname,lastname,username FROM users WHERE email = '$email' AND password = '$password'";
            
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'user' => $resarray);
                    $this->response($this->json($response), 200); // user logined
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response),200);  // no user 
                }
            } else {
                $this->response('', 204); // SERVER ERROR
            }
		}       
        
        
        private function getPosts(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
                    
            $query = "SELECT * FROM posts WHERE uid = '$uid' ORDER BY date DESC LIMIT 30";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'posts' => $resarray); 
                    $this->response($this->json($response), 200); // get posts
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                }
            } else {
                $this->response('',204);	// SERVER ERROR
            }
            
            $this->response('',204);
		}
        
        private function insertPost(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$post = json_decode(file_get_contents("php://input"));
            $uid= $post->uid;
            $ufullname = $post->ufullname;
            $date = $post->date;
            $text = $post->text;
            $likes = $post->likes;
                        
            $query = "INSERT INTO posts (uid, ufullname, date, text, likes) VALUES ('$uid', '$ufullname', '$date', '$text', '$likes')";
            $result = $this->mysqli->query($query);

			if($result != NULL) {
				$response = array('status' => "SUCCESS", "id" => $this->mysqli->insert_id, "post" => $post);
				$this->response($this->json($response),200);
			} else {
			 	$this->response('',204); //"No Content" status
            }                               
		}
        
        
        private function deletePost(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$id = json_decode(file_get_contents("php://input"));
                 
            $query = "DELETE FROM posts WHERE id = '$id'";
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {				
				$query = "DELETE FROM post_likes WHERE pid = '$id'";
                $result = $this->mysqli->query($query);

                if ($result != NULL) {				
                    $response = array('status' => "SUCCESS");
                    $this->response($this->json($response),200);
                } else {
                    $this->response('',204);	// If no records "No Content" status                             
                }
			} else {
				$this->response('',204);	// If no records "No Content" status                             
            }
		}
        
        private function updatePost() {
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$post = json_decode(file_get_contents("php://input"));
            $id= $post->id;
            $text = $post->text;
                        
            $query = "UPDATE posts SET text = '$text' WHERE id = '$id'";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
            
			if ($result != NULL){
				$response = array('status' => "SUCCESS", "msg" => "Post updated successfully.");
				$this->response($this->json($response),200);
			} else {
			 	$this->response('',204); //"No Content" status
            }                               
		}
        
        private function insertPostLike(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$post_like = json_decode(file_get_contents("php://input"));
            $pid = $post_like->pid;
            $uid = $post_like->uid;
            $likes = $post_like->likes;
            $sender_id = $post_like->sender_id;
            $sender_name = $post_like->sender_name;
            $post_text = $post_like->post_text;
            $receiver_id = $post_like->receiver_id;
                        
            $query = "INSERT INTO post_likes (pid, uid) VALUES ('$pid', '$uid')";
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($result != NULL) {
                
                $query = "UPDATE posts SET likes = '$likes' WHERE id = '$pid'";
            
                $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                
				if($result != NULL) { // SEND NOTIFICATION
                    
                    if ($uid != $receiver_id) {
                        $query = "INSERT INTO like_notifications (sender_id, sender_name, post_text, receiver_id) VALUES ('$sender_id', '$sender_name', '$post_text', '$receiver_id')";
            
                        $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

                        if($result != NULL) {
                            $response = array('status' => "SUCCESS", "msg" => "Post Liked.");
                            $this->response($this->json($response),200);
                        } else {
                            $this->response('',204); //"No Content" status
                        }
                    } else {
                        $response = array('status' => "SUCCESS", "msg" => "Post Liked.");
                        $this->response($this->json($response),200);
                    }
                } else {
                    $this->response('',204); //"No Content" status
                }
			} else {
			 	$this->response('',204); //"No Content" status
            }                               
		}
        
        
        private function deletePostLike(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$post_like = json_decode(file_get_contents("php://input"));
            $pid = $post_like->pid;
            $uid = $post_like->uid;
            $likes = $post_like->likes;
                        
            $query = "DELETE FROM post_likes WHERE pid = '$pid' AND uid = '$uid'";
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($result != NULL) {
                
                $query = "UPDATE posts SET likes = '$likes' WHERE id = '$pid'";
            
                $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                    
                if($result != NULL) {
                    $response = array('status' => "SUCCESS", "msg" => "Post Disliked.");
                    $this->response($this->json($response),200);
                } else {
                    $this->response('',204); //"No Content" status
                } 
				
			} else {
			 	$this->response('',204); //"No Content" status
            } 
		}
        
        private function getUser(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
                                
            $query = "SELECT * FROM users WHERE id = '$uid'";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'users' => $resarray); 
                    $this->response($this->json($response), 200); // send user details
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                } 
            } else {
                $this->response('',204);	//"No Content" status 
            }
        }
        
        private function updateInfo(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$user = json_decode(file_get_contents("php://input"));
            $uid = $user->uid;
            $job = $user->job;
            $studies = $user->studies;
            $live_location = $user->live_location;
            $birth_location = $user->birth_location;
                        
            $query = "UPDATE users SET job = '$job', studies = '$studies', live_location = '$live_location', birth_location = '$birth_location' WHERE id = '$uid'";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($result != NULL) {
                $response = array('status' => "SUCCESS", "msg" => "Info updated.");
                $this->response($this->json($response),200);
            } else {
                $this->response('',204); //"No Content" status
            }                               
		}
        
        private function getUsers(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
                                
            $query = "SELECT * FROM users WHERE NOT id = '$uid' ORDER BY firstname ASC";
            
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'users' => $resarray); 
                    $this->response($this->json($response), 200); // get users
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no user 
                }
            } else {
                $this->response('',204);	// SERVER ERROR
            }
            
            $this->response('',204);
		}
        
        private function getFollowers(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
                  
            $uid = json_decode(file_get_contents("php://input"));
            
            $query = "SELECT is_following FROM followers WHERE follower = '$uid'";
            
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'followers' => $resarray); 
                    $this->response($this->json($response), 200); // get posts
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                }
            } else {
                $this->response('',204);	// SERVER ERROR
            }
            
            $this->response('',204);
		}
        
        private function followUser(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$data= json_decode(file_get_contents("php://input"));
            $follower = $data->follower;
            $is_following = $data->is_following;
                        
            $query = "INSERT INTO followers (follower, is_following) VALUES ('$follower', '$is_following')";
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($result != NULL) {
				$response = array('status' => "SUCCESS");
				$this->response($this->json($response),200);
			} else {
			 	$this->response('',204); //"No Content" status
            }                               
		}
        
        private function unfollowUser(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$data= json_decode(file_get_contents("php://input"));
            $follower = $data->follower;
            $is_following = $data->is_following;
                        
            $query = "DELETE FROM followers WHERE follower = '$follower' AND is_following = '$is_following'";
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

			if($result != NULL) {
				$response = array('status' => "SUCCESS");
				$this->response($this->json($response),200);
			} else {
			 	$this->response('',204); //"No Content" status
            }                               
		}
        
        private function getFollowersPosts(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input")); 
            
            $query = "SELECT * FROM posts WHERE uid = '$uid' OR uid IN (SELECT is_following FROM followers WHERE follower = '$uid') ORDER BY date DESC LIMIT 30";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'posts' => $resarray); 
                    $this->response($this->json($response), 200); // get posts
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                }
            } else {
                $this->response('',204);	// SERVER ERROR
            }
            
//            $this->response('',204);
		}
        
        private function getPostsLikes(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
                                
            $query = "SELECT pid FROM post_likes WHERE uid = '$uid'";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'post_likes' => $resarray); 
                    $this->response($this->json($response), 200); // send user details
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                }
            } else {
                $this->response('',204);	//"No Content" status 
            }
        }
        
        private function checkFollower(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
                  
            $data = json_decode(file_get_contents("php://input"));
            $follower = $data->follower;
            $is_following = $data->is_following;
            
            $query = "SELECT is_following FROM followers WHERE follower = '$follower' AND is_following = '$is_following'";
            
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $response = array('status' => "SUCCESS"); 
                    $this->response($this->json($response), 200); // get posts
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                }
            } else {
                $this->response('',204);	// SERVER ERROR
            }
		}
        
        private function getUsersMessages(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
            
            $query = "DELETE FROM message_notifications WHERE receiver_id = '$uid'";
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {				
				$query = "SELECT t1.uid, t1.name, t1.date FROM (SELECT sender_id as uid, sender_name as name, date FROM messages WHERE receiver_id = '$uid' UNION SELECT receiver_id as uid, receiver_name as name, date FROM messages WHERE sender_id = '$uid' ORDER BY date DESC) AS t1 GROUP BY t1.uid ORDER BY t1.date DESC";
            
                $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

                if ($result != NULL) {
                    if($result->num_rows > 0) { // EMAIL EXISTS
                        $resarray = array();
                        while($row = $result->fetch_assoc()){
                            $resarray[] = $row;
                        }
                        $response = array('status' => "SUCCESS", 'users' => $resarray); 
                        $this->response($this->json($response), 200); // send user details
                    } else {
                        $response = array('status' => "NOT_FOUND");
                        $this->response($this->json($response), 200);  // no post 
                    }
                } else {
                    $this->response('',204);	//"No Content" status 
                }
			} else {
				$this->response('',204);	// If no records "No Content" status                             
            }
        }
        
        private function getMessages(){
            if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
            
            $query = "SELECT id, sender_id as uid, sender_name as others_name, sender_name as sender_name, sender_id as sender_id, date, text FROM messages WHERE receiver_id = '$uid' UNION SELECT id, receiver_id as uid, receiver_name as others_name, sender_name as sender_name, sender_id as sender_id, date, text FROM messages WHERE sender_id = '$uid' ORDER BY date";
                    
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }

                    $response = array('status' => "SUCCESS", 'messages' => $resarray); 
                    $this->response($this->json($response), 200); // send user details
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no post 
                }
            } else {
                $this->response('',204);	//"No Content" status 
            }
        }
        
        private function sendMessage(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}

			$message = json_decode(file_get_contents("php://input"));
            $sender_id = $message->sender_id;
            $sender_name = $message->sender_name;
            $receiver_id = $message->receiver_id;
            $receiver_name = $message->receiver_name;
            $text = $message->text;
            $date = $message->date;
                        
            $query = "INSERT INTO messages (sender_id, sender_name, receiver_id, receiver_name, text, date) VALUES ('$sender_id', '$sender_name', '$receiver_id', '$receiver_name', '$text', '$date')";
            
            $result = $this->mysqli->query($query);

			if($result != NULL) {
                $query = "INSERT INTO message_notifications (sender_id, sender_name, receiver_id) VALUES ('$sender_id', '$sender_name', '$receiver_id')";

                $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

                if($result != NULL) {
                    $response = array('status' => "SUCCESS", "id" => $this->mysqli->insert_id);
                    $this->response($this->json($response),200);
                } else {
                    $this->response('',204); //"No Content" status
                }
			} else {
			 	$this->response('',204); //"No Content" status
            }                               
		}
                
        private function getUsersLight(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
                                
            $query = "SELECT id, firstname, lastname FROM users WHERE NOT id = '$uid' ORDER BY firstname ASC";
            
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                if($result->num_rows > 0) { // EMAIL EXISTS
                    $resarray = array();
                    while($row = $result->fetch_assoc()){
                        $resarray[] = $row;
                    }
                    $response = array('status' => "SUCCESS", 'users' => $resarray); 
                    $this->response($this->json($response), 200); // get users
                } else {
                    $response = array('status' => "NOT_FOUND");
                    $this->response($this->json($response), 200);  // no user 
                }
            } else {
                $this->response('',204);	// SERVER ERROR
            }
            
            $this->response('',204);
		}
        
        private function checkNotifications(){
			if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
                    
            $query = "SELECT id FROM message_notifications WHERE receiver_id = '$uid'";
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                $mess_notifications = $result->num_rows;              
            } else {
                $this->response('', 204); // server error 
            }
            
            $query = "SELECT id FROM like_notifications WHERE receiver_id = '$uid' and readed = '0'";
            $result = $this->mysqli->query($query);
            
            if ($result != NULL) {
                $like_notifications = $result->num_rows;              
            } else {
                $this->response('', 204); // server error 
            }
            
            $response = array('status' => "SUCCESS", "mess_notifications" => $mess_notifications, "like_notifications" => $like_notifications);
            $this->response($this->json($response),200);
        }
        
        private function getNotifications(){
            if($this->get_request_method() != "POST"){
				$this->response('',406);
			}
            
            $uid = json_decode(file_get_contents("php://input"));
            
            $query = "UPDATE like_notifications SET readed = '1' WHERE receiver_id = '$uid'";
            
            $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

            if($result != NULL) {
                $query = "SELECT * FROM like_notifications WHERE receiver_id = '$uid' ORDER BY date DESC";
                    
                $result = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);

                if ($result != NULL) {
                    if($result->num_rows > 0) { // EMAIL EXISTS
                        $resarray = array();
                        while($row = $result->fetch_assoc()){
                            $resarray[] = $row;
                        }

                        $response = array('status' => "SUCCESS", 'like_notifications' => $resarray); 
                        $this->response($this->json($response), 200); // send user details
                    } else {
                        $response = array('status' => "NOT_FOUND");
                        $this->response($this->json($response), 200);  // no post 
                    }
                } else {
                    $this->response('',204);	//"No Content" status 
                }
            } else {
                $this->response('',204); //"No Content" status
            } 
        }
        
		/*
		 *	Encode array into JSON
		*/
		private function json($data){
			if(is_array($data)){
				return json_encode($data);
			}
		}
	}
	
	// Initiiate Library
	
	$api = new API;
	$api->processApi();
?>