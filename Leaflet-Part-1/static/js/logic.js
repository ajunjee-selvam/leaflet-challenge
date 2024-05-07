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
    // This function is used to show the magnitude, location, and depth for each associated marker when clicked
    function onEachFeature(feature, layer) {
        // Popup describing the magnitude, location, and depth of the earthquake
        layer.bindPopup(`Magnitude: ${feature.properties.mag} <br> Location: ${feature.properties.place} <br> Depth: ${feature.geometry.coordinates[2]}`);
    }

    // Create a GeoJSON layer containing the specfied features information for each point in the data, and create markers by calling the createMarker function. 
    let earthquakes = L.geoJSON(earthquakeData, {
        // Call the onEachFeature function
        onEachFeature: onEachFeature,
        // Call the createMarker function
        pointToLayer: createMarker
    });

    // Call the createMap function to create the earthquakes overlay map layer
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layer using the street view
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

    // Define a baseMaps object to hold our base layer
    let baseMaps = {
    "Street Map": street
    };

    // Create an overlay object to hold the earthquake overlay layer
    let overlayMaps = {
    Earthquakes: earthquakes
    };

    // Create a map object to store the layers and set the center and zoom
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [street, earthquakes]
    });

    // Create a toggle menu for the different layers
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap); 
    
    // Create a legend object on the bottom right of the map
    let legend = L.control({position: 'bottomright'});

    // Populate the legend with the depth range and corresponding color information, and add it to the map
    legend.onAdd = function (myMap) {
        // Create an object and list to store the depth range information for the legend
        let div = L.DomUtil.create('div', 'info legend'),
            depth = [0, 10, 30, 50, 70, 90],
            labels = [];
        // Create a title for the Depth legend and format it
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
        // Loop through the depth range list. Create a label for each depth range and use the markerColor function to assign the corresponding color. 
        for (let i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depth[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }    

        // Return the created legend
        return div;

        };

        // Add the legend to the map object
        legend.addTo(myMap);
}

