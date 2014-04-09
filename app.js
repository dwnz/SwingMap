function SwingMap (){
	var self = this;

	self.swings = ko.observableArray();
	self.map = null;
	self.markers = [];

	self.start = function(){
		var swing = Hoist('swings');

		swing.get(function(data){
			self.swings(data);
		});

		$('#map').height($(window).height() - 50);

		self.createMap();
	};

	self.createMap = function(){
		navigator.geolocation.getCurrentPosition(function(position) {
			var mapOptions = {
				center: new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude),
				zoom: 13
			};

			self.map = new google.maps.Map(document.getElementById("map"), mapOptions);

			google.maps.event.addListener(self.map, 'idle', function(ev){
				self.searchSwings();
			});

			google.maps.event.addListener(self.map, 'click', function(event) {
				if(confirm("Are you sure you want to add a swing here?")){
					var marker = new google.maps.Marker({
						position: event.latLng,
						map: self.map
					});
			
					self.markers.push(marker);

					var areaName = prompt("Area name");
					var swing = Hoist('swings');

					swing.post({
						name: areaName,
						lat: event.latLng.lat(),
						long: event.latLng.lng()
					}, function(data){
						console.log(data);
					});
				}
			});
    	});
	};

	self.searchSwings = function(){

		for(var i = 0; i > self.markers.length; i++){
			self.markers[i].setMap(null);
		}
		self.markers = [];

		var bounds = self.map.getBounds();
		var ne = bounds.getNorthEast(); // LatLng of the north-east corner
		var sw = bounds.getSouthWest(); // LatLng of the south-west corder

		var nw = new google.maps.LatLng(ne.lat(), sw.lng());
		var se = new google.maps.LatLng(sw.lat(), ne.lng());

		var filteredItems = self.swings().filter(function(item){
			var isInLat = false;
			var isInLong = false;

			if(item.lat < nw.lat() && se.lat() < item.lat){
				isInLat = true;
			}

			if(item.long > nw.lng() &&  item.long < se.lng()){
				isInLong = true;
			}

			return isInLat && isInLong;
		});	

		for(var i = 0; i < filteredItems.length; i++){
			var item =  filteredItems[i];

			self.markers.push(new google.maps.Marker({
				position: new google.maps.LatLng(item.lat, item.long),
				map: self.map,
				title: item.name
			}));	
		}
	};
}