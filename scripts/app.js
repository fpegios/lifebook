'use strict';

angular.module('lifebook', ['ui.router', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngFileUpload', 'luegg.directives'])

    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        
    
        $stateProvider
            // route for the home page
            .state('login', {
                url: '/login',
                views: {
                    'header': {
                        templateUrl : 'views/header-intro.html'
                    },
                    'content': {
                        templateUrl : 'views/login.html',
                        controller  : 'LoginController'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
        
            .state('signup', {
                url: '/signup',
                views: {
                    'header': {
                        templateUrl : 'views/header-intro.html'
                    },
                    'content': {
                        templateUrl : 'views/signup.html',
                        controller  : 'SignupController'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
        
            .state('home', {
                url: '/home',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
            
            .state('profile', {
                url: '/profile/:id',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/profile.html'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
        
            .state('profile_2', {
                url: '/profile/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/profile.html'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
        
            .state('search_friends', {
                url: '/search_friends',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/search-friends.html',
                        controller : 'SearchFriendsController'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
        
            .state('messages', {
                url: '/messages',
                views: {
                    'header': {
                        templateUrl : 'views/header-fullwidth.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/messages.html',
                        controller  : 'MessagesController'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
        
            .state('notifications', {
                url: '/notifications',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/notifications.html',
                        controller  : 'NotificationsController'
                    },
                    'footer': {
                        templateUrl : 'views/blank.html'
                    }
                }

            })
    
    
        
        $urlRouterProvider.otherwise('/login');
    
    });