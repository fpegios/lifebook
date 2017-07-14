'use strict';

var app = angular.module('lifebook');


app.directive('preventDefault', function() {
    return function(scope, element, attrs) {
        angular.element(element).bind('click', function(event) {
            event.stopPropagation();
        });
    }
});

app.directive('reachedToBottom', function($window, $document){
    return{
        link: function(scope, element, attrs){
            element.on('scroll', function(){
                if(element[0].scrollTop + element.innerHeight() == element[0].scrollHeight){
                    scope.$eval(attrs.reachedToBottom);
                }
            })
        }
    }
});

app.run(function($location, $rootScope, services) {
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "profile") {
            if (services.getSession('lbuid') == null) {
                $location.path("/login");
                location.reload();
            }            
        } 
    });
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "search_friends") {
            if (services.getSession('lbuid') == null) {
                $location.path("/login");
                location.reload();
            }            
        } 
    });
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "home") {
            if (services.getSession('lbuid') == null) {
                $location.path("/login");
                location.reload();
            }            
        } 
    });
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "messages") {
            if (services.getSession('lbuid') == null) {
                $location.path("/login");
                location.reload();
            }            
        } 
    });
    
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "notifications") {
            if (services.getSession('lbuid') == null) {
                $location.path("/login");
                location.reload();
            }            
        } 
    });
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "login") {
            if (services.getSession('lbuid') != null) {
                $location.path("/home");
                location.reload();
            }            
        }
    });
    
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        if (toState.name == "signup") {
            if (services.getSession('lbuid') != null) {
                $location.path("/home");
                location.reload();
            }   
        }
    });
});