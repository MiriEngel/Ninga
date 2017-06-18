(function () {
  'use strict';
angular.module('users').service('facebook', function($window, $q, $rootScope) {
  
  this.api = function(path, method, params) {
    var deferred = $q.defer();
    $window.FB.api(path, method, params, function(result) {
      $rootScope.$apply(function() {
        if (angular.isUndefined(result.error)) {
          deferred.resolve(result);
        } else {
          deferred.reject(result.error);
        }
      });
    });
    return deferred.promise;
  };
  
  this.FB = $window.FB;
});


angular.module('users')

// .config( function( $facebookProvider ) {
  // $facebookProvider.setAppId('1837465166490712');
// })

.run( function( $rootScope ) {
	
	     window.fbAsyncInit = function() {
        // init the FB JS SDK
        FB.init({
          appId      : '1837465166490712',                        // App ID from the app dashboard
		   version:  'v2.9',
          //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
          status     : true,                                 // Check Facebook Login status
          //xfbml      : true                                  // Look for social plugins on the page
        });
        // Additional initialization code such as adding Event Listeners goes here
      };
	
  // Load the facebook SDK asynchronously
  (function(){
     // If we've already installed the SDK, we're done
     if (document.getElementById('facebook-jssdk')) {return;}

     // Get the first script element, which we'll use to find the parent node
     var firstScriptElement = document.getElementsByTagName('script')[0];

     // Create a new script element and set its id
     var facebookJS = document.createElement('script'); 
     facebookJS.id = 'facebook-jssdk';

     // Set the new script's source to the source of the Facebook JS SDK
     facebookJS.src = "//connect.facebook.net/en_US/sdk.js";

     // Insert the Facebook JS SDK into the DOM
     firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
   }());
})



  
  
  
  
  angular
    .module('users')
    .controller('SocialAccountsController', SocialAccountsController);

  SocialAccountsController.$inject = ['$scope','$state', '$window', 'UsersService', 'Authentication', 'Notification','facebook','$http'];

  function SocialAccountsController($scope,$state, $window, UsersService, Authentication, Notification,facebook,$http
  ) {
    var vm = this;

    vm.user = Authentication.user;
    vm.hasConnectedAdditionalSocialAccounts = hasConnectedAdditionalSocialAccounts;
    vm.isConnectedSocialAccount = isConnectedSocialAccount;
    vm.removeUserSocialAccount = removeUserSocialAccount;
    vm.callOauthProvider = callOauthProvider;
	
	 $http.get('/api/users/me')
    .then(function(response) {
        $scope.userPMe = response.data;
    });
	
	

    // Check if there are additional accounts
    function hasConnectedAdditionalSocialAccounts() {
      return (vm.user.additionalProvidersData && Object.keys(vm.user.additionalProvidersData).length);
    }

    // Check if provider is already in use with current user
    function isConnectedSocialAccount(provider) {
      return vm.user.provider === provider || (vm.user.additionalProvidersData && vm.user.additionalProvidersData[provider]);
    }

    // Remove a user social account
    function removeUserSocialAccount(provider) {

      UsersService.removeSocialAccount(provider)
        .then(onRemoveSocialAccountSuccess)
        .catch(onRemoveSocialAccountError);
    }

    function onRemoveSocialAccountSuccess(response) {
      // If successful show success message and clear form
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Removed successfully!' });
      vm.user = Authentication.user = response;
    }

    function onRemoveSocialAccountError(response) {
      Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Remove failed!' });
    }

    // OAuth provider request
    function callOauthProvider(url) {
		facebook.FB.logout();
		// facebook.FB.Auth.setAuthResponse(null, 'unknown');
      url += '?redirect_to=' + encodeURIComponent($state.$current.url.prefix);

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
	  $scope.login = function() {
		 facebook.FB.login().then(function() {
   refresh();
    });
	
		  
		    // $scope.login = function() {
    // facebook.FB.login();
  // };
  
  // $scope.logout = function() {
    // facebook.FB.logout();
    // $scope.authenticated = false;
  // };
		  
		 // facebook.FB.login(
    // function(response) {
      // alert('FB.login with permissions callback', response);
    // }//,
    // // { scope: 'offline_access', auth_type: 'reauthenticate' }
  // );
		  // refresh();
		  
    // $facebook.login().then(function() {
   // refresh();
    // });
	
		// $facebook.login(function(response) {
 // alert('dddddddddd')
 // refresh();
// }, { auth_type: 'reauthenticate' })
	
	
	
	// $facebook.login(function(response) {
    // if (response.authResponse) {
     // console.log('Welcome!  Fetching your information.... ');
     // $facebook.api('/me', function(response) {
       // console.log('Good to see you, ' + response.name + '.');
     // });
    // } else {
     // console.log('User cancelled login or did not fully authorize.');
    // }
// });
	
  }
    function refresh() {
    $facebook.api("/me").then( 
      function(response) {
        $scope.welcomeMsg = "Welcome " + response.name;
        $scope.isLoggedIn = true;
      },
      function(err) {
        $scope.welcomeMsg = "Please log in";
      });
  }
  }
}());
