'use strict';

var app = angular.module('lifebook');

app.controller('HeaderController', function($scope, $location, $interval, $rootScope, $state, services) {
    
    $scope.uid = services.getSession('lbuid');
    $scope.firstname = services.getSession('lbFirstname');
    $scope.lastname = services.getSession('lbLastname');
    $scope.email = services.getSession('lbEmail');
    $scope.username = services.getSession('lbUsername');
    
    $scope.notification = {message:0, like:0};
    
    $scope.goProfile = function() {
        $location.path("/profile/" + $scope.uid);
    }
    $scope.logout = function() {
        services.destroySession('lbuid');
        services.destroySession('lbFirstname');
        services.destroySession('lbLastname');
        services.destroySession('lbEmail');
        services.destroySession('lbUsername');
        $location.path("/login");
    }
    
    $scope.checkNotifications = function() {
         services.checkNotifications($scope.uid)
                .then(function(response) { 
                    if (response.status == 200) { // OK
                        if ($state.current.name == "messages") {
                            $scope.notification = {message:0, like:response.data.like_notifications};
                        } else if ($state.current.name == "notifications") {
                            $scope.notification = {message:response.data.mess_notifications, like:0};
                        } else {
                            $scope.notification = {message:response.data.mess_notifications, like:response.data.like_notifications};
                        }
                    } else if (response.status == 204) { // SERVER ERROR
                        $scope.notication = {message:0, like:0};
                    }
            });
    }
    
    $scope.checkNotifications();
    
    $interval(function () {
        $scope.checkNotifications();
    }, 15000);
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "messages") { 
            $scope.notification.message = 0;
        }
        
        if (toState.name == "notifications") { 
            $scope.notification.like = 0;
        }
    });
    
});


app.controller('NotificationsController', function($scope, $location, services) {
    $scope.session = {uid:services.getSession('lbuid'), firstname:services.getSession('lbFirstname'), lastname:services.getSession('lbLastname'),       username:services.getSession('lbUsername')};
    
    var month = new Array();month[0] = "January";month[1] = "February";month[2] = "March";month[3] = "April";month[4] = "May";month[5] = "June";
                month[6] = "July";month[7] = "August";month[8] = "September";month[9] = "October";month[10] = "November";month[11] = "December";
    
    $scope.noNotifications = false;
    $scope.internalServerError = false;
    $scope.isLoading = true;
    
    services.getNotifications($scope.session.uid)
        .then(function(response) { 
            if (response.status == 200) { // OK
                if (response.data.status == "SUCCESS") {
                    $scope.notifications = response.data.like_notifications;
                    for (var i in $scope.notifications) {
                        $scope.notifications[i].dDate = new Date($scope.notifications[i].date).getDate();
                        $scope.notifications[i].dMonth = month[new Date($scope.notifications[i].date).getMonth()];
                        $scope.notifications[i].dYear = new Date($scope.notifications[i].date).getFullYear();
                        $scope.notifications[i].dHours = new Date($scope.notifications[i].date).getHours();
                        $scope.notifications[i].dMinutes = $scope.addZero(new Date($scope.notifications[i].date).getMinutes());
                    }
                } else if (response.data.status == "NOT_FOUND") {
                    $scope.noNotifications = true;
                }
            } else if (response.status == 204) { // SERVER ERROR
                $scope.noNotifications = false;
                $scope.internalServerError = true;
            }
            $scope.isLoading = false;
    });
    
    $scope.goProfile = function(uid) {
        $location.path("/profile/" + uid);
    }
    
    $scope.addZero = function(i) {
       if (i < 10) {
           i = "0" + i;
       }
        return i; 
    } 
});


