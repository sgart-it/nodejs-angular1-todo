(function() {
  "use strict";

  angular.module('app').factory('todoFactory', factory);

  factory.$inject = ['$rootScope', '$http'];

  function factory($rootScope, $http) {
    /* funzioni esportate dal factory */
    var factory = {
      'search': _search,
      'get': _get,
      'insert': _insert,
      'update': _update,
      'delete': _delete,
      'toggle': _toggle,
      'updateCategory': _updateCategory,
      'categories': _categories,
      'statistics': _statistics
    };

    /* internal */
    var dbApiBase = "/api";

    function successCallback(response) {
      $rootScope.updated();
      var d = response.data;
      if (d != null)
        $rootScope.addMessages(d.messages);
      return d;
    };
    function errorCallback(response) {
      $rootScope.updated();
      $rootScope.addMessageError(response.data.message);
    };

    /* mothods */
    function _search(pageNumber, pageSize, search) {
      $rootScope.updating();
      return $http.get(dbApiBase + '/todo/search', {
        params: {
          page: pageNumber,
          size: pageSize,
          text: search.text,
          idCategory: search.idCategory,
          status: search.status,
          sort: search.sort,
          t: new Date().getTime()	//per evitare il caching su IE
        },
        cache: false
      }).then(successCallback, errorCallback);
    };

    function _get(id) {
      $rootScope.updating();
      var idInt = parseInt(id);
      return $http.get(dbApiBase + '/todo/' + idInt, {
        params: {
          t: new Date().getTime()	//per evitare il caching su IE
        },
        cache: false
      }).then(successCallback, errorCallback);
    };

    function _insert(param) {
      $rootScope.updating();
      return $http.post(dbApiBase + '/todo/insert', {
        date: param.date,
        title: param.title,
        note: param.note,
        idCategory: param.idCategory
      }).then(successCallback, errorCallback);
    };

    function _update(param) {
      $rootScope.updating();
      return $http.post(dbApiBase + '/todo/update', {
        id: param.id,
        date: param.date,
        title: param.title,
        note: param.note,
        idCategory: param.idCategory,
        completed: param.completed
      }).then(successCallback, errorCallback);
    };

    function _delete(id) {
      $rootScope.updating();
      var idInt = parseInt(id);
      return $http.post(dbApiBase + '/todo/delete', { id: idInt }).then(successCallback, errorCallback);

    };

    function _toggle(id) {
      $rootScope.updating();
      var idInt = parseInt(id);
      return $http.post(dbApiBase + '/todo/toggle', { id: idInt }).then(successCallback, errorCallback);
    };

    function _updateCategory(id, idCategory) {
      $rootScope.updating();
      return $http.post(dbApiBase + '/todo/category', { id: id, idCategory: idCategory }).then(successCallback, errorCallback);
    };

    function _categories() {
      $rootScope.updating();
      return $http.get(dbApiBase + '/categories', {
        params: {
          t: new Date().getTime()	//per evitare il caching su IE
        },
        cache: false
      }).then(successCallback, errorCallback);
    };

    function _statistics() {
      $rootScope.updating();
      return $http.get(dbApiBase + '/statistics', {
        params: {
          t: new Date().getTime()	//per evitare il caching su IE
        },
        cache: false
      }).then(successCallback, errorCallback);
    };

    return factory;
  }

})();