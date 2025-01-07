import $ from 'jquery';
import { $DOM, $root } from './global';


$(function () {
    resizer();
    keyZoom();
});


function resizer() {
    let $target = null
    $('resizer').each(function (idx, elem) {
        const $resizer = $(elem);
        $target = $(`:not(resizer)[data-resize="${$resizer.data('resize')}"]`);

        $resizer.on('mousedown', function () {
            // isResizing = true;
            $root.css('cursor', 'ew-resize');

            $DOM.on('mousemove', startResize);
            $DOM.on('mouseup', stopResize);
        });

        $resizer.on('dblclick', resetResize);
    });

    function startResize(evt) {
        // if (isResizing) {
        const newWidth = evt.clientX - 48;
        const [minWidth, maxWidth] = [200, 400];

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            $target.css('width', `${newWidth}px`);
        }
        // }
    }

    function stopResize() {
        // isResizing = false;
        $root.css('cursor', '');

        $DOM.off('mousemove', startResize);
        $DOM.off('mouseup', stopResize);
    }

    function resetResize() {
        $target.css('width', '');
    }
}

function keyZoom() {

    // window.api.webFrame.setZoomLevel(0);
    // window.api.webFrame.setZoomFactor(1);

    $DOM.on('wheel', (evt) => {
        // Check if the CTRL key is pressed (indicating a pinch-to-zoom gesture on touchpad)
        if (evt.originalEvent.ctrlKey) {
            const deltaY = evt.originalEvent.deltaY;

            if (deltaY < 0) {
                // Zoom in
                window.api.webFrame.setZoomLevel(window.api.webFrame.getZoomLevel() + 0.1);
            } else if (deltaY > 0) {
                // Zoom out
                window.api.webFrame.setZoomLevel(window.api.webFrame.getZoomLevel() - 0.1);
            }
        }
        console.log('Zoom Level:', window.api.webFrame.getZoomLevel());
        console.log('Zoom Factor:', window.api.webFrame.getZoomFactor());
    });

    $DOM.on('keydown', (evt) => {
        if (evt.ctrlKey && evt.key === '+') {
            // Zoom in
            window.api.webFrame.setZoomLevel(window.api.webFrame.getZoomLevel() + 0.5);
        }

        // Zoom out
        if (evt.ctrlKey && evt.key === '-') {
            window.api.webFrame.setZoomLevel(window.api.webFrame.getZoomLevel() - 0.5);
        }

        // Reset zoom
        if (evt.ctrlKey && evt.key === '0') {
            window.api.webFrame.setZoomLevel(0);
            window.api.webFrame.setZoomFactor(1);
        }
        console.log('Zoom Level:', window.api.webFrame.getZoomLevel());
        console.log('Zoom Factor:', window.api.webFrame.getZoomFactor());
    });

}