app.controller('MessagesController', function($scope, $interval, $location, $rootScope, $uibModal, $log, $document, $state, services) {
    $scope.session = {uid:services.getSession('lbuid'), firstname:services.getSession('lbFirstname'), lastname:services.getSession('lbLastname'),       username:services.getSession('lbUsername')};
    
    var month = new Array();month[0] = "January";month[1] = "February";month[2] = "March";month[3] = "April";month[4] = "May";month[5] = "June";
                month[6] = "July";month[7] = "August";month[8] = "September";month[9] = "October";month[10] = "November";month[11] = "December";
    $scope.newMessage = {sender_id:$scope.session.uid, sender_name:$scope.session.firstname + " " + $scope.session.lastname, 
                         receiver_id:"", receiver_name:"", text:"", date:""};
    $scope.isLoading = true;
    $scope.internalServerError = false;
    $scope.noMessages = false;
    $scope.showMessageInputForm = false;
    $scope.selectedUser = {id:"", name:""};
    
        
    $scope.getUsersMessages = function() {
        services.getUsersMessages($scope.session.uid)
                .then(function(response) { 
                    if (response.status == 200) { // OK
                        if (response.data.status == "SUCCESS") {
                            $scope.users = response.data.users;
                            for (var i in $scope.users) {
                                $scope.users[i].dDate = new Date($scope.users[i].date).getDate();
                                $scope.users[i].dMonth = month[new Date($scope.users[i].date).getMonth()];
                                $scope.users[i].dYear = new Date($scope.users[i].date).getFullYear();
                                $scope.users[i].dHours = new Date($scope.users[i].date).getHours();
                                $scope.users[i].dMinutes = $scope.addZero(new Date($scope.users[i].date).getMinutes());
                            }
                            if ($scope.selectedUser.id == "") {
                                $scope.selectedUser.id = $scope.users[0].uid;
                                $scope.selectedUser.name = $scope.users[0].name; 
                            }
                            $scope.getMessages();
                        } else if (response.data.status == "NOT_FOUND") {
                            $scope.noMessages = true;
                            $scope.isLoading = false;
                        }
                    } else if (response.status == 204) { // SERVER ERROR
                        $scope.noMessages = false;
                        $scope.internalServerError = true;
                        $scope.isLoading = false;
                    }
            });
    }
    
    $scope.getUsersMessages();
    
    $scope.getMessages = function() {
        services.getMessages($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        $scope.messages = response.data.messages;
                        for (var i in $scope.messages) {
                            $scope.messages[i].dDate = new Date($scope.messages[i].date).getDate();
                            $scope.messages[i].dMonth = month[new Date($scope.messages[i].date).getMonth()];
                            $scope.messages[i].dYear = new Date($scope.messages[i].date).getFullYear();
                            $scope.messages[i].dHours = new Date($scope.messages[i].date).getHours();
                            $scope.messages[i].dMinutes = $scope.addZero(new Date($scope.messages[i].date).getMinutes());
                        }
                        $scope.showMessageInputForm = true;
                    } else if (response.data.status == "NOT_FOUND") {
                        $scope.noMessages = true;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.noMessages = false;
                    $scope.internalServerError = true;
                }
                $scope.isLoading = false;
            });
    }
    
    $scope.isActive = function(uid) {
        if ($scope.selectedUser.id == uid) {
            return true;
        } else {
            return false;
        }
    }
    
    $scope.setActive = function(uid, name) {
        $scope.selectedUser.id = uid;
        $scope.selectedUser.name = name;
    }    
    
    $scope.addZero = function(i) {
       if (i < 10) {
           i = "0" + i;
       }
        return i; 
    }    
    
    $scope.sendMessage = function() {   
        $scope.newMessage.receiver_id = $scope.selectedUser.id;
        $scope.newMessage.receiver_name = $scope.selectedUser.name;
        $scope.newMessage.date = new Date();
        $scope.messageData = $scope.newMessage;
        
        services.sendMessage($scope.messageData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    
                    $scope.newMessage.id = response.data.id;
                    $scope.newMessage.uid = $scope.selectedUser.id;
                    $scope.newMessage.dDate = new Date($scope.newMessage.date).getDate();
                    $scope.newMessage.dMonth = month[new Date($scope.newMessage.date).getMonth()];
                    $scope.newMessage.dYear = new Date($scope.newMessage.date).getFullYear();
                    $scope.newMessage.dHours = new Date($scope.newMessage.date).getHours();
                    $scope.newMessage.dMinutes = $scope.addZero(new Date($scope.newMessage.date).getMinutes());
                    $scope.messages.splice($scope.messages.length, 0, $scope.newMessage);
                    
                    $scope.user = {uid:"", name:"", dDate:"", dMonth:"", dYear:"", dHours:"", dMinutes:""};
                    $scope.user.uid = $scope.selectedUser.id;
                    $scope.user.name = $scope.selectedUser.name;
                    $scope.user.dDate = $scope.newMessage.dDate;
                    $scope.user.dMonth = $scope.newMessage.dMonth;
                    $scope.user.dYear = $scope.newMessage.dYear;
                    $scope.user.dHours = $scope.newMessage.dHours;
                    $scope.user.dMinutes = $scope.newMessage.dMinutes;
                    for (var i in $scope.users) { // check if dialog with this user exists from the past
                        if ($scope.users[i].uid == $scope.selectedUser.id) {
                            $scope.users.splice(i, 1);
                            break;
                        }
                    }
                    $scope.users.splice(0, 0, $scope.user);
                    
                    $scope.newMessage = {sender_id:$scope.session.uid, sender_name:$scope.session.firstname + " " + $scope.session.lastname, 
                                         receiver_id:"", receiver_name:"", text:"", date:""};
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }

    $scope.openNewMessageModal = function() { 
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'ModalNewMessage.html',
            component: 'modalComponent',
            backdrop: true,
            keyboard  : false,
            size: 'md',
            resolve: {
                items: function () {
                    return "1";
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {

        }, function () {

        });
    }
    
    $rootScope.$on("pushNewMessageInModalData", function(event, data){
        if ($scope.noMessages) {
            $scope.setActive(data.receiver_id, data.receiver_name);
            
            data.uid = $scope.selectedUser.id;
            data.dDate = new Date(data.date).getDate();
            data.dMonth = month[new Date(data.date).getMonth()];
            data.dYear = new Date(data.date).getFullYear();
            data.dHours = new Date(data.date).getHours();
            data.dMinutes = $scope.addZero(new Date(data.date).getMinutes());   
            $scope.messages = [];
            $scope.messages.push(data);
            
            $scope.user = {uid:"", name:"", dDate:"", dMonth:"", dYear:"", dHours:"", dMinutes:""};
            $scope.user.uid = data.receiver_id;
            $scope.user.name = data.receiver_name;
            $scope.user.dDate = new Date(data.date).getDate();
            $scope.user.dMonth = month[new Date(data.date).getMonth()];
            $scope.user.dYear = new Date(data.date).getFullYear();
            $scope.user.dHours = new Date(data.date).getHours();
            $scope.user.dMinutes = $scope.addZero(new Date(data.date).getMinutes()); 
            $scope.users = [];
            $scope.users.push($scope.user);
            
            $scope.noMessages = false;
            
            console.log($scope.users.length);
        } else {
            var userExists = false
            for (var i in $scope.users) { // check if dialog with this user exists from the past
                if ($scope.users[i].uid == data.receiver_id) {
                    userExists = true;
                    break;
                }
            }
            if (userExists) {
                $scope.setActive(data.receiver_id, data.receiver_name);
                data.uid = $scope.selectedUser.id;
                data.dDate = new Date(data.date).getDate();
                data.dMonth = month[new Date(data.date).getMonth()];
                data.dYear = new Date(data.date).getFullYear();
                data.dHours = new Date(data.date).getHours();
                data.dMinutes = $scope.addZero(new Date(data.date).getMinutes());   
                $scope.messages.splice($scope.messages.length, 0, data);
                
                $scope.user = {uid:"", name:"", dDate:"", dMonth:"", dYear:"", dHours:"", dMinutes:""};
                $scope.user.uid = data.receiver_id;
                $scope.user.name = data.receiver_name;
                $scope.user.dDate = new Date(data.date).getDate();
                $scope.user.dMonth = month[new Date(data.date).getMonth()];
                $scope.user.dYear = new Date(data.date).getFullYear();
                $scope.user.dHours = new Date(data.date).getHours();
                $scope.user.dMinutes = $scope.addZero(new Date(data.date).getMinutes());
                for (var i in $scope.users) { // check if dialog with this user exists from the past
                    if ($scope.users[i].uid == data.receiver_id) {
                        $scope.users.splice(i, 1);
                        break;
                    }
                }
                $scope.users.splice(0, 0, $scope.user);
            } else {
                $scope.setActive(data.receiver_id, data.receiver_name);
                data.uid = $scope.selectedUser.id;
                data.dDate = new Date(data.date).getDate();
                data.dMonth = month[new Date(data.date).getMonth()];
                data.dYear = new Date(data.date).getFullYear();
                data.dHours = new Date(data.date).getHours();
                data.dMinutes = $scope.addZero(new Date(data.date).getMinutes());   
                $scope.messages.splice($scope.messages.length, 0, data);
                
                $scope.user = {uid:"", name:"", dDate:"", dMonth:"", dYear:"", dHours:"", dMinutes:""};
                $scope.user.uid = data.receiver_id;
                $scope.user.name = data.receiver_name;
                $scope.user.dDate = new Date(data.date).getDate();
                $scope.user.dMonth = month[new Date(data.date).getMonth()];
                $scope.user.dYear = new Date(data.date).getFullYear();
                $scope.user.dHours = new Date(data.date).getHours();
                $scope.user.dMinutes = $scope.addZero(new Date(data.date).getMinutes());
                $scope.users.splice(0, 0, $scope.user);
            }
        }
        
        
        $scope.showMessageInputForm = true;
    });
    
    $scope.showMobileMessageDialog = false; 
    
    $scope.toggleMobileMessageDialog = function() {
        $scope.showMobileMessageDialog = !$scope.showMobileMessageDialog;
    }
    
    $scope.showMobileNewMessage = false;
    
    $scope.toggleMobileNewMessage = function(open) {
        $scope.showMobileNewMessage = !$scope.showMobileNewMessage;
        $scope.showMobileMessageDialog = !$scope.showMobileMessageDialog;
        if (open) {
            $scope.getFollowers();
        }
    }
    
    $scope.receivers = [];
    $scope.noFollowers = false;

    // GET FOLLOWERS FOR NEW MESSAGE
    $scope.getFollowers = function() {
        services.getFollowers($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        $scope.followers = response.data.followers;
                        $scope.getUsersLight();
                    } else if (response.data.status == "NOT_FOUND") {
                        $scope.followers = null;
                        $scope.noFollowers = true;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }

        });  
    }
    
    $scope.getUsersLight = function() {
        services.getUsersLight($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        $scope.allUsers = response.data.users; 
                        $scope.detectFriends();
                    } else if (response.data.status == "NOT_FOUND") {
                        $scope.noUsers = true;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
        
    $scope.detectFriends = function() {
        $scope.receivers = [];
        if ($scope.followers != null) {
            $scope.noFollowers = false;
            for (var i = 0; i < $scope.allUsers.length; i++) { 
                for (var j = 0; j < $scope.followers.length; j++) { 
                    if ($scope.allUsers[i].id == $scope.followers[j].is_following) {
                        $scope.receivers.push($scope.allUsers[i]);
                    }
                } 
            }
        } else {
            $scope.noFollowers = true;
        }
    }
        
    $scope.newMessageInModal = {sender_id:$scope.session.uid, sender_name:$scope.session.firstname + " " + $scope.session.lastname, 
                                receiver_id:"", receiver_name:"", text:"", date:""};
            
    
    $scope.sendMobileMessage = function () {
        for (var i = 0; i < $scope.receivers.length; i++) { 
            if ($scope.newMessageInModal.receiver_id == $scope.receivers[i].id) {
                $scope.newMessageInModal.receiver_name = $scope.receivers[i].firstname + " " + $scope.receivers[i].lastname;
                break;
            }
        }
        $scope.newMessageInModal.date = new Date();
        $scope.newMessageInModalData = $scope.newMessageInModal;  
        services.sendMessage($scope.newMessageInModalData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    $scope.newMessageInModal = {sender_id:$scope.session.uid, sender_name:$scope.session.firstname + " " + $scope.session.lastname, 
                                         receiver_id:"", receiver_name:"", text:"", date:""};
                    $scope.newMessageInModalData.id = response.data.id;
                    $scope.toggleMobileNewMessage();
                    $rootScope.$emit("pushNewMessageInModalData", $scope.newMessageInModalData);
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                    $scope.toggleMobileNewMessage();
                }
            }); 


    };
    
    $scope.goProfile = function(uid) {
        $location.path("/profile/" + uid);
    }
    
    $interval(function () {
        if ($state.current.name == "messages") {
            $scope.getUsersMessages();
        }
    }, 15000);
});


