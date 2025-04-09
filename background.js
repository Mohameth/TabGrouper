// Group tabs by domain and reorder them
function groupTabsByDomain(tabs) {
    const grouped = {};
    tabs.forEach(tab => {
        try {
            const url = new URL(tab.url);
            const domain = url.hostname;
        if (!grouped[domain]) {
            grouped[domain] = [];
        }
        grouped[domain].push(tab);
        } catch (e) {
            console.error(`Invalid URL for tab ${tab.id}: ${tab.url}`);
        }
    });

    return grouped;
}

async function reorderTabs() {
    const tabs = await browser.tabs.query({});
    const groupedTabs = groupTabsByDomain(tabs);
    const windows = await browser.windows.getAll({ populate: true });
  
    for (const window of windows) {
        const windowTabs = window.tabs;
        let newIndex = 0;
        const tabIdsToMove = [];

        // Flatten grouped tabs into a single array, preserving domain order
        for (const domain in groupedTabs) {
            groupedTabs[domain].forEach(tab => {
                tabIdsToMove.push({ id: tab.id, index: newIndex++ });
            });
        }
    
        // Move tabs to their new positions
        for (const { id, index } of tabIdsToMove) {
            await browser.tabs.move(id, { index });
        }
    }
}

// Handle messages from popup (for display purposes)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getTabs") {
        browser.tabs.query({ currentWindow: true }).then(tabs => {
            const groupedTabs = groupTabsByDomain(tabs);
            sendResponse({ groupedTabs });
        });

        return true;
    } else if (message.action === "groupTabs") {
        reorderTabs().then(() => sendResponse({ success: true }));

        return true;
    }
});

browser.browserAction.onClicked.addListener(() => {
    reorderTabs();
});