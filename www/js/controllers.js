angular.module('starter.controllers', [])

.factory('urlService',function(){
  var url = 'http://localhost:3000/api/';
  return{
    getUrl : function(){
      return url;
    }
  }
})



.controller('loginCtrl',function($scope,$http,$rootScope,$cordovaFile,$state,urlService,dataProviderService){

    $rootScope.token = { Token:''};

    // document.addEventListener('deviceready', function () {
    //     $cordovaFile.readAsText(cordova.file.externalDataDirectory, 'session.json').then(function(result) {
    //       $rootScope.token = JSON.parse(result);
    //       if($rootScope.token.Token !== '')
    //       {
    //         $state.go('app.maps');
    //       }
    //     }, function (error) {
    //       window.alert('Not able to get session');
    //     });
    // });

    
    $scope.login = function(uname,pwd)
    {
      var headUrl = urlService.getUrl();
        var req = {
        method: 'POST',
        url: headUrl+ 'UserApi/Login?userName=' + uname +'&password='+pwd
      }

      $rootScope.UserName = uname;
      $http(req).success(function(data){
        if(data == null){
         window.alert('Invalid username or password');
        }
        else{
          $rootScope.token = data;
          var promise = dataProviderService.getData();
          promise.success(function(data){
          $rootScope.crimeData = data;
          $state.go('app.maps');
        })
        }
      });  
 
      // $cordovaFile.writeFile(cordova.file.externalDataDirectory, 'session.json', JSON.stringify($rootScope.token), true )
      //   .then( function(result) {    
      //     $state.go('app.maps');  
      //   }, function(err) {
      //     window.alert('something went wrong');
      // }); 
    }
})



.factory('googleHeatMapService',function(){
  return{  
    createHeatMapLayer:function(map,zip,count){
      var MIN_NO_ACC = 211;
      var MAX_NO_ACC = 5000;
      var noAccidents = count;
      
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': zip}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);

          var hotSpot = results[0].geometry.location;

          var heatMapZip = [
          {location: hotSpot, weight: noAccidents}

          ];

         var color =[
              "#ff0000",
              "#00ff00"
          ];

          var heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapZip,
            radius: 50,
            dissapating: false
          });
            
          var rate = (noAccidents-MIN_NO_ACC)/(MAX_NO_ACC-MIN_NO_ACC+1);
          var gradient = [
              'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 0)',
              'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 1)'];
          heatmap.set('gradient', gradient);
          heatmap.setMap(map);

        } else {
          //alert("Geocode was not successful for the following reason: " + status);
        }
      });

    }
  }
})

.factory('prevLocationService',function(){
  var values = {x:'',y:'',x1:{},y1:{},z:'DRIVE'};
    return{
        setValues : function(origin,destination,originC,destinationC,mode)
        {
          values = {x:origin,y:destination,x1:originC,y1:destinationC,z:mode};
        },
        getValues : function()
        {
          return values;
        }
    };
})

.factory('routeInfoService',function(){
  var dirDisplayData = {response:null,map:null,index:0};
    return{
        setDisplayData : function(response,map,index)
        {
          dirDisplayData = {response:response,map:map,index:index};
        },
        getDisplayData : function()
        {
          return dirDisplayData;
        }
    };    
})

.factory('dataProviderService',function(urlService,$http,$rootScope){
  var crimeData;
  return{  
    getData:function(){
      var headUrl = urlService.getUrl();
      var req = {
      method: 'GET',
      url: headUrl + 'Crime/GetCrimeDetails',
      headers  : { 'Token' : $rootScope.token.Token}
      }

        return  $http(req).success(function(data){}); 
      }                 
    }  
})

.factory('saftyProviderService',function(urlService,$http,$rootScope){
  var crimeData;
  return{  
    getData:function(lat,lng){
      var headUrl = urlService.getUrl();
      var req = {
      method: 'GET',
      url: headUrl + 'RouteSegment/GetRouteSegment',
      headers  : { 'Token' : $rootScope.token.Token}
      }

        return  $http(req).success(function(data){}); 
      }                 
    }  
})

