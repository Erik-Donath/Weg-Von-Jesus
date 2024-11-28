document.addEventListener('DOMContentLoaded', function() {
    // Karte initialisieren
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3
    });

    // Bildgrenzen definieren
    var bounds = [[0,0], [1000,1000]];

    // Benutzerdefiniertes Kartenbild hinzufügen
    L.imageOverlay('/res/karte.png', bounds).addTo(map);

    // Kartenansicht auf die Bildgrenzen setzen
    map.fitBounds(bounds);

    // Marker hinzufügen
    var marker = L.marker([500, 500]).addTo(map);

    // Popup mit Beschreibung erstellen
    var popup = L.popup({
        closeButton: false,
        autoClose: false
    })
    .setContent("Dies ist ein interessanter Punkt auf der Karte!");

    // Hover-Ereignisse für den Marker
    marker.on('mouseover', function (e) {
        this.openPopup();
    });
    marker.on('mouseout', function (e) {
        this.closePopup();
    });

    // Popup an den Marker binden
    marker.bindPopup(popup);
});