// Part 1: Create the Earthquake Visualization
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Get dataset from USGS page
d3.json(link).then(function(data){
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Create function to create a popup to describe information of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + 
      "</p>" + "<br><h2> Magnitude: " + feature.properties.mag + "</h2>");
  }

  // Create function for the circle markers 
  function createCircleMarker(feature,coordinates){
    // Set up markers size, color and opacity
    let options = {
        radius:feature.properties.mag*5,
        fillColor: selectColor(feature.properties.mag),
        color: selectColor(feature.properties.mag),
        weight: .5,
        opacity: .5,
        fillOpacity: .3
    }
    return L.circleMarker(coordinates, options);
  }
  
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker
  });
  
  // Call the createMap function
  createMap(earthquakes);
}

// Create function to select Color circles based on mag
function selectColor(mag) {
  switch(true) {
      case (0.0 <= mag && mag <= 2.0):
        return "#00B6BC";
      case (2.0 <= mag && mag <= 4.0):
        return "#06BC0D";
      case (4.0 <= mag && mag <= 5.5):
        return "#B6BC00";
      case (5.5 <= mag && mag <= 8.0):
        return "#BC3500";
      case (8.0 <= mag && mag <= 20.0):
        return "#BC0000";
      default:
        return "#E2FFAE";
  }
}

// Create map function
function createMap(earthquakes) {

  // Set up streetstylemap layers
  let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 19,
    id: "outdoors-v10",
    accessToken: API_KEY
  });

  // Set up graymap layers
  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 19,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Set up base layers
  let baseMaps = {
    "Street Map": streetstylemap,
    "Gray Map": graymap
  };

  // Set up overlay layers
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Set up my map with the coordinate of the central of the USA and layers of streetmap and earthquakes
  let myMap = L.map("map", {
    // central of the USA
    center: [
      39.8282, -98.5795
    ],
    zoom: 4,
    layers: [streetstylemap, earthquakes]
  });

  // Control layer
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add info to the map
  legend.addTo(myMap);
}

// Set up legend for the map data.
let legend = L.control({position: 'bottomright'});

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var magnitude = [0.0, 2.0, 4.0, 5.5, 8.0];
    var labels = [];

    // loop through the magnitude intervals
    for (let i = 0; i < magnitude.length; i++) {
        div.innerHTML +=
            '<i style="background:' + selectColor(magnitude[i] + 1) + '"></i> ' +
            magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }

    return div;
};