// .factory('geocodingService',function(){
//   var areaAddress = [];
//   return{
//     setPolyArea : function(lat,lng){
//         var latlng = new google.maps.LatLng(lat, lng);
//         var geocoder = geocoder = new google.maps.Geocoder();
//         geocoder.geocode({ 'latLng': latlng }, function (results, status) {
//             if (status == google.maps.GeocoderStatus.OK) {
//                 if (results[1]) {
//                     areaAddress.push(results[1].formatted_address);
//                 }
//             }
//         });
//     }
//   }
// })

.controller('AppCtrl', function($scope, $ionicModal,$rootScope,$http,$state,$cordovaFile,$cordovaSms, $timeout,$ionicSideMenuDelegate,urlService) {

    var headUrl = urlService.getUrl();
    $scope.emgContacts = [];
    $scope.avatar = 'img/no-profile.png';
    angular.element(document.getElementById("menu-avatar")).css('background-image','url(\''+$scope.avatar+'\')');
      var req = {
      method: 'GET',
      url: headUrl + 'UserApi/GetEmergencyContacts?userId='+$rootScope.token.UserId,
      headers  : { 'Token' : $rootScope.token.Token}
      }

    $http(req).success(function(data){
        $scope.emgContacts = data;
    }); 


  $scope.MapType = '';

       $scope.RoadMap =  function()
      {
        $scope.MapType = 'roadmap';
        $scope.$broadcast('mapChanged',$scope.MapType);
      }
      $scope.Satellite =  function()
      {
        $scope.MapType = 'satellite';
        $scope.$broadcast('mapChanged',$scope.MapType);
      }
      $scope.Hybrid =  function()
      {
        $scope.MapType = 'hybrid';
        $scope.$broadcast('mapChanged',$scope.MapType);
      }
      $scope.Terrain =  function()
      {
        $scope.MapType = 'terrain';
        $scope.$broadcast('mapChanged',$scope.MapType);
      }

      $scope.TrackMe =  function(user)
      {
        $state.go('app.dtl',{obj:user});
        //$state.go('rooms',{obj:user});
      }

      $scope.sms = function(user)
      {
        
        $cordovaSms.send(user.ContactNumber+'', 'Hi '+user.ContactName+' I need your help')
        .then(function() {
          // Success! SMS was sent
          window.alert('your message was sent');
        }, function(error) {
          // An error occurred
          window.alert('Sending failed');
        });
      }

      $scope.goChat = function(user)
      {
        angular.element(document.getElementsByClassName('window-details')).css('visibility','visible');
        $state.go('app.dtl',{obj:user.id});
      }

      $scope.logout = function()
      {
        $rootScope.token = { Token : '' };
        // $cordovaFile.writeFile(cordova.file.externalDataDirectory, 'session.json', JSON.stringify($rootScope.token), true )
        //   .then( function(result) {  
        //   }, function(err) {
        // });
        $ionicSideMenuDelegate.toggleLeft();  
        $state.go('login');    
      }
})

.controller('PlaylistsCtrl', function($scope) {

})

