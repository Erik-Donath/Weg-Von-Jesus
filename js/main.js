function errorOn404(response) {
    if(!response.ok) throw new Error("Failed to load Resurce. Status: " + response.status);
    return response;
}

document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3
    });

    function addMarker(position, file) {
        var marker = L.marker(position).addTo(map);

        var popup = L.popup({
            closeButton: true,
            autoClose: true,
            closeOnClick: false,
            offset: L.point(0, 20)
        });

        popup.on('contentloaded', function() {
            popup.getElement().querySelector('img').addEventListener('load', function() {
                popup.update();
            });
        });

        fetch(file)
            .then(response => errorOn404(response))
            .then(response => response.text())
            .then(markdown => {
                var htmlContent = marked.parse(markdown);
                popup.setContent(htmlContent);
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
            var bounds = [data.minBounds, data.maxBounds];
            L.imageOverlay(data.map, bounds).addTo(map);
            map.fitBounds(bounds);
            map.setMaxBounds(bounds);

            data.marker.forEach(markerData => {
                addMarker(markerData.position, markerData.file);
            });
        })
        .catch(error => console.error('Failed to load JSON File: ', error));
});