app.component('modalComponent', {
    templateUrl: 'ModalNewMessage.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function ($scope, $rootScope, services) {
        var $ctrl = this;

        $scope.session = {uid:services.getSession('lbuid'), firstname:services.getSession('lbFirstname'), lastname:services.getSession('lbLastname'),       username:services.getSession('lbUsername')};
        $scope.receivers = [];
        $scope.noFollowers = false;
        
        // GET FOLLOWERS FOR NEW MESSAGE
        services.getFollowers($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        $scope.followers = response.data.followers;
                        $scope.getUsersLight();
                    } else if (response.data.status == "NOT_FOUND") {
                        $scope.followers = null;
                        $scope.noFollowers = true;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }

        });  
        
        $scope.getUsersLight = function() {
            services.getUsersLight($scope.session.uid)
                .then(function(response) { 
                    if (response.status == 200) { // OK
                        if (response.data.status == "SUCCESS") {
                            $scope.allUsers = response.data.users; 
                            $scope.detectFriends();
                        } else if (response.data.status == "NOT_FOUND") {
                            $scope.noUsers = true;
                        }
                    } else if (response.status == 204) { // SERVER ERROR
                        $scope.internalServerError = true;
                    }
                }); 
        }
        
        $scope.detectFriends = function() {
            if ($scope.followers != null) {
                $scope.noFollowers = false;
                for (var i = 0; i < $scope.allUsers.length; i++) { 
                    for (var j = 0; j < $scope.followers.length; j++) { 
                        if ($scope.allUsers[i].id == $scope.followers[j].is_following) {
                            $scope.receivers.push($scope.allUsers[i]);
                        }
                    } 
                }
            } else {
                $scope.noFollowers = true;
            }
        }
        
        $scope.newMessageInModal = {sender_id:$scope.session.uid, sender_name:$scope.session.firstname + " " + $scope.session.lastname, 
                                receiver_id:"", receiver_name:"", text:"", date:""};    

        $ctrl.sendMessage = function () {
            for (var i = 0; i < $scope.receivers.length; i++) { 
                if ($scope.newMessageInModal.receiver_id == $scope.receivers[i].id) {
                    $scope.newMessageInModal.receiver_name = $scope.receivers[i].firstname + " " + $scope.receivers[i].lastname;
                    break;
                }
            }
            $scope.newMessageInModal.date = new Date();
            $scope.newMessageInModalData = $scope.newMessageInModal;  
            services.sendMessage($scope.newMessageInModalData)
                .then(function(response) { 
                    if (response.status == 200) { // OK
                        $scope.newMessageInModal = {sender_id:$scope.session.uid, sender_name:$scope.session.firstname + " " + $scope.session.lastname, 
                                             receiver_id:"", receiver_name:"", text:"", date:""};
                        $scope.newMessageInModalData.id = response.data.id;
                        $ctrl.close();
                        $rootScope.$emit("pushNewMessageInModalData", $scope.newMessageInModalData);
                    } else if (response.status == 204) { // SERVER ERROR
                        $scope.internalServerError = true;
                        $ctrl.close();
                    }
                }); 


        };
        
        $ctrl.cancel = function () {
            $ctrl.dismiss();
        };
    }
});