.controller('DirCtrl', function($scope, $rootScope,$timeout,$stateParams,$state,prevLocationService,routeInfoService,dataProviderService) {
  $scope.dataset = dataProviderService.getData();
  var selectedBox = '';
  $scope.selected1 = false;
  $scope.selected2 = false;
  $scope.selected3 = false;
  $scope.selected4 = false; 


  var prevLocations = prevLocationService.getValues();
  var defaultTravelMode = prevLocations.z;
  $scope.start = prevLocations.x;
  $scope.end = prevLocations.y;
  var origin = prevLocations.x1;
  var destination = prevLocations.y1;
  var myLocation = $state.params.obj;
  //initaillize direction renderer
  var renderer = new google.maps.DirectionsRenderer({
      suppressPolylines: true,
      polylineOptions: {
      strokeColor: '#C83939',
      strokeOpacity: 1,
      strokeWeight: 3
    }
  });

  var displayData = routeInfoService.getDisplayData();
  if(displayData.response !== null){
    var panel = document.getElementById('panel');
      renderer.setDirections(displayData.response);
      //renderer.setMap(displayData.map);
      renderer.setPanel(panel);
  }

  switch(defaultTravelMode)
  {
    case 'DRIVING':
      $scope.selected1 = true;
      break;
    case 'TRANSIT':
      $scope.selected2 = true;
      break;
    case 'WALKING':
      $scope.selected3 = true;
      break;
    case 'BICYCLING':
      $scope.selected4 = true;
      break;      
    default:
      $scope.selected1 = true;
  }

  angular.element(document.getElementsByClassName('popup')).css('visibility','hidden');

  var autocomplete =   new google.maps.places.Autocomplete((document.getElementById('inputbox')), {
        types: ['geocode']
    });

    //autocomplete.bindTo('bounds', $scope.map);
    autocomplete.addListener('place_changed', function () {
      setPlace();
      angular.element(document.getElementsByClassName('popup')).css('visibility','hidden');
    });

    $scope.getMyLocation = function()
    {

      if(myLocation.coords === undefined)
      {
        window.alert("Not able to get current location");
        return; 
      }
      if(selectedBox === 'start')
      {
        $scope.start = 'Your Location';
        origin = { lat: myLocation.coords.latitude, lng: myLocation.coords.longitude };
      }
      else if(selectedBox === 'end')
      {
        $scope.end = 'Your Location';
        destination = { lat: myLocation.coords.latitude, lng: myLocation.coords.longitude };
      }        
      angular.element(document.getElementsByClassName('popup')).css('visibility','hidden');
      if(($scope.start !== undefined && $scope.start !== null && $scope.start !== '') && ($scope.end !== undefined && $scope.end !== null && $scope.end !== ''))
      {
          $rootScope.$broadcast('stopDirection');
          if($scope.selected2)
          {
            $timeout(function(){
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'TRANSIT'});
          });
          }
          else if($scope.selected3)
          {
            $timeout(function(){
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'WALKING'});
          });
          }
          else if($scope.selected4)
          {
            $timeout(function(){
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'BICYCLING'});
          });
          }
          else
          {
            $timeout(function(){ 
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'DRIVING'});
          });
            prevLocationService.setValues($scope.start,$scope.end,origin,destination,prevLocations.z);
            $state.go('app.maps');
        }
      }
    }     

    if($scope.start === '' && myLocation.coords !== undefined){
        $scope.start = 'Your Location';
        origin = { lat: myLocation.coords.latitude, lng: myLocation.coords.longitude };      
    }

    var setPlace = function () { 
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      
      if(selectedBox === 'start')
      {
        $scope.start = place.formatted_address;
        origin = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        $scope.$apply();
      }
      else if(selectedBox === 'end')
      {
        $scope.end = place.formatted_address;
        destination = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        $scope.$apply();
      }

      if(($scope.start !== undefined && $scope.start !== null && $scope.start !== '') && ($scope.end !== undefined && $scope.end !== null && $scope.end !== ''))
      {
          $rootScope.$broadcast('stopDirection');
          if($scope.selected2)
          {
            $timeout(function(){
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'TRANSIT'});
          });
          }
          else if($scope.selected3)
          {
            $timeout(function(){
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'WALKING'});
          });
          }
          else if($scope.selected4)
          {
            $timeout(function(){
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'BICYCLING'});
          });
          }
          else
          {
            $timeout(function(){ 
            $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'DRIVING'});
          });
            prevLocationService.setValues($scope.start,$scope.end,origin,destination,prevLocations.z);
            $state.go('app.maps');
        }
      }
    }

    $scope.disableTap = function () { 
      var container = document.getElementsByClassName('pac-container');
      angular.element(container).attr('data-tap-disabled', 'true');
      var backdrop = document.getElementsByClassName('backdrop');
      angular.element(backdrop).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function () {
        document.getElementById('pac-input').blur();
      });
    };

    $scope.stopDir = function()
    {
      $rootScope.$broadcast('stopDirection');
      $scope.start = '';
      $scope.end = '';
      routeInfoService.setDisplayData(null,null,0);
      renderer.setPanel(null);
      //renderer.setMap(null);
      prevLocationService.setValues($scope.start,$scope.end,{},{},prevLocations.z);
      $state.go('app.maps');
    }

    $scope.findStart = function()
    {
      selectedBox = 'start';
      angular.element(document.getElementById('inputbox')).val('');      
      angular.element(document.getElementsByClassName('popup')).css('visibility','visible');
    }

    $scope.findEnd = function()
    {
      selectedBox = 'end';
      angular.element(document.getElementById('inputbox')).val('');      
      angular.element(document.getElementsByClassName('popup')).css('visibility','visible');      
    }   

    $scope.selectDrive = function()
    {
      $scope.selected1 = true;
      $scope.selected2 = false;
      $scope.selected3 = false;
      $scope.selected4 = false;     
      if(($scope.start !== undefined && $scope.start !== null && $scope.start !== '') && ($scope.end !== undefined && $scope.end !== null && $scope.end !== ''))
      {
        $rootScope.$broadcast('stopDirection');
        $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'DRIVING'});
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'DRIVING');
        $state.go('app.maps');
      }
      else
      {
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'DRIVING');        
      }
    }

    $scope.selectTransit = function()
    {
      $scope.selected1 = false;
      $scope.selected2 = true;
      $scope.selected3 = false;
      $scope.selected4 = false;   
      if(($scope.start !== undefined && $scope.start !== null && $scope.start !== '') && ($scope.end !== undefined && $scope.end !== null && $scope.end !== ''))
      {
        $rootScope.$broadcast('stopDirection');
        $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'TRANSIT'});
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'TRANSIT');
        $state.go('app.maps');
      }
      else
      {
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'TRANSIT');        
      }
    }

    $scope.selectWalk = function()
    {
      $scope.selected1 = false;
      $scope.selected2 = false;
      $scope.selected3 = true;
      $scope.selected4 = false;  
      if(($scope.start !== undefined && $scope.start !== null && $scope.start !== '') && ($scope.end !== undefined && $scope.end !== null && $scope.end !== ''))
      {
        $rootScope.$broadcast('stopDirection');
        $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'WALKING'});   
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'WALKING');
        $state.go('app.maps'); 
      }  
      else
      {
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'WALKING');        
      }   
    }

    $scope.selectCycling = function()
    {
      $scope.selected1 = false;
      $scope.selected2 = false;
      $scope.selected3 = false;
      $scope.selected4 = true;   
      if(($scope.start !== undefined && $scope.start !== null && $scope.start !== '') && ($scope.end !== undefined && $scope.end !== null && $scope.end !== ''))
      {
        $rootScope.$broadcast('stopDirection');
        $rootScope.$broadcast('travelModeChanged',{start:origin,end:destination,mode:'BICYCLING'});  
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'BICYCLING');
        $state.go('app.maps'); 
      }
      else
      {
        prevLocationService.setValues($scope.start,$scope.end,origin,destination,'BICYCLING');        
      }     
    }     

})

