'use strict';

var app = angular.module('lifebook');
    
app.factory('services', ['$http', function($http) {
    
    var serviceBase = 'services/'
    var obj = {};

    
    obj.validateSignup = function (data) {
        return $http.post(serviceBase + 'validateSignup', data).then(function (results) {
            return results;
        });
    };
    
    obj.signup = function(data){            
        return $http.post(serviceBase + 'signup', data).then(function (results) {
            return results;
        });
    };
    
    obj.login = function(data){            
        return $http.post(serviceBase + 'login', data).then(function (results) {
            return results;
        });
    };
    
    obj.setSession = function(key, value){            
        return localStorage.setItem(key,value);
    };
    
    obj.getSession = function(key){            
        return localStorage.getItem(key);
    };
    
    obj.destroySession = function(key){            
        return localStorage.removeItem(key);
    };
    
    obj.getPosts = function(data){            
        return $http.post(serviceBase + 'getPosts', data).then(function (results) {
            return results;
        });
    };
    
    obj.insertPost = function(data){            
        return $http.post(serviceBase + 'insertPost', data).then(function (results) {
            return results;
        });
    };
    
    obj.deletePost = function(data){            
        return $http.post(serviceBase + 'deletePost', data).then(function (results) {
            return results;
        });
    };
    
    obj.updatePost = function(data){            
        return $http.post(serviceBase + 'updatePost', data).then(function (results) {
            return results;
        });
    };
    
    obj.insertPostLike = function(data){            
        return $http.post(serviceBase + 'insertPostLike', data).then(function (results) {
            return results;
        });
    };
        
    obj.deletePostLike = function(data){            
        return $http.post(serviceBase + 'deletePostLike', data).then(function (results) {
            return results;
        });
    };  
    
    obj.getUser = function(data){            
        return $http.post(serviceBase + 'getUser', data).then(function (results) {
            return results;
        });
    };
    
    obj.updateInfo = function(data){            
        return $http.post(serviceBase + 'updateInfo', data).then(function (results) {
            return results;
        });
    };
    
    obj.getUsers = function(data){            
        return $http.post(serviceBase + 'getUsers', data).then(function (results) {
            return results;
        });
    };
    
    obj.getFollowers = function(data){            
        return $http.post(serviceBase + 'getFollowers', data).then(function (results) {
            return results;
        });
    };
    
    obj.followUser = function(data){            
        return $http.post(serviceBase + 'followUser', data).then(function (results) {
            return results;
        });
    };
    
    obj.unfollowUser = function(data){            
        return $http.post(serviceBase + 'unfollowUser', data).then(function (results) {
            return results;
        });
    };
    
    obj.getFollowersPosts = function(data){            
        return $http.post(serviceBase + 'getFollowersPosts', data).then(function (results) {
            return results;
        });
    };
    
    obj.getPostsLikes = function(data){            
        return $http.post(serviceBase + 'getPostsLikes', data).then(function (results) {
            return results;
        });
    };
    
    obj.checkFollower = function(data){            
        return $http.post(serviceBase + 'checkFollower', data).then(function (results) {
            return results;
        });
    };
    
    obj.getMessages = function(data){            
        return $http.post(serviceBase + 'getMessages', data).then(function (results) {
            return results;
        });
    };
    
    obj.getUsersMessages = function(data){            
        return $http.post(serviceBase + 'getUsersMessages', data).then(function (results) {
            return results;
        });
    };
    
    obj.sendMessage = function(data){            
        return $http.post(serviceBase + 'sendMessage', data).then(function (results) {
            return results;
        });
    };
    
    obj.getUsersLight = function(data){            
        return $http.post(serviceBase + 'getUsersLight', data).then(function (results) {
            return results;
        });
    };
    
    obj.checkNotifications = function(data){            
        return $http.post(serviceBase + 'checkNotifications', data).then(function (results) {
            return results;
        });
    };
    
    obj.getNotifications = function(data){            
        return $http.post(serviceBase + 'getNotifications', data).then(function (results) {
            return results;
        });
    };
    
    
    
    return obj;
}]);