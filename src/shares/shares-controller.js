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