.controller('MapsCtrl', function($scope, $location,$rootScope, $stateParams,dataProviderService,$ionicSideMenuDelegate) {

    $scope.dataset = $rootScope.crimeData;
    $scope.$on('$ionicView.enter', function(){
      $ionicSideMenuDelegate.canDragContent(false);
    });
  $scope.$on('$ionicView.leave', function(){
      $ionicSideMenuDelegate.canDragContent(true);
    });


})


.directive('heatMap', function(){
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    template: '<div id=\"floating-panel\">\
    <div class=\"location\" ng-class=\"myLocation?\'my-location\':\'\'"\ ng-click=\"refresh()\"></div>\
    </div>\
    <input id=\"pac-input\" class="controls" type=\"text\" ng-model=\"searchLoc\" placeholder=\"Search\" autocomplete=\"on\" ng-change=\"disableTap()\" data-tap-disabled=\"true\">\
    <div class=\"search-result\" ng-if=\"found.value\">\
    <h4 style=\"color:#111;margin-right:7%;\">{{resultLocation}}</h4>\
    <i class=\"close-icon\" aria-hidden=\"true\" ng-click=\"close()\" style=\"color:#111;\">&#10006;</i>\
    </div><div id=\"map\"></div>',
    link: function(scope, ele, attr){

    },
    controller: function($scope,$http,$timeout,$state,$rootScope,$cordovaSms,routeInfoService,$cordovaGeolocation,saftyProviderService,googleHeatMapService)
    {
        var gradient = [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ];     

      var options = {timeout: 30000, enableHighAccuracy: true};
      $scope.myLocation = false;
      var currentLocation = {};
      $scope.found = { value:false };
      $scope.markers = [];      
      var directionsDisplay = [];
      var directionsService = null;  
      var infoWindow = new google.maps.InfoWindow();
      $scope.travelMode = 'directions';
      $http.get('data/session.json').success(function(promise){
        $scope.lat = promise.lat;
        $scope.long = promise.long;
        var myLatlng = new google.maps.LatLng($scope.lat, $scope.long);                

        //set points A and B
          var renderer = new google.maps.DirectionsRenderer({
            suppressPolylines: true,
            polylineOptions: {
            strokeColor: '#C83939',
            strokeOpacity: 1,
            strokeWeight: 3
          }
        });  

        defaultOptions = {
          zoom: 10,
          center: myLatlng,
          panControl: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          overviewMapControl: true,
          rotateControl: true
        };
          $scope.map = new google.maps.Map(document.getElementById("map"), defaultOptions);

        for(var i=0;i<$scope.data.length;i++){
          $scope.heatmap = googleHeatMapService.createHeatMapLayer($scope.map,$scope.data[i].Address,$scope.data[i].NoOfCrimes);
        }

        $rootScope.$on( "$ionicView.enter", function( scopes, states ) {
           google.maps.event.trigger( $scope.map, 'resize' );
        });


      var polylines = [];
      var crimeScalePolyline = [];
      var areaDetails1 = [];
      var areaDetails2 = [];
      var bounds = new google.maps.LatLngBounds();

      var renderDirectionsPolylines = function(response) {
        renderer.setDirections(response);  
        renderer.setMap($scope.map);
        var safeRoute = saftyProviderService.getData();
        safeRoute.then(function(promise){
          for (var i=0; i<crimeScalePolyline.length; i++) {
            crimeScalePolyline[i].setMap(null);
          }
            for(x=0;x<response.routes.length;x++)
            {
              var legs = response.routes[x].legs;
              for (i = 0; i < legs.length; i++) {
                var steps = legs[i].steps;
                for (j = 0; j < steps.length; j++) {
                  var nextSegment = steps[j].path;
                        var polylineOptions = {
                        clickable : false,  
                        strokeColor: promise.data[j].Intensity == 0? "red" : "green",
                        strokeOpacity: 1,
                        strokeWeight: 3,
                        zIndex : 5
                      };
                  var stepPolyline = new google.maps.Polyline(polylineOptions);
                  for (k = 0; k < nextSegment.length; k++) {
                    stepPolyline.getPath().push(nextSegment[k]);
                    bounds.extend(nextSegment[k]);
                  }
                  stepPolyline.setMap($scope.map);
                  crimeScalePolyline.push(stepPolyline);
                }
            }
          }        
          })
        }  

     

          var calculateAndDisplayRoute = function(directionsService, directionsDisplay,routeData) {
            var selectedMode = routeData.mode;
            directionsService.route({
              origin: routeData.start,  
              destination: routeData.end, 
              provideRouteAlternatives: true,
              //   drivingOptions: {
              //   departureTime: new Date(),
              //   trafficModel: 'optimistic'
              // },
              unitSystem: google.maps.UnitSystem.METRIC,
              travelMode: google.maps.TravelMode[selectedMode]
            }, function(response, status) {
              if (status == 'OK') {    
                for (var i=0; i<polylines.length; i++) {
                  polylines[i].setMap(null);
                }
                  for(x=0;x<response.routes.length;x++)
                  {
                  var arr = response.routes[x].overview_path;
                   for(ind = 0;ind<arr.length;ind++)
                   {
                      areaDetails1.push(arr[ind].lat());
                      areaDetails2.push(arr[ind].lng());
                   }
                    var legs = response.routes[x].legs;
                    for (i = 0; i < legs.length; i++) {
                      var steps = legs[i].steps;
                      for (j = 0; j < steps.length; j++) {
                        var nextSegment = steps[j].path;
                              var polylineOptions = {
                              strokeColor: x == 0? "#0088FF" : "grey",
                              strokeOpacity: x == 0? 1 : 0.8,
                              strokeWeight: 10,
                              active : x
                            };
                        var stepPolyline = new google.maps.Polyline(polylineOptions);
                        for (k = 0; k < nextSegment.length; k++) {
                          stepPolyline.getPath().push(nextSegment[k]);
                          bounds.extend(nextSegment[k]);
                        }
                        stepPolyline.setMap($scope.map);
                        polylines.push(stepPolyline);
                        google.maps.event.addListener(stepPolyline,'click', function(evt) {
                           infoWindow.setContent("you clicked on the route<br>"+evt.latLng.toUrlValue(6)+"<br><br><a id=\"dtl-info\">click here fot details</a>");
                           infoWindow.setPosition(evt.latLng);
                           infoWindow.open($scope.map);
                        })
                      }
                    }
                  }
                  polylines.forEach(function(poly){
                        google.maps.event.addListener(poly,'click', function(event) {
                          polylines.forEach(function(routeLine){
                              if(poly.active === routeLine.active)
                              {
                                  routeLine.setOptions({strokeColor: '#0088FF',strokeOpacity:1});
                              }
                              else{
                                  routeLine.setOptions({strokeColor: 'grey',strokeOpacity:0.8});
                              }
                          })
                          routeInfoService.setDisplayData(response,$scope.map,poly.active);
                      })            
                  })
                  $scope.map.fitBounds(bounds);
                $scope.markers.forEach(function(marker) {
                  marker.setMap($scope.map);
                });
              renderDirectionsPolylines(response);
              routeInfoService.setDisplayData(response,$scope.map,0);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
            });
          }          

          //change map type
          $scope.$on('mapChanged',function(event,data){
           $scope.map.setMapTypeId(data);
          }); 

          $rootScope.$on('stopDirection',function(){
            $scope.travelMode = 'directions'
            renderer.setMap(null);
            $scope.markers.forEach(function(marker) {
            marker.setMap(null);
            });
            $scope.markers = [];
            angular.element(document.getElementsByClassName('directions')).css('background-image','url(\'img/direction.png\')');
            for(var i=0;i<polylines.length;i++)
            {
              polylines[i].setMap(null);
            }
            for (var i=0; i<crimeScalePolyline.length; i++) {
              crimeScalePolyline[i].setMap(null);
            }
             for(var i=0;i<directionsDisplay.length;i++)
            {
              directionsDisplay[i].setMap(null);
            }       
            polylines = [];
            directionsDisplay = [];
            $scope.refresh();
          });

          $rootScope.$on('travelModeChanged',function(event,data){
            directionsService = new google.maps.DirectionsService;
            $scope.markers.forEach(function(marker) {
            marker.setMap(null);
            });
            $scope.markers = [];
            calculateAndDisplayRoute(directionsService, directionsDisplay, data);
              switch(data.mode)
              {
                case 'DRIVING':
                  $scope.travelMode = 'driving'
                  angular.element(document.getElementsByClassName('directions')).css('background-image','url(\'img/car.png\')');
                  break;
                case 'TRANSIT':
                  $scope.travelMode = 'transit'
                  angular.element(document.getElementsByClassName('directions')).css('background-image','url(\'img/train.png\')');
                  break;
                case 'WALKING':
                  $scope.travelMode = 'walking'
                  angular.element(document.getElementsByClassName('directions')).css('background-image','url(\'img/walk.png\')');
                  break;
                case 'BICYCLING':
                  $scope.travelMode = 'cycling'
                  angular.element(document.getElementsByClassName('directions')).css('background-image','url(\'img/cycle.png\')');
                  break;      
                default:
              }
          });

          var image = 'img/locator.png';
          var marker = new google.maps.Marker({
          position: myLatlng,
          icon: image,
          title:"Your Location"
          });

          var setPlace = function () {
          //infoWindow.close();
          var place = autocomplete.getPlace();
          if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
          }
          // If the place has a geometry, then present it on a map.
          if (place.geometry.viewport) {
            $scope.map.fitBounds(place.geometry.viewport);
          } else {
            $scope.map.setCenter(place.geometry.location);
          }
          $scope.found.value = true;
          $scope.resultLocation = place.formatted_address;
          $scope.$apply();
          createMarker({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), address: place.formatted_address });
          }

          var createMarker = function (info) {
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(info.lat, info.lng),
              title: info.address
            });
            marker.content = '<div class="infoWindowContent">' + info.address + '</div>';
            google.maps.event.addListener(marker, 'click', function () {
              infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
              infoWindow.open($scope.map, marker);
            });
            $scope.markers.push(marker);
          }               

          $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
          // Listen for the event fired when the user selects a prediction and retrieve
          // more details for that place.
          //init autocomplete
          var input = document.getElementById('pac-input');
          var autocomplete = new google.maps.places.Autocomplete(input);
          //autocomplete.bindTo('bounds', $scope.map);
          autocomplete.addListener('place_changed', function () {
            setPlace();
          });

          $scope.disableTap = function () { 
            var container = document.getElementsByClassName('pac-container');
            angular.element(container).attr('data-tap-disabled', 'true');
            var backdrop = document.getElementsByClassName('backdrop');
            angular.element(backdrop).attr('data-tap-disabled', 'true');
            // leave input field if google-address-entry is selected
            angular.element(container).on("click", function () {
              document.getElementById('pac-input').blur();
            });
          };

          //close result box after search
          $scope.close = function()
          {
            $scope.found.value = false;
             // Clear out the old markers.
            angular.element(document.getElementById('pac-input')).val('');
            $scope.markers.forEach(function(marker) {
            marker.setMap(null);
            });
            $scope.markers = [];                        
          }

          $scope.openInfoWindow = function (e, selectedMarker) {
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
          }        

          var onPanoInit = function(map){
          var thePanorama = map.getStreetView();
          google.maps.event.addListener(thePanorama, 'visible_changed', function() {
            if (thePanorama.getVisible()) {
              angular.element(document.getElementById('pac-input')).css('visibility','hidden');
            } else {
              angular.element(document.getElementById('pac-input')).css('visibility','visible');
            }
            });
          }

          onPanoInit($scope.map);
        //current location info
        $cordovaGeolocation.getCurrentPosition(options).then(function(position){
          latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          var tempLocation = {x:position.coords.latitude,y:position.coords.longitude};
          $scope.lat = position.coords.latitude;
          $scope.long = position.coords.longitude;
          // map options,
          myOptions = {
          zoom: 19,
          center: latLng,
          panControl: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          overviewMapControl: true,
          rotateControl: true,
          };                  
          // standard map
          //$scope.map = new google.maps.Map(document.getElementById("map"), myOptions);
          $scope.map.setOptions(myOptions);
          //directionsDisplay.setMap($scope.map);
          //marker
          image = 'img/locator.png';
          marker = new google.maps.Marker({
          position: latLng,
          icon: image,
          title:"Your Location"
          });
          // To add the marker to the map, call setMap();
          marker.setMap($scope.map);     
          onPanoInit($scope.map);
          //heatmap layer
          //$scope.heatmap = googleHeatMapService.createHeatMapLayer($scope.map,$scope.data,gradient);
          //heatMapService.createHeatMapLayer($scope.map,config,$scope.data);
          currentLocation = position;
          }, function(error){
          console.log("could not get the location");
        }); 

         var watchOptions = {timeout : 1000, enableHighAccuracy: false};
         var watch = $cordovaGeolocation.watchPosition(watchOptions);
        
        //live update in location
         watch.then(
            null,
          
            function(err) {
               console.log(err)
            },
          
            function(position) {
               $scope.lat  = position.coords.latitude;
               $scope.long = position.coords.longitude;
               marker.setPosition(new google.maps.LatLng($scope.lat, $scope.long));
               currentLocation = position;
            }
         );

          //reset the map
          $scope.refresh = function()
          { 
            $scope.myLocation = true;           
            var newLatLng = new google.maps.LatLng($scope.lat, $scope.long);    
            $scope.map.setCenter(newLatLng);  
            $scope.map.setZoom(19);             
            //marker
            marker.setPosition(newLatLng);              
            onPanoInit($scope.map);     
            $timeout(function () {
              $scope.myLocation = false;
              $scope.$apply();
            }, 5000);                                  
          }

        $rootScope.goToDir = function()
        {               
          $state.go('app.dir',{obj : currentLocation});
        }

        $rootScope.closePopup = function()
        {
          angular.element(document.getElementsByClassName('window-details')).css('visibility','hidden');
        }

        google.maps.event.addListener(infoWindow, 'domready', function(evt){
            $('#dtl-info').click(function(e){
              e.preventDefault();
              //$state.go('app.dtl');
              angular.element(document.getElementsByClassName('window-details')).css('visibility','visible');
              infoWindow.close();
            })
          });
      });    
    }
  };
})


