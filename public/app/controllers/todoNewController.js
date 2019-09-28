(function () { "use strict";

	angular.module('app').controller('TodoNewCtrl', TodoNewCtrl);

	TodoNewCtrl.$inject = ['$scope', '$routeParams', '$location', 'todoFactory'];

	function TodoNewCtrl($scope, $routeParams, $location, todoFactory) {
		var self = this;
		$scope.$root.setTitle('New', null, false);
		self.item = {
			date: new Date(),
			idCategory: 0
		};
		
		self.cancel = function () {
			$location.url('/');
		};
    self.save = function() {
      var date = self.item.date;	//converto le date i UTC
      date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      todoFactory.insert({
        date: date,
        title: self.item.title,
        note: self.item.note,
        idCategory: self.item.idCategory
      }).then(function(result) {
        if (result.success)
          $location.url('/');
      });
    };

    self.categories = null;
    todoFactory.categories().then(function(result) {
      if (result.success)
        self.categories = result.data;
      else
        self.categories = null;
    });
		/* date */
		self.dtOpened={};
		self.dtOpen = function ($event, name) {
			$event.preventDefault();
			$event.stopPropagation();
			if(typeof self.dtOpened[name] === 'undefined')
				self.dtOpened[name] = true;
			else
				self.dtOpened[name] = !self.dtOpened[name];
		};		
	}

})();