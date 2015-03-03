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
