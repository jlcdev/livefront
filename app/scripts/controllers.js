(function(){
    'use strict';

    function PostListController(Post)
    {
      this.posts = Post.query();
    }
    function PostDetailController($routeParams, Post, Comment, User)
    {
      this.post = {};
      this.comments = {};
      this.user = {};
      var self = this; //Save context
      Post.query({id: $routeParams.postId})
        .$promise.then(
          function(data)
          {
            self.post = data[0];
            self.user = User.query({id: self.user.userId});
          },
          function(error){
            console.log(error);
          });
      this.comments = Comment.query({postId: $routeParams.postId});
    }
    function PostCreateController(Post)
    {
      var self = this;
      this.create = function()
      {
        Post.save(self.post);
      };
    }

    angular
      .module('blog.controllers', ['blog.services'])
      .controller('PostListController', PostListController)
      .controller('PostCreateController', PostCreateController)
      .controller('PostDetailController', PostDetailController);
})();
