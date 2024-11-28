document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 10,
        maxZoom: 100,
    });

    function addMarker(position, markdownFile) {
        var marker = L.marker(position).addTo(map);

        var popup = L.popup({
            closeButton: false,
            autoClose: false,
            closeOnClick: false
        });

        fetch(markdownFile)
            .then(response => response.text())
            .then(markdown => {
                var htmlContent = marked.parse(markdown);
                popup.setContent(htmlContent);
            })
            .catch(error => {
                console.error('Fehler beim Laden der Markdown-Datei:', error);
                popup.setContent("Fehler beim Laden der Markdown-Datei.");
            });
            
        marker.bindPopup(popup);

        marker.on('mouseover', function (e) {
            this.openPopup();
        });
        marker.on('mouseout', function (e) {
            this.closePopup();
        });

        return marker;
    }

    fetch('data.json')
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
        .catch(error => console.error('Fehler beim Laden der JSON-Daten:', error));
});
