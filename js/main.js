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

function addCoordControl(map, position) {
    let coordControl = L.control({position: position});

    coordControl.onAdd = function(_map) {
        let div = L.DomUtil.create('div', 'info coordinates');
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        div.style.padding = '6px 8px';
        div.style.border = 'none';
        div.style.borderRadius = '4px';
        div.style.margin = '10px';
        div.style.fontFamily = 'Arial';
        div.style.fontSize = '12px';
        return div;
    }
    coordControl.addTo(map);
    map.on('mousemove', function(e) {
        let lat = e.latlng.lat.toFixed(4);
        let lng = e.latlng.lng.toFixed(4);
        document.querySelector('.coordinates').innerHTML = `Koordinaten: ${lat}, ${lng}`;
    });

    return coordControl;
}

function loadMap(data) {
    console.log(data);

    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 5
    });

    const maxBounds = data.maxBounds;
    const fitBounds = data.fitBounds;
    if(maxBounds) map.setMaxBounds(maxBounds);
    if(fitBounds) map.fitBounds(fitBounds);

    data.maps.forEach(mapData => {
        L.imageOverlay(mapData.file, mapData.bounds).addTo(map);
    })

    data.marker.forEach(markerData => {
        const position = markerData.position;
        const file = markerData.file;

        //console.log(file, position);

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

    addCoordControl(map, 'bottomright')

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
