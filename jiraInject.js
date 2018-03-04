'use strict';

var observeDom = (function () {
    return function(obj, callback) {
        // define a new observer
        var obs = new MutationObserver(function(mutations, observer) {
            callback();
        });
        // have the observer observe foo for changes in children
        obs.observe(obj, { childList:true, subtree:true });
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    observeDom(document.getElementById('stalker'), function () { 
        addCopyControls();
    });
});

function addCopyControls() {
    var copyKeyElementId = 'nx-copy-key';
    if (document.getElementById(copyKeyElementId)) {
        // Already added
        return;
    }

    var siblingElement = document.getElementById('opsbar-operations_more');
    if (siblingElement) {
        addScriptToHeader();

        siblingElement = siblingElement.parentElement.parentElement;
        siblingElement.insertAdjacentHTML('afterend',
            getCopyElement('Copy Key', 'getKey()', copyKeyElementId) + 
            getCopyElement('Copy Key + Summary', 'getKeyAndSummary()', 'nx-copy-key-and-summary')
        );

        return;
    }

    var url = window.location.href;
    var params = new URLSearchParams(url);
    var selectedKey = params.get('selectedIssue');
    if (selectedKey) {
    }
};

function addScriptToHeader() {
    var script = `
        function getKey() {
            return document.getElementById('key-val').innerText;
        }
        
        function getSummary() {
            return document.getElementById('summary-val').innerText;
        }
        
        function getKeyAndSummary() {
            return getKey() + ' - ' + getSummary();
        }
        
        function copyToClipboard(text) {
            const input = document.createElement('textarea');
            input.style.position = 'fixed';
            input.style.opacity = 0;
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('Copy');
            document.body.removeChild(input);
        }
    `;
    var scriptElement = document.createElement('script');
    scriptElement.text = script;
    var headElement = document.head.appendChild(scriptElement);
}

function getCopyElement(text, textToCopy, elementId) {
    return `
        <ul class="toolbar-group pluggable-ops" id="${elementId}">
            <li class="toolbar-item toolbar-analytics">
                <a onclick="copyToClipboard(${textToCopy});" class="toolbar-trigger">
                    ${text}
                </a>
            </li>
        </ul>
        `;
}
