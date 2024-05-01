/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup().addTo(map)
}

// Hintergrundlayer
L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://sonny.4lima.de">Sonny</a>, <a href="https://www.eea.europa.eu/en/datahub/datahubitem-view/d08852bc-7b5f-4835-a776-08362e2fbf4b">EU-DEM</a>, <a href="https://lawinen.report/">avalanche.report</a>, all licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// GeoJSON der Wetterstationen laden
async function showStations(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            var markerIcon = L.icon({
                iconUrl: 'icons/wifi.png',
                iconSize: [25, 25],
                iconAnchor: [12, 12],
                popupAnchor: [0, -15]
            });

            return L.marker(latlng, { icon: markerIcon });
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                let name = feature.properties.name;
                let altitude = feature.geometry.coordinates[2];
                let temp = feature.properties.LT ? feature.properties.LT.toFixed(1) : '--';
                let humidity = feature.properties.RH ? feature.properties.RH.toFixed(1) : '--';
                let windSpeed = feature.properties.WG ? feature.properties.WG.toFixed(1) : '--';
                let snowHeight = feature.properties.HS ? feature.properties.HS.toFixed(1) : '--';
                let date = feature.properties.date ? new Date(feature.properties.date).toLocaleString() : '--';

                let popupContent = `
            <div class="p-4 bg-white rounded-lg shadow-lg">
                <h4 class="text-xl font-semibold mb-2">${name} <span class="text-sm text-gray-500">(${altitude}m)</span></h4>
                <div class="text-gray-800">
                    <p><i class="fas fa-thermometer-half"></i> Lufttemperatur: ${temp}°C</p>
                    <p><i class="fas fa-tint"></i> Relative Luftfeuchte: ${humidity}%</p>
                    <p><i class="fas fa-wind"></i> Windgeschwindigkeit: ${windSpeed} km/h</p>
                    <p><i class="fas fa-snowflake"></i> Schneehöhe: ${snowHeight} cm</p>
                    <p><i class="fas fa-calendar-alt"></i> ${date}</p>
                </div>
            </div>
        `;
                layer.bindPopup(popupContent);
            }
        }
    }).addTo(map);
}

showStations("https://static.avalanche.report/weather_stations/stations.geojson");
