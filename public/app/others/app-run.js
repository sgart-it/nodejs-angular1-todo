(function() {	//racchiudo sempre tutto in una 'closure'
  "use strict";

  angular.module('app').run(run);

  run.$inject = ['$rootScope', '$location', '$modal', '$cookies','$timeout'];

  //imposto quello che serve nel global scope
  // - gestione updating
  // - gestione errori / messaggi
  // - funzioni di navigazione goto..
  // - cambio css
  // - modal statistiche
  function run($rootScope, $location, $modal, $cookies, $timeout) {
    $rootScope.wait = 0;
    $rootScope.title = 'Todo';
    $rootScope.subTitle = 'demo todo list by sgart.it';

    $rootScope.setTitle = function(title, subTitle) {
      $rootScope.title = title;
      if (typeof subTitle !== "undefined" && subTitle != null)
        $rootScope.subTitle = subTitle;
    };
    $rootScope.gotoHome = function() {
      $location.url('/');
    };
    $rootScope.goto = function(url) {
      $location.url(url);
    };

    $rootScope.openStatistics = function() {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: '/app/pages/statistics.html',
        controller: 'TodoStatisticsCtrl',
        controllerAs: 'ts',
        size: 'lg',
        resolve: {}
      });
    };

    /**** css / theme ****/
    $rootScope.cssTable = [
      { value: 'dark', css: '/css/bootswatch.1.min.css', title: 'Dark' },
      { value: 'light', css: '/css/bootswatch.2.min.css', title: 'Light' }
    ];

    $rootScope.setCss = function(css) {
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 365 * 10);
      $cookies.put('theme', css.value, { 'expires': expireDate, 'path': '/' });
      $rootScope.applyCSS();
    };


    $rootScope.applyCSS = function() {
      var v = $cookies.get('theme');
      if (typeof v === "undefined")
        return;
      var cssFile = null;
      for (var i = 0; i < $rootScope.cssTable.length; i++) {
        var c = $rootScope.cssTable[i].value;
        if (c === v) {
          cssFile = $rootScope.cssTable[i].css;
          break;
        }
      }
      if (cssFile === null)
        return;
      //il tag link da cambiare è il secondo, quindi 1
      var oldlink = document.getElementsByTagName("link").item(1);

      var newlink = document.createElement("link");
      newlink.setAttribute("rel", "stylesheet");
      newlink.setAttribute("type", "text/css");
      newlink.setAttribute("href", cssFile);

      document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
    };

    $rootScope.applyCSS();

    /**** UPDATING ****/
    $rootScope.wait = 0;
    $rootScope.isWaiting = function() {
      return $rootScope.wait > 0;
    };
    $rootScope.updating = function() {
      $rootScope.wait++;
    };
    $rootScope.updated = function() {
      if ($rootScope.wait > 0)
        $rootScope.wait--;
    };
    /**** ERRORS ****/
    $rootScope.messages = [];   //{t:0, m=''}
    $rootScope.addMessage = function(t, m, seconds) {
      var item = null;

      if (typeof t === "object")
        item = t;
      else
        item = { t: t, m: m, s: seconds };
      if (typeof item.seconds !== 'number')
        item.seconds = 3;        
      var id = (new Date()).getTime() + "_" + item.t + '_' + $rootScope.messages.length + '_' + item.s;
      item.id = id;
      //timeout di chiusura
      if (typeof item.s === 'number' && item.s > 0) {
        if (item.s > 60)
          item.s = 60;

        $timeout(function() {
          $rootScope.removeMessageById(id);
        }, item.s * 1000);
      }
      $rootScope.messages.push(item);
    };
    $rootScope.addMessageError = function(m, s) {
      $rootScope.addMessage(1, m, s);
    };
    $rootScope.addMessageWarnig = function(m, s) {
      $rootScope.addMessage(2, m, s);
    };
    $rootScope.addMessageSuccess = function(m, s) {
      $rootScope.addMessage(3, m, s);
    };
    $rootScope.addMessageInfo = function(m, s) {
      $rootScope.addMessage(4, m, seconds);
    };
    $rootScope.addMessages = function(arr) {
      if (typeof arr === 'undefined' || arr === null)
        return;
      for (var i = 0; i < arr.length; i++) {
        var a = arr[i];
        if ((/data-close=/gi).test(a.m))
          a.autoclose = true;
        $rootScope.addMessage(a);
      }
    };
    $rootScope.removeMessageById = function(id, autoclose) {
      if (typeof autoclose === 'boolean' && autoclose === false)
        return;
      for (var i = 0; i < $rootScope.messages.length; i++) {
        var m = $rootScope.messages[i];
        if (typeof m.id !== 'undefined' && m.id === id) {
          $rootScope.messages.splice(i, 1);
          return false;
        }
      }
      return false;
    };
    $rootScope.clearMessages = function() {
      $rootScope.messages = []
    };
    $rootScope.showMessage = function() {
      return $rootScope.messages.length > 0;
    };
    $rootScope.getMessageClass = function(m) {
      switch (m.t) {
        case 'E': return 'list-group-item-danger';
        case 'W': return 'list-group-item-warning';
        case 'S': return 'list-group-item-success';
        default: return 'list-group-item-info';
      }
    };
  }

})();