app.controller('HomeController', function($scope, $location, services) {
    $scope.session = {uid:services.getSession('lbuid'), firstname:services.getSession('lbFirstname'), lastname:services.getSession('lbLastname'),       username:services.getSession('lbUsername')};
    
    $scope.internalServerError = false;
    $scope.noPosts = false; 
    $scope.newPost = {id:"", uid:$scope.session.uid, ufullname:"", date:"", text:"", likes:0};
    $scope.isLoading = true;
    var month = new Array(); 
    month[0] = "January";month[1] = "February";month[2] = "March";month[3] = "April";month[4] = "May";month[5] = "June";
    month[6] = "July";month[7] = "August";month[8] = "September";month[9] = "October";month[10] = "November";month[11] = "December";
    
    services.getFollowersPosts($scope.session.uid)
        .then(function(response) { 
            if (response.status == 200) { // OK
                if (response.data.status == "SUCCESS") {
                    $scope.posts = response.data.posts;
                    for (var i in $scope.posts) {
                        $scope.posts[i].dDate = new Date($scope.posts[i].date).getDate();
                        $scope.posts[i].dMonth = month[new Date($scope.posts[i].date).getMonth()];
                        $scope.posts[i].dYear = new Date($scope.posts[i].date).getFullYear();
                        $scope.posts[i].dHours = new Date($scope.posts[i].date).getHours();
                        $scope.posts[i].dMinutes = $scope.addZero(new Date($scope.posts[i].date).getMinutes());
                    }
                    
                    $scope.getPostsLikes();
                } else if (response.data.status == "NOT_FOUND") {
                    $scope.noPosts = true;
                    $scope.isLoading = false;
                }
            } else if (response.status == 204) { // SERVER ERROR
                $scope.internalServerError = true;
            }
            
    }); 
    
    $scope.addZero = function(i) {
       if (i < 10) {
           i = "0" + i;
       }
        return i; 
    } 
    
    $scope.getPostsLikes = function() {
        services.getPostsLikes($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        for (var i in $scope.posts) {
                            $scope.posts[i].isUserLiked = false;
                            for (var j in response.data.post_likes) {
                                if ($scope.posts[i].id == response.data.post_likes[j].pid) {
                                    $scope.posts[i].isUserLiked = true;
                                }
                            }
                        }
                    } else if (response.data.status == "NOT_FOUND") {
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
                $scope.isLoading = false;
            });
    }
    
    $scope.insertPostLike = function(post) {
        var likes = parseInt(post.likes) + 1;
        $scope.postLike = {pid:post.id, uid:$scope.session.uid, likes:likes, sender_id: $scope.session.uid, sender_name: $scope.session.firstname + " " + $scope.session.lastname, post_text:post.text, receiver_id:post.uid};
        
        services.insertPostLike($scope.postLike)
            .then(function(response) { 
                if (response.status == 200) { // OK
                     post.likes = parseInt(post.likes) + 1;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
        
    }
    
    $scope.deletePostLike = function(post) {
        var likes = parseInt(post.likes) - 1;
        $scope.postLike = {pid:post.id, uid:$scope.session.uid, likes:likes};
        
        services.deletePostLike($scope.postLike)
            .then(function(response) { 
                if (response.status == 200) { // OK
                     post.likes = parseInt(post.likes) - 1;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
    }
    
    $scope.insertPost = function() {
        $scope.newPost.date = new Date();
        $scope.newPost.ufullname = $scope.session.firstname + " " + $scope.session.lastname;
        services.insertPost($scope.newPost)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    $scope.newPost.id = response.data.id;
                    if ($scope.noPosts) {
                        $scope.posts = [];
                        $scope.posts[0] = $scope.newPost;
                        $scope.noPosts = false;
                    } else {
                        $scope.newPost.dDate = new Date($scope.newPost.date).getDate();
                        $scope.newPost.dMonth = month[new Date($scope.newPost.date).getMonth()];
                        $scope.newPost.dYear = new Date($scope.newPost.date).getFullYear();
                        $scope.newPost.dHours = new Date($scope.newPost.date).getHours();
                        $scope.newPost.dMinutes = $scope.addZero(new Date($scope.newPost.date).getMinutes());
                        $scope.posts.splice(0, 0, $scope.newPost);
                    }
//                    $scope.newpostForm.$setPristine();
                    $scope.newPost = {id:"", uid:$scope.session.uid, ufullname:"", date:"", text:"", updatePost:false, likes:0};
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    $scope.goProfile = function(uid) {
        $location.path("/profile/" + uid);
    }
    
});

app.controller('ProfileController', function($scope, $location, $stateParams, services, Upload, $timeout) {
    
    $scope.session = {uid:services.getSession('lbuid'), firstname:services.getSession('lbFirstname'), lastname:services.getSession('lbLastname'),       username:services.getSession('lbUsername')};
    $scope.isLoading = true;
    var month = new Array();month[0] = "January";month[1] = "February";month[2] = "March";month[3] = "April";month[4] = "May";month[5] = "June";
                month[6] = "July";month[7] = "August";month[8] = "September";month[9] = "October";month[10] = "November";month[11] = "December";
    
    $scope.profileId = $stateParams.id;        

    if ($scope.profileId == $scope.session.uid) {
        $scope.userProfile = true;
    } else if ($scope.profileId == "") {
        $scope.profileId = $scope.session.uid;
        $scope.userProfile = true;
    } else {
        $scope.userProfile = false;
    }
    
    if (!$scope.userProfile) {
        $scope.checkFollowerData = {follower:$scope.session.uid, is_following:$scope.profileId};
        services.checkFollower($scope.checkFollowerData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        $scope.isFollowed = true;
                    } else if (response.data.status == "NOT_FOUND") {
                        $scope.isFollowed = false;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.isFollowed = false;
                    $scope.internalServerError = true;
                }
        });
    }
        
    $scope.newPost = {id:"", uid:$scope.session.uid, ufullname:"", date:"", text:"", updatePost:false, likes:0};
    $scope.noPosts = false;
    $scope.user = [];
    $scope.update = {info:false};
    $scope.newInfo = {job:"", studies:"", live_location:"", birth_location:""};
    $scope.prevInfo = {job:"", studies:"", live_location:"", birth_location:""};
    $scope.internalServerError = false;
    
    services.getUser($scope.profileId)
        .then(function(response) {
            if (response.status == 200) { // OK
                if (response.data.status == "SUCCESS") {
                    $scope.user = {
                        uid:response.data.users["0"].id, 
                        firstname:response.data.users["0"].firstname, 
                        lastname:response.data.users["0"].lastname, 
                        username:response.data.users["0"].username, 
                        email:response.data.users["0"].email, 
                        gender:response.data.users["0"].gender, 
                        birthdate: response.data.users["0"].birthdate, 
                        job:response.data.users["0"].job,
                        studies:response.data.users["0"].studies,
                        live_location:response.data.users["0"].live_location,
                        birth_location:response.data.users["0"].birth_location,
                        profile_img:response.data.users["0"].profile_img,
                        cover_img:response.data.users["0"].cover_img
                    };
                }  else if (response.data.status == "NOT_FOUND") {
                   $location.path("/profile/" + $scope.session.uid); // go to user's profile 
                }
                
            } else if (response.status == 204) { // SERVER ERROR
                $scope.internalServerError = true;
            }
            $scope.isLoading = false;
        }); 
    
    $scope.followUser = function(uid) {
        var followData = {follower: $scope.session.uid, is_following:uid};
        services.followUser(followData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    $scope.isFollowed = !$scope.isFollowed;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    $scope.unfollowUser = function(uid) {
        var unfollowData = {follower: $scope.session.uid, is_following:uid};
        services.unfollowUser(unfollowData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    $scope.isFollowed = !$scope.isFollowed;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    services.getPosts($scope.profileId)
        .then(function(response) { 
            if (response.status == 200) { // OK
                if (response.data.status == "SUCCESS") {
                    $scope.posts = response.data.posts; 
                    $scope.noPosts = false;
                    for (var i in $scope.posts) {
                        $scope.posts[i].dDate = new Date($scope.posts[i].date).getDate();
                        $scope.posts[i].dMonth = month[new Date($scope.posts[i].date).getMonth()];
                        $scope.posts[i].dYear = new Date($scope.posts[i].date).getFullYear();
                        $scope.posts[i].dHours = new Date($scope.posts[i].date).getHours();
                        $scope.posts[i].dMinutes = $scope.addZero(new Date($scope.posts[i].date).getMinutes());
                    }
                    $scope.getPostsLikes();
                } else if (response.data.status == "NOT_FOUND") {
                    $scope.noPosts = true;
                }
            } else if (response.status == 204) { // SERVER ERROR
                $scope.internalServerError = true;
            }
            
        });
           
    $scope.addZero = function(i) {
       if (i < 10) {
           i = "0" + i;
       }
        return i; 
    } 
    
    
    $scope.getPostsLikes = function() {
        services.getPostsLikes($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        for (var i in $scope.posts) {                     
                            $scope.posts[i].isUserLiked = false;
                            for (var j in response.data.post_likes) {
                                if ($scope.posts[i].id == response.data.post_likes[j].pid) {
                                    $scope.posts[i].isUserLiked = true;
                                }
                            }
                        }
                    } else if (response.data.status == "NOT_FOUND") {
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
    }
    
    $scope.insertPost = function() {
        $scope.newPost.date = new Date();
        $scope.newPost.ufullname = $scope.user.firstname + " " + $scope.user.lastname;
        services.insertPost($scope.newPost)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    $scope.newPost.id = response.data.id;
                    if ($scope.noPosts) {
                        $scope.posts = [];
                        $scope.posts[0] = $scope.newPost;
                        $scope.noPosts = false;
                    } else {
                        $scope.newPost.dDate = new Date($scope.newPost.date).getDate();
                        $scope.newPost.dMonth = month[new Date($scope.newPost.date).getMonth()];
                        $scope.newPost.dYear = new Date($scope.newPost.date).getFullYear();
                        $scope.newPost.dHours = new Date($scope.newPost.date).getHours();
                        $scope.newPost.dMinutes = $scope.addZero(new Date($scope.newPost.date).getMinutes());
                        $scope.posts.splice(0, 0, $scope.newPost);
                    }
//                    $scope.newpostForm.$setPristine();
                    $scope.newPost = {id:"", uid:$scope.session.uid, ufullname:"", date:"", text:"", updatePost:false, likes:0};
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    $scope.deletePost = function(id) {    
        services.deletePost(id)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    for(var i in $scope.posts){
                        if($scope.posts[i].id == id){
                            $scope.posts.splice(i,1);
                            break;
                        }
                    }  
                    
                    if ($scope.posts.length == 0) {
                        $scope.noPosts = true;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
    }
    
    $scope.prevText = "";
    $scope.updatePost = function(post) {    
        services.updatePost(post)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    post.updatePost = !post.updatePost;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
    }
    

    
    $scope.insertPostLike = function(post) {
        var likes = parseInt(post.likes) + 1;
        $scope.postLike = {pid:post.id, uid:$scope.session.uid, likes:likes, sender_id: $scope.session.uid, sender_name: post.ufullname, post_text:post.text, receiver_id:post.uid};
        
        services.insertPostLike($scope.postLike)
            .then(function(response) { 
                if (response.status == 200) { // OK
                     post.likes = parseInt(post.likes) + 1;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
        
    }
    
    $scope.deletePostLike = function(post) {
        var likes = parseInt(post.likes) - 1;
        $scope.postLike = {pid:post.id, uid:$scope.session.uid, likes:likes};
        
        services.deletePostLike($scope.postLike)
            .then(function(response) { 
                if (response.status == 200) { // OK
                     post.likes = parseInt(post.likes) - 1;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            });
    }
    
       
    $scope.updateInfo = function(user) { 
        
        services.updateInfo(user)
            .then(function(response) { 
                if (response.status == 200) { // OK
                     $scope.update.info = !$scope.update.info;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
                
            });
    }  
    
    $scope.goProfile = function(uid) {
        $location.path("/profile/" + uid);
    }
    
    $scope.uploadImgProfile = function(file, errFiles) {
        $scope.f = file;
                
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: 'upload-services/upload-img-profile.php',
                data: {file: file, uid: $scope.user.uid}
            });

            file.upload.then(function (response) {
                
                $timeout(function () {
                    file.result = response.data;
                });
                
                location.reload();
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
                    console.log($scope.errorMsg);
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 *
                evt.loaded / evt.total));
//                console.log(file.progress);
            });
            
            
        }
    }
    
    
    
    $scope.uploadImgCover = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: 'upload-services/upload-img-cover.php',
                data: {file: file, uid: $scope.user.uid}
            });

            file.upload.then(function (response) {
                
                $timeout(function () {
                    file.result = response.data;
                });
                
                location.reload();
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
                    console.log($scope.errorMsg);
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 *
                evt.loaded / evt.total));
            });
            
            
        }
    }
    
});

app.controller('LoginController', function($scope, $location, services) {

    $scope.loginData = {email:"", password:""};
    $scope.wrongInputs = false;
    $scope.internalServerError = false;
    $scope.isLoading = false;
    
    $scope.login = function() {
        $scope.isLoading = true;
        services.login($scope.loginData)
            .then(function(response) {
                if (response.status == 200) { // OK
                    if (response.data. status == "SUCCESS") {
                       $scope.wrongInputs = false; // hide "wrong inputs" msg
                        $scope.internalServerError = false; // hide "server error" msg
                        services.setSession('lbuid', response.data.user["0"].id); // set session
                        services.setSession('lbFirstname', response.data.user["0"].firstname); // set session
                        services.setSession('lbLastname', response.data.user["0"].lastname); // set session
                        services.setSession('lbEmail', response.data.user["0"].email); // set session
                        services.setSession('lbUsername', response.data.user["0"].username); // set session
                        $location.path("/home"); // go to homepage 
                    } else if (response.data. status == "NOT_FOUND") { // NOT FOUND
                        $scope.wrongInputs = true; // show "wrong inputs" msg
                        $scope.internalServerError = false;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                    $scope.wrongInputs = false;
                }
                $scope.isLoading = false;
            });
    }

});

app.controller('SignupController', function($scope, $location, $rootScope, services) {
    
    $scope.signupData = {firstname:"", lastname:"", username:"", email:"", 
                           password:"", gender:"male", birthdate:""};
    
    $scope.confirmPassword = "";
    
    $scope.emailExists = false;
    $scope.usernameExists = false;
    $scope.internalServerError = false;
    $scope.isLoading = false;
    
    $scope.passwordsMatch = function() {
        return angular.equals($scope.signupData.password, $scope.confirmPassword);
    }
        
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    today = yyyy+'-'+mm+'-'+dd;
    
    $scope.maxDate = today;
        
    
    $scope.validateSignup = function() {
        $scope.isLoading = true;
        services.validateSignup($scope.signupData)
            .then(function(response) { 
                
                if (response.status == 200) { // OK
                    $scope.internalServerError = false; // hide "server error" msg
                    
                    if (response.data.usernameAvailable && response.data.emailAvailable) {
                        $scope.emailExists = false;
                        $scope.usernameExists = false;
                        $scope.signup();    
                    } else if(response.data.usernameAvailable && !response.data.emailAvailable) {
                        $scope.usernameExists = false;
                        $scope.emailExists = true;
                        $scope.isLoading = false;
                    } else if(!response.data.usernameAvailable && response.data.emailAvailable) {
                        $scope.usernameExists = true;
                        $scope.emailExists = false;
                        $scope.isLoading = false;
                    } else {
                        $scope.usernameExists = true;
                        $scope.emailExists = false;
                        $scope.isLoading = false;
                    }               
                } else if (response.status == 204){ // SERVER ERROR
                    $scope.internalServerError = true; // show "server error" msg
                    $scope.isLoading = false;
                }
            });
    }
    
    $scope.signup = function() {
        services.signup($scope.signupData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    $scope.internalServerError = false; // hide "server error" msg
                    $rootScope.$emit("openSignupModal", {});
                } else if (response.status == 204){ // SERVER ERROR
                    $scope.internalServerError = true; // show "server error" msg
                }
                $scope.isLoading = false;
            });
    }
    
});

app.controller('ModalSignupController', function ($uibModal, $log, $document, $rootScope, $location) {
    var $ctrl = this;

    $ctrl.animationsEnabled = true;
    
    $rootScope.$on("openSignupModal", function(){
       $ctrl.open();
    });

    $ctrl.open = function (size, parentSelector) {
        var parentElem = parentSelector ? 
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'ModalSignup.html',
            controller: 'ModalSignup2Controller',
            controllerAs: '$ctrl',
            backdrop: 'static',
            keyboard  : false,
            size: 'sm',
            appendTo: parentElem,
            resolve: {
                items: function () {
                  return "1";
                }
            }
        });

        modalInstance.result.then(function () {
            $location.path("/login");
        });
    };
});

app.controller('ModalSignup2Controller', function ($uibModalInstance, items) {
    var $ctrl = this;

    $ctrl.goLogin = function () {
        $uibModalInstance.close();
    };

});



app.controller('SearchFriendsController', function($scope, $location, services) {
    $scope.session = {uid:services.getSession('lbuid')};
    $scope.internalServerError = false;
    $scope.followers = null;
    $scope.noUsers = false;
    $scope.isLoading = true;
    
    services.getFollowers($scope.session.uid)
        .then(function(response) { 
            if (response.status == 200) { // OK
                if (response.data.status == "SUCCESS") {
                    $scope.followers = response.data.followers;
                    $scope.getUsers();
                } else if (response.data.status == "NOT_FOUND") {
                    $scope.followers = null;
                    $scope.getUsers();
                }
            } else if (response.status == 204) { // SERVER ERROR
                $scope.internalServerError = true;
            }
            
    });  
    
    $scope.getUsers = function() {
        services.getUsers($scope.session.uid)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    if (response.data.status == "SUCCESS") {
                        $scope.users = response.data.users; 
                        $scope.detectFriends();
                    } else if (response.data.status == "NOT_FOUND") {
                        $scope.noUsers = true;
                        $scope.isLoading = false;
                    }
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    $scope.detectFriends = function() {
        for (var i = 0; i < $scope.users.length; i++) { 
            $scope.users[i].isFriend = false;
            if ($scope.followers != null) {
                for (var j = 0; j < $scope.followers.length; j++) { 
                    if ($scope.users[i].id == $scope.followers[j].is_following) {
                        $scope.users[i].isFriend = true;
                    }
                } 
            } else {
                $scope.users[i].isFriend = false;  
            }
            
        }
        $scope.isLoading = false;
    }
    
    $scope.followUser = function(user) {
        var followData = {follower: services.getSession('lbuid'), is_following:user.id};
        services.followUser(followData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    user.isFriend = !user.isFriend;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    $scope.unfollowUser = function(user) {
        var unfollowData = {follower: services.getSession('lbuid'), is_following:user.id};
        services.unfollowUser(unfollowData)
            .then(function(response) { 
                if (response.status == 200) { // OK
                    user.isFriend = !user.isFriend;
                } else if (response.status == 204) { // SERVER ERROR
                    $scope.internalServerError = true;
                }
            }); 
    }
    
    $scope.goProfile = function(uid) {
        $location.path("/profile/" + uid);
    }
    
     
});

//............................. Modals

