// Store the api endpoint url in a variable; we are looking at all earthquakes in the past week
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the earthquake data 
d3.json(queryUrl).then(function(earthquakeData) {
    // Print the earthquake data in the console
    console.log(earthquakeData);
    // Call the CreateFeatures function based on the Features array
    createFeatures(earthquakeData.features);
});

// Create a function to create markers with size based on magnitude and color based on depth
function createMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        // Set the size of the marker by calling the markerSize function with the magnitude as the input
        radius: markerSize(feature.properties.mag),
        // Set the marker color by calling the markerColor function with the depth as the input
        fillColor: markerColor(feature.geometry.coordinates[2]),
        // Set the outline color as black
        color:"black",
        weight: 0.5,
        opacity: 0.5,
        fillOpacity: 1
    });
}

// Create a function to set the marker size 5x the value of the magnitude
function markerSize(magnitude) {
    return magnitude * 5;
}

// Create a function to set the marker colors based on the depth range
function markerColor(depth) {
    if (depth < 10) return "green";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "red";
  }

// Create a function to collect and display the earthquake features of each datapoint
function createFeatures(earthquakeData) {
    // Create a function to run for each feature in the Features array
    // Use this function to show additional information about the earthquake when the associated marker is clicked
    function onEachFeature(feature, layer) {
        // Popup describing the location, magnitude, and depth of the earthquake
        layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
    }

    // Create a GeoJSON layer containing the specfied features information for each point in the data, and create markers by calling the createMarker function. 
    let earthquakes = L.geoJSON(earthquakeData, {
        // Call the onEachFeature function
        onEachFeature: onEachFeature,
        // Call the createMarker function
        pointToLayer: createMarker
    });


    createMap(earthquakes);
}

function createMap(earthquakes) {

    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });


    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [street, earthquakes]
    });


    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); 
    
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {

        let div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 60, 90],
            labels = [],
            legendInfo = "<h5>Magnitude</h5>";

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }    

        return div;

        };

        
        legend.addTo(myMap);
}

