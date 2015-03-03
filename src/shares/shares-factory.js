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
