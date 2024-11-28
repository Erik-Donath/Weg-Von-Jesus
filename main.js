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
        closeButton: false,
        autoClose: false
    }).setContent("Dies ist ein interessanter Punkt auf der Karte!");

    marker.on('mouseover', function (e) {
        this.openPopup();
    });
    marker.on('mouseout', function (e) {
        this.closePopup();
    });

    marker.bindPopup(popup);
});