
function onClickHandler(info, tab) {
    console.warn(info);
    let jiraKey = getJiraKeyFromText(info.selectionText);
    if (jiraKey) {
        let url;
        if (info.menuItemId === 'goToJiraIssueOnBoard') {
            url = 'https://nextech.atlassian.net/secure/RapidBoard.jspa?selectedIssue=' + jiraKey;
        }
        else {
            url = 'https://nextech.atlassian.net/browse/' + jiraKey;
        }
        chrome.tabs.create({
            url: url,
            index: tab.index + 1
        });
    }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

function getJiraKeyFromText(text) {
    let projectMatch = /[^A-Z]/i.exec(text);
    if (!projectMatch || projectMatch.index < 2) {
        return null;
    }
    let project = text.substring(0, projectMatch.index).toUpperCase();

    let reversed = reverseString(text);
    let idMatch = /[^0-9]/.exec(reversed);
    if (!idMatch || idMatch.index === 0) {
        return null;
    }
    let id = reverseString(reversed.substring(0, idMatch.index));

    return `${project}-${id}`;
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function isJiraKey(text) {
    let match = /[A-Z]+[\- ][0-9]+/i.exec(text);
    return match ? true : false;
}

var menuItems = [
    {
        id: null,
        options: {
            "title": "Go to Jira issue %s",
            "contexts": ["selection"],
            "id": "goToJiraIssue"
        }
    }/*,
    {
        id: null,
        options: {
            "title": "Go to sprint board for issue %s",
            "contexts": ["selection"],
            "id": "goToJiraIssueOnBoard"
        }
    }*/
];

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.request === 'updateContextMenu') {
        menuItems.forEach((item) => {
            if (isJiraKey(msg.selection)) {
                if (item.id) {
                    chrome.contextMenus.update(item.id, item.options);
                }
                else {
                    item.id = chrome.contextMenus.create(item.options);
                }
            }
            else {
                chrome.contextMenus.remove(item.options);
                item.id = null;
            }
        });
    }
});
