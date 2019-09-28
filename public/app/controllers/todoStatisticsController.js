(function () { "use strict";

	angular.module('app').controller('TodoStatisticsCtrl', TodoStatisticsCtrl);

	TodoStatisticsCtrl.$inject = ['$scope', '$modalInstance', 'todoFactory'];

	function TodoStatisticsCtrl($scope, $modalInstance, todoFactory) {
		var self = this;
		//$scope.$root.setTitle('Statistic', null, false);

		self.items = null;
		self.maxValue = 0;
    self.total = 0;
    todoFactory.statistics().then(function(result) {
      var data = result.data;
      if (result.success) {
        self.items = data;
        for (var i = 0; i < data.length; i++) {
          self.total += data[i].count;
          if (data[i].count > self.maxValue) {
            self.maxValue = data[i].count;
          }
        }
      }
    });

		/*self.ok = function () {
			$modalInstance.close($scope.selected.item);
		};*/

		self.close = function () {
			$modalInstance.dismiss('cancel');
		};
	}

})();