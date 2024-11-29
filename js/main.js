function errorOn404(response) {
    if(!response.ok)
        throw new Error("Failed to load resource. Status: " + response.status);
    return response;
}

function parseMarkdown(markdown, path = "") {
    const renderer = new marked.Renderer();

    function adjustHref(href) {
        if (!/^(https?:\/\/|data:|mailto:|tel:)/i.test(href))
            href = path + '/' + href;
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
        if(html.text)
            html.text = html.text.replace(/(src|href)\s*=\s*"([^"]*)"/g, (_match, attr, value) => `${attr}="${adjustHref(value)}"`);
        return defaultHtmlRenderer.call(this, html);
    };

    return marked.parse(markdown, { renderer: renderer });
}

function loadMap(data) {
    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 5
    });

    const imageBounds = data.imageBounds;
    const maxBounds = data.maxBounds;

    L.imageOverlay(data.map, imageBounds).addTo(map);
    map.fitBounds(imageBounds);

    if(maxBounds) map.setMaxBounds(maxBounds);

    data.marker.forEach(markerData => {
        const position = markerData.position;
        const file = markerData.file;

        var marker = L.marker(position);
        var popup = L.popup({
            closeButton: false,
            autoClose: true,
            closeOnClick: true
        });

        fetch(file)
            .then(response => errorOn404(response))
            .then(response => response.text())
            .then(markdown => {
                var relativPath = file.substring(0, file.lastIndexOf('/'));
                var html = parseMarkdown(markdown, relativPath);
                popup.setContent("<div class=\"markdown\">" + html + "</div>");
            })
            .catch(error => {
                console.error('Failed to load Markdown File.', error);
                popup.setContent("Fehler beim Laden.");
            });

        marker.bindPopup(popup, {maxWidth: 500});
        marker.on('mouseover', function (e) {
            this.openPopup();
        });

        marker.addTo(map);
    });

    return map;
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('res/data.json')
        .then(response => errorOn404(response))
        .then(response => response.json())
        .then(data => loadMap(data))
        .catch(error => {
            console.error("Failed to load map.", error);

            const div = document.getElementById("map");
            div.innerHTML = "<p class = \"failed\">Fehler beim Laden</p>";
        });
    }
);
