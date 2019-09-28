(function () { "use strict";

	angular.module('app').controller('DeleteConfirmCtrl', DeleteConfirmCtrl);

	DeleteConfirmCtrl.$inject = ['$scope','$modalInstance', 'item'];

	function DeleteConfirmCtrl($scope, $modalInstance, item) {
		var self = this;
		self.item=item;
		
		self.ok = function () {
			$modalInstance.close(self.item);
		};
		
		self.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
})();		