// The root module for our Angular application
var app = angular.module('app', ['ngRoute']);

app.controller('MainNavCtrl',
  ['$location', 'StringUtil', function($location, StringUtil) {
    var self = this;

    self.isActive = function (path) {
      // The default route is a special case.
      if (path === '/') {
        return $location.path() === '/';
      }

      return StringUtil.startsWith($location.path(), path);
    };
  }]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'shares/shares.html',
    controller: 'SharesCtrl',
    controllerAs: 'ctrl'
  };

  $routeProvider.when('/', routeDefinition);
  $routeProvider.when('/shares', routeDefinition);
}])
.controller('SharesCtrl', [
  //inject sharesApi so the controller has a factory to use
  'sharesApi',
  //inject our object into this function
function (sharesApi) {
  // loaded with ajax in shares-factory.js
  var self= this;
  //call the getList function for sharesApi factory
  // EX: ctrl has a shares array [1,2,3] on it.
  // EX: self.shares = [1,2,3];

  // shares.html needs access to the array of shares that
  //we get back from sharesApi.
  sharesApi.getList()
    .then(function(result){
    //the list of shares
    //we have to get some data from our server
    //we have an api call (sharesApi.getList())
    //we get some data from the api call
    //now we have to EXPOSE the data to our controller
    //the template can access the data by making putting the
    //result on self.shares.
    self.shares = result.data;
  })
  .catch(function(error){
    alert('No shares could be retrieved.');
  });

  self.deleteShare = function(share) {
    //get the id of the share (._id) and pass as parameter
    // When it comes to asynchronous actions (or promises),
    // make sure to handle both the success (then) and error (catch) case.
    sharesApi.deleteById(share._id);
    .then(function(result){
      location.reload();
    })
    .catch(function(error){
      console.log('Cannot delete share, tired of using alerts!')
    });
  }

}]);

app.factory('sharesApi', ['$http', function ($http) {

  return {
    getList: function() {
      return $http.get('/api/res');
    },
    getById: function(id) {
      return $http.get('/api/res/'+id);
      //pass an id in at :id
    },
    /*
    pass in the post object as parameter
    {
      url: 'http://google.com',
      description: 'A good search engine',
      tags: ['search-engines', 'google']
    }*/
    post: function(post) {
      // DOCS: https://docs.angularjs.org/api/ng/service/$http#post
      return $http.post('/api/res/', post);
    },
    deleteById: function(id) {
      return $http.delete('/api/res/'+id);
    },
  }

}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'users/user.html',
    controller: 'UserCtrl',
    controllerAs: 'vm',
    resolve: {
      user: ['$route', 'usersService', function ($route, usersService) {
        var routeParams = $route.current.params;
        return usersService.getByUserId(routeParams.userid);
      }]
    }
  };

  $routeProvider.when('/users/:userid', routeDefinition);
}])
.controller('UserCtrl', ['user', function (user) {
  this.user = user;
}]);

app.factory('User', function () {
  return function (spec) {
    spec = spec || {};
    return {
      userId: spec.userId || '',
      role: spec.role || 'user'
    };
  };
});

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'users/users.html',
    controller: 'UsersCtrl',
    controllerAs: 'vm',
    resolve: {
      users: ['usersService', function (usersService) {
        return usersService.list();
      }]
    }
  };

  $routeProvider.when('/users', routeDefinition);
}])
.controller('UsersCtrl', ['users', 'usersService', 'User', function (users, usersService, User) {
  var self = this;

  self.users = users;

  self.newUser = User();

  self.addUser = function () {
    // Make a copy of the 'newUser' object
    var user = User(self.newUser);

    // Add the user to our service
    usersService.addUser(user).then(function () {
      // If the add succeeded, remove the user from the users array
      self.users = self.users.filter(function (existingUser) {
        return existingUser.userId !== user.userId;
      });

      // Add the user to the users array
      self.users.push(user);
    });

    // Clear our newUser property
    self.newUser = User();
  };
}]);

app.config(['$routeProvider', function($routeProvider) {
  var routeDefinition = {
    templateUrl: 'new-share/new-share.html',
    controller: 'NewShareCtrl',
    controllerAs: 'ctrl'
  };
  $routeProvider.when('/new-share', routeDefinition);
}])


app.controller('NewShareCtrl', [
  'sharesApi',

function(sharesApi) {
  var self = this;
  //represent the post as an empty object {}
  // will be filled in with url, description, and tags
  // user will fill in with the ng-model
  self.post = {
    url: '',
    description: '',
    tags: [],
  };


  self.submitShare=function() {
    sharesApi.post(self.post)
    .then(function(result){
      //posts it to the list, go back to index
      window.history.back();
    })
    .catch(function(error){
      alert('Post unsuccessful.');
    })
  }

}]);

// A little string utility... no biggie
app.factory('StringUtil', function() {
  return {
    startsWith: function (str, subStr) {
      str = str || '';
      return str.slice(0, subStr.length) === subStr;
    }
  };
});

app.factory('usersService', ['$http', '$q', '$log', function($http, $q, $log) {
  // My $http promise then and catch always
  // does the same thing, so I'll put the
  // processing of it here. What you probably
  // want to do instead is create a convenience object
  // that makes $http calls for you in a standard
  // way, handling post, put, delete, etc
  function get(url) {
    return processAjaxPromise($http.get(url));
  }

  function processAjaxPromise(p) {
    return p.then(function (result) {
      return result.data;
    })
    .catch(function (error) {
      $log.log(error);
    });
  }

  return {
    list: function () {
      return get('/api/users');
    },

    getByUserId: function (userId) {
      if (!userId) {
        throw new Error('getByUserId requires a user id');
      }

      return get('/api/users/' + userId);
    },

    addUser: function (user) {
      return processAjaxPromise($http.post('/api/users', user));
    }
  };
}]);

//# sourceMappingURL=app.js.map