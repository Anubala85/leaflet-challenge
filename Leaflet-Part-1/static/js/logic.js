// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function markerSize(magnitude) {
    return (magnitude * 4);
}

function markerColor(depth) {
    
    if (depth <= 10) {
        return "#00ff00"
    } else if (depth <= 30) {
        return "#ccff00"
    } else if (depth <= 50) {
        return "#ffc87c"
    } else if (depth <= 70) {
        return "#ffa500"
    } else if (depth <= 90) {
        return "#ff8c00"
    } else {
        return "#ff0000"
    }

};

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place, time and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + 
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "</h3><hr><p>" + "Magnitude: " + (feature.properties.mag) + "<br>" + 
    "Depth: " + (feature.geometry.coordinates[2] + "</p>")
    );
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 0.5,
            opacity: 0.5,
            fillOpacity: 1
        });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create a baseMaps object.
let baseMaps = {
    "Street Map": streetmap
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

   // Create our map, giving it the streetmap and earthquakes layers to display on load.
   let mapObj = L.map("map", {
    center: [
      40.09, -115.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

 // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(mapObj);

  let legend = L.control({ position: "bottomright" });
  
  legend.onAdd = function() {

      var div = L.DomUtil.create("div", "info legend");
      depth = [-10, 10, 30, 50, 70, 90];
      labels = [];
      div.innerHTML = "<b>Depth (in km)</b><br>";
    
      // Push to labels array
      for (var i = 0; i < depth.length; i++) {
        labels.push(
            '<lgnd style="background:' + markerColor(depth[i] + 1) + '"></lgnd> ' + depth[i] + (depth[i + 1]? '&ndash;' + depth[i + 1] + '' : '+'));
      }
      
      div.innerHTML += labels.join('<br>');
      return div;
  
    };
  
    // Add legend to the map
  legend.addTo(mapObj);

};