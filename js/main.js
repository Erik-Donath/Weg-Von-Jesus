function errorOn404(response) {
    if(!response.ok)
        throw new Error("Failed to load resource. Status: " + response.status);
    return response;
}

document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 5
    });

    function addMarker(position, file) {
        var marker = L.marker(position).addTo(map);

        var popup = L.popup({
            closeButton: false,
            autoClose: true,
            closeOnClick: true,
            offset: L.point(0, 20)
        });
        
        fetch(file)
            .then(response => errorOn404(response))
            .then(response => response.text())
            .then(markdown => {
                var content = marked.parse(markdown);
                popup.setContent("<div class=\"markdown\">" + content + "</div>");
            })
            .catch(error => {
                console.error('Failed to load Markdown File: ', error);
                popup.setContent("Fehler beim Laden.");
            });
            
        marker.bindPopup(popup, {maxWidth: 500});

        marker.on('mouseover', function (e) {
            this.openPopup();
        });

        return marker;
    }

    fetch('res/data.json')
        .then(response => errorOn404(response))
        .then(response => response.json())
        .then(data => {
            var imageBounds = data.imageBounds;
            var maxBounds = data.maxBounds;
            L.imageOverlay(data.map, imageBounds).addTo(map);
            map.fitBounds(imageBounds);

            if(maxBounds) map.setMaxBounds(maxBounds);

            data.marker.forEach(markerData => {
                addMarker(markerData.position, markerData.file);
            });
            //console.log("Config:\n" + JSON.stringify(data, null, 2));
        })
        .catch(error => {
            console.error('Failed to load JSON File: ', error);
            alert("Fehler beim Laden der Hauptdatei.");
        });
});
