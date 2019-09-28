(function () {"use strict";

	angular.module('app').controller('TodoCtrl', TodoCtrl);

	TodoCtrl.$inject = ['$scope', '$routeParams', '$location', '$log', '$modal', 'todoFactory'];

	function TodoCtrl($scope, $routeParams, $location, $log, $modal, todoFactory) {
		var self = this;
		$scope.$root.setTitle('Lists');
		
		self.search={
			text: null,
			idCategory: '',
			status: 0,
			sort:'id desc'	// ordinamento di default
		};

		self.isComplete = function (item) {
			return item.completed != null;
		};
		
		self.duration = function (item) {
			var dtEnd = Date.parse(item.completed == null ? item.modified : item.completed);
			var dtStart = Date.parse(item.date);
			var miliseconds = dtEnd - dtStart;
			var d= parseInt(miliseconds / (24 * 60 * 60 * 1000) * 10) / 10;
			return (d<0) ? 0 : d;
		};

		self.findById = function (id) {
			for (var i = 0; i < self.items.length; i++) {
				if (self.items[i].id === id) {
					$scope.$root.status = 'wait...';
					return self.items[i];
				}
			}
			$scope.$root.status = 'wait...';
			return null;
		};
		
		self.edit = function (item) {
			console.log("edit");
			$location.url('/edit/' + item.id);
		};
		
		self.confirmDelete = function (item) {
		    var modalInstance = $modal.open({
		    	animation: true,
				templateUrl: '/app/pages/modal/deleteConfirm.html',
				controller: 'DeleteConfirmCtrl',
				controllerAs: 'modal',
				//size: 'sm',
		      	resolve:{ 
					item:function () { return item; }
			  	}
		    });
			modalInstance.result.then(function (selectedItem) {
		      self.deleteItem(selectedItem);
		    }, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		    });
		};
		
		self.deleteItem = function (item) {
			todoFactory.delete(item.id).then(function (result) {
        var data=result.data;
        if(result.success){
          item = data;
          self.doSearch();
        }
			});
		};
		
		self.toggle = function (item) {
			var itemFound = self.findById(item.id);
			if (itemFound === null) return;
			todoFactory.toggle(itemFound.id).then(function (result) {
        var data=result.data;
        if(result.success){
          itemFound.completed = data.completed;
          itemFound.modified = data.modified;
          console.log(data.modified);
        }
			});
		};

		//gestione paginazione
    self.pagination = {
      pageSize: 10,	//numeri di elementi in ogni pagina
      pageNumber: 1,	//pagina corrente
      totalItems: 0,	//numero totale di elementi
      maxSize: 10		//numero di pagine visualizzate nella naviagation
    };
    self.pageChanged = function() {
      self.doSearch();
    };
    self.setSort = function(field) {
      var f = field.toLowerCase();

      var c = self.search.sort;
      var co = c;
      var i = c.indexOf(' ');
      if (i > 0)
        co = c.substring(0, i);
      if (f !== co) {
        self.search.sort = f;
      } else if (f + ' desc' === c) {
        self.search.sort = f;
      } else {
        self.search.sort = f + ' desc';
      }
      self.doSearch();
    };
    self.sortClass = function(field) {
      var f = field.toLowerCase();
      var c = self.search.sort;
      var co = c;
      var i = c.indexOf(' ');
      if (i > 0)
        co = c.substring(0, i);
      if (f !== co) {
        return;
      } else if (f + ' desc' === c) {
        return 'glyphicon-sort-by-alphabet-alt';
      } else {
        return 'glyphicon-sort-by-alphabet';
      }
    };

    self.clearSearch = function() {
      self.search.text = null;
      self.search.idCategory = '';
      self.search.status = 0;
      self.doSearch();
    };
    self.doSearch = function() {
      if (self.pagination.pageNumber < 1)
        self.pagination.pageNumber = 1;
      todoFactory.search(self.pagination.pageNumber, self.pagination.pageSize, self.search)
        .then(function(result) {
          var data = result.data;
          if (result.success) {
            self.items = data;
          } else {
            data = null;
            self.items = null;
          }
          if (data != null && data.length > 0)
            self.pagination.totalItems = data[0].totalItems;
          else
            self.pagination.totalItems = 0;
        });
    };

    self.categories = null;
    self.categoriesWithBlank = [];
    self.updateCategory = function(item, idCategory) {
      todoFactory.updateCategory(item.id, idCategory).then(function(result) {
        var data = result.data;
        if (result.success) {
          var idc = data.idCategory;
          for (var i = 0; i < self.categories.length; i++) {
            if (self.categories[i].id === idc) {
              item.idCategory = idc;
              item.category = self.categories[i].category;
              item.color = self.categories[i].color;
            }
          }
        }
      });
    };
    todoFactory.categories().then(function(result) {
      var data = result.data;
      if (result.success) {
        self.categories = data;
        self.categoriesWithBlank = [{ id: '', category: 'All', color: '' }].concat(data);
        self.search.idCategory = '';
      }
    });

		self.statusAll=[
			{id: 0, text: 'All'},
			{id: 1, text: 'Completed'},
			{id: 2, text: 'Uncompleted'}
		];
			
		self.pagination.pageNumber=1;
		self.doSearch();
	}
})();