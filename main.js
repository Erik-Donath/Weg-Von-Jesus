document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3
    });

    var bounds = [[0,0], [1000,1000]];
    L.imageOverlay('karte.png', bounds).addTo(map);
    map.fitBounds(bounds);

    var marker = L.marker([500, 500]).addTo(map);
    var popup = L.popup({
        closeButton: true,
        autoClose: false
    });
    //.setContent("Dies ist ein interessanter Punkt auf der Karte!");

    fetch('README.md')
        .then(response => response.text())
        .then(markdown => {
            var html = marked.parse(markdown);
            marker.bindPopup(html, {maxWidth: 500});
        })
        .catch(error => console.error('Fehler beim Laden der Markdown-Datei:', error));

    marker.on('mouseover', function (e) {
        this.openPopup();
    });
    marker.on('mouseout', function (e) {
        this.closePopup();
    });

    marker.bindPopup(popup);
});