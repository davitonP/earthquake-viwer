var map = L.map("map").setView([32.45, -116.9], 10);
// var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map);

let polygonPoints = null;
let layersKml = [];
let layersKmlCache = [];
let layersMaps = [];
let isLayerIn = [];

const areaSelection = new window.leafletAreaSelection.DrawAreaSelection({
    onPolygonReady: (polygon) => {
        polygonPoints = polygon.toGeoJSON(3);
        // console.log(polygonPoints);
        try {
            layersMaps.forEach(layer => {
                map.removeLayer(layer);
            });
        } catch (error) {
            console.log("No hay capas para remover");
        }
        layersMaps = [];

        layersKmlCache = JSON.parse(JSON.stringify(layersKml));

        const parser = new DOMParser();

        for (let i = 0; i < layersKmlCache.length; i++) {
            let layerTrack = parser.parseFromString(layersKmlCache[i]['kml'], 'text/xml');
            let track = searchPlaceMarkersToMap(layerTrack, polygonPoints.geometry.coordinates[0]);
            layersMaps.push(track);
            if (track != null) {
                map.addLayer(track);
                map.fitBounds(track.getBounds());
            } else {
                alert("No hay puntos en el área seleccionada");
            }
        }
    },
    position: "topleft",
});
map.addControl(areaSelection);

function indexOfKmlFileInLayers(fileName) {
    let result = -1;
    layersKml.forEach((layer, index) => {
        if (layer['name'] === fileName) {
            result = index;
        }
    });
    return result;
}


function addKmlLayer(fileName) {
    fetch('public/kml/' + fileName + '.kml')
        .then(response => response.text())
        .then(kmlText => {
            let indexOfLayer = indexOfKmlFileInLayers(fileName);
            if (indexOfLayer !== -1) {
                layersKml.splice(indexOfLayer, 1);
            } else {
                // console.log("Se agrega la capa");
                let kmlObject = {
                    'name': fileName,
                    'kml': kmlText
                };
                layersKml.push(kmlObject);
            }
        });
    document.getElementById(fileName).classList.toggle('selected');
}

function addKmlLayerComplete(fileName){
    // if (isLayerIn.includes(fileName)) {
    //     return
    // }
    // isLayerIn.push(fileName);
    fetch('public/kml/' + fileName + '.kml')
        .then(response => response.text())
        .then(kmlText => {
            const parser = new DOMParser();
            let kml = parser.parseFromString(kmlText, 'text/xml');
            let track = new L.KML(kml);
            if (isLayerIn.includes(fileName)) {
                map.removeLayer(track);
                let ind = isLayerIn.indexOf(fileName);
                isLayerIn.splice(ind,1);
                console.log("lo qito");
            } else {
                isLayerIn.push(fileName);
                map.addLayer(track);
            }
            // isLayerIn.push(fileName);
            // map.addLayer(track);
        });
        // document.getElementById(fileName).classList.toggle('selected');
}

function moveMapTo(lat = 31.8, long = -116, zoom = 12) {
    console.log(lat, long);
    map.setView(new L.LatLng(lat, long), zoom);
}

function sectionNotAvailable() {
    alert("Funcionalidad no disponible");
}

function addPointsToHeatMap(points) {
    var heat = L.heatLayer(points, {
        radius: 40
    }).addTo(map);
}

function showSidebar() {
    document.getElementById('sidebar').style.display = 'block';
}

function hideSidebar() {
    document.getElementById('sidebar').style.display = 'none';
}
