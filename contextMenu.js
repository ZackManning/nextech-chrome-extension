// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The onClicked callback function.
function onClickHandler(info, tab) {
    let jiraKey = getJiraKeyFromText(info.selectionText);
    if (jiraKey) {
        let url = 'https://nextech.atlassian.net/browse/' + jiraKey;
        chrome.tabs.create({
            url: url,
            index: tab.index + 1
        });
    }
};

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

chrome.contextMenus.onClicked.addListener(onClickHandler);

var jiraMenuId = null;
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.request === 'updateContextMenu') {
        if (isJiraKey(msg.selection)) {
            let options = {
                "title": "Go to Jira issue %s",
                "contexts": ["selection"],
                "id": "goToJiraIssue"
            };
            if (jiraMenuId != null) {
                chrome.contextMenus.update(jiraMenuId, options);
            }
            else {
                jiraMenuId = chrome.contextMenus.create(options);
            }
        }
        else {
            if (jiraMenuId != null) {
                chrome.contextMenus.remove(jiraMenuId);
                jiraMenuId = null;
            }
        }
    }
});
