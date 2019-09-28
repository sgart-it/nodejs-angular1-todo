(function () { "use strict";

	angular.module('app').controller('TodoEditCtrl', TodoEditCtrl);

	TodoEditCtrl.$inject = ['$scope', '$routeParams', '$location', '$log', 'todoFactory'];

	function TodoEditCtrl($scope, $routeParams, $location, $log, todoFactory) {
    var self = this;
    var id = $routeParams.id;
    $scope.$root.setTitle('Edit nr. ' + id);

    self.cancel = function() {
      $location.url('/');
    };
    self.save = function() {
      var date = self.item.date;	//converto le date i UTC
      date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

      var completed = self.item.completed;
      if (completed !== null) {
        completed = self.item.completed;	//converto le date i UTC
        completed = new Date(Date.UTC(completed.getFullYear(), completed.getMonth(), completed.getDate()));
      }
      todoFactory.update({
        id: self.item.id,
        date: date,
        title: self.item.title,
        note: self.item.note,
        idCategory: self.item.idCategory,
        completed: completed
      }).then(function(result) {
        var data = result.data;
        if (result.success) {
          self.item = data;
          $location.url('/');
        }
      });
    };

		self.loaded = true;
		self.categories = null;

    todoFactory.categories().then(function(result) {
      var data = result.data;
      if (result.success) {
        self.categories = data;
        $log.log("cat");
      }
    }).then(function() {
      todoFactory.get(id).then(function(result) {
        var data = result.data;
        if (result.success) {
          self.item = data;
          // normalizzo le date che dovrò editare
          // altrimenti alcuni browser le riconoscono come stringhe
          self.item.date = new Date(self.item.date);
          if (self.item.completed !== null)
            self.item.completed = new Date(self.item.completed);
        } else {
          self.item = null;
          self.loaded = false;
        }
        //$log.log("item");
      });
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