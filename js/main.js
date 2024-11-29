function errorOn404(response) {
    if(!response.ok)
        throw new Error("Failed to load resource. Status: " + response.status);
    return response;
}

function parseMarkdown(markdown, path = "") {
    const renderer = new marked.Renderer();

    function adjustHref(href) {
        if (!/^(https?:\/\/|data:|mailto:|tel:)/i.test(href)) {
            href = path + '/' + href;
        }
        return href;
    };

    const defaultImageRenderer = renderer.image;
    renderer.image = function(image) {
        if(image.href)
            image.href = adjustHref(image.href);
        return defaultImageRenderer.call(this, image);
    };
    
    const defaultLinkRenderer = renderer.link;
    renderer.link = function(link) {
        if(link.href)
            link.href = adjustHref(link.href);
        return defaultLinkRenderer.call(this, link);
    }

    const defaultHtmlRenderer = renderer.html;
    renderer.html = function(html) {
        if (html.href)
            html.href = adjustHref(html.href);
        if (html.src)
            html.src = adjustHref(html.src);
        return defaultHtmlRenderer.call(this, html);
    };

    return marked.parse(markdown, { renderer: renderer });
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
                var basePath = file.substring(0, file.lastIndexOf('/'));
                var content = parseMarkdown(markdown, basePath);
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