.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
})

.controller('DetailCtrl',function($scope,$http,$state,$rootScope,$ionicSideMenuDelegate,localStorageService, SocketService){

  var me = this;
  me.current_room = localStorageService.get('room');
  localStorageService.set('username', $rootScope.UserName);

  $scope.$on('$ionicView.enter', function(){
    $ionicSideMenuDelegate.canDragContent(false);
  });
  $scope.$on('$ionicView.leave', function(){
      $ionicSideMenuDelegate.canDragContent(true);
  });


  $scope.enterRoom = function(room_name){

    me.current_room = room_name;
    localStorageService.set('room', room_name);
    
    var room = {
      'room_name': room_name
    };

    SocketService.emit('join:room', room);

    $state.go('room');
  };

  $scope.enterRoom('Chat with '+$state.params.obj.name);


  $http.get('data/session.json').success(function(promise){
  $scope.lat = promise.lat;
  $scope.long = promise.long;  
  var myLatlng = new google.maps.LatLng($scope.lat, $scope.long);

        defaultOptions = {
          zoom: 17,
          center: myLatlng,
          panControl: true,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: true,
          overviewMapControl: true,
          rotateControl: true
        };
          $scope.map = new google.maps.Map(document.getElementById("map2"), defaultOptions); 
      });  

  $scope.$on('$ionicView.leave',function(){
    angular.element(document.getElementsByClassName('window-details')).css('visibility','hidden');
  });


});
