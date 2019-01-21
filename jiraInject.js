'use strict';

var observeDom = (function () {
    return function(obj, callback) {
        if (!obj) {
            return;
        }

        // define a new observer
        var obs = new MutationObserver(function(mutations, observer) {
            for (let mut of mutations) {
                for (let node of mut.addedNodes) {
                    //console.log(node);
                }
            }
            callback();
        });
        // have the observer observe foo for changes in children
        obs.observe(obj, { childList:true, subtree:true });
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    addCopyControlsToIssuePage();
    
    // Certain actions on the issue page can cause the buttons to go away.
    // So add an observer to the parent control to ensure it's added.
    observeDom(document.getElementById('content'), function () { 
        addCopyControlsToIssuePage();
    });
});

window.addEventListener('load', function () {
    addCopyControlsToBoardPage();

    observeDom(document.getElementById('jira'), function () { 
        addCopyControlsToBoardPage();
    });
});

const copyKeyElementId = 'nx-copy-key';
const copyKeyAndSummaryElementId = 'nx-copy-key-and-summary';

function addCopyControlsToIssuePage() {
    if (document.getElementById(copyKeyElementId)) {
        // Already added
        return;
    }

    //var siblingElement = document.getElementById('opsbar-operations_more');
    var siblingElement = document.getElementById('jira-share-trigger');
    if (siblingElement) {
        addScriptToHeader('document.getElementById("key-val").innerText',
            'document.getElementById("summary-val").innerText');

        siblingElement = siblingElement.parentElement.parentElement;
        siblingElement.insertAdjacentHTML('beforebegin',
            getCopyListElement('Copy Key', 'getKey()', copyKeyElementId) + 
            getCopyListElement('Copy Key + Summary', 'getKeyAndSummary()', copyKeyAndSummaryElementId)
        );

        addCopyEventListeners();
    }
};

function addCopyControlsToBoardPage() {
    if (document.getElementById(copyKeyElementId)) {
        // Already added
        return;
    }

    var url = window.location.href;
    var params = new URLSearchParams(url);
    var selectedKey = params.get('selectedIssue');
    if (selectedKey) {
        var buttons = document.getElementsByClassName('jurdfZ');
        if (buttons.length > 0) {
            addScriptToHeader(`'${selectedKey}'`,
                "document.getElementsByClassName('ghx-summary')[0].innerText");

            var buttonDiv = buttons[buttons.length - 1].parentElement.parentElement;
            buttonDiv.insertAdjacentHTML('afterend', 
                getCopyElementForModal('Copy Key', `'${selectedKey}'`, copyKeyElementId) +
                getCopyElementForModal('Copy Key + Summary', 'getKeyAndSummary()', copyKeyAndSummaryElementId)
            );

            addCopyEventListeners();
        }
    }
};

function addCopyEventListeners() {
    var actualCode = '(' + function() {
            document.getElementById('nx-copy-key').addEventListener('click', () => { copyToClipboard(getKey()) });
            document.getElementById('nx-copy-key-and-summary').addEventListener('click', () => { copyToClipboard(getKeyAndSummary()); });
        } + ')();';

        var script = document.createElement('script');
        script.textContent = actualCode;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
};

function addScriptToHeader(keyText, summaryText) {
    var script = `
        function getKey() {
            return ${keyText};
        }
        
        function getSummary() {
            return ${summaryText};
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

function getCopyListElement(text, textToCopy, elementId) {
    return `
        <ul class="toolbar-group pluggable-ops">
            <li class="toolbar-item toolbar-analytics">
                <a id="${elementId}" class="toolbar-trigger">
                    ${text}
                </a>
            </li>
        </ul>
        `;
}

function getCopyElementForModal(text, textToCopy, elementId) {
    return `
        <div>
            <span class="igMaON">
            <button id="${elementId}" class="jurdfZ" spacing="none" type="button">
                <div style="display: inline-flex; align-items: center; height: 32px; margin-left: 8px; margin-right: 8px">
                    ${text}
                </div>
            </button>
            </span>
        </div>`;
}
