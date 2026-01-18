document.addEventListener("DOMContentLoaded", () => {
    // Request tab data and display
    browser.runtime.sendMessage({ action: "getTabs" }, response => {
        const groupedTabs = response.groupedTabs;
        const tabList = document.getElementById("tabList");

        for (const domain in groupedTabs) {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            
            // Container for summary text and close button
            const summaryContent = document.createElement("span");
            summaryContent.textContent = `${formatDomain(domain)} (${groupedTabs[domain].length} tabs)`;
            summary.appendChild(summaryContent);

            // Close Group Button
            const closeGroupBtn = getTrashBtn("Close all tabs in this group", (e) => {
                e.preventDefault(); // Prevent toggling the details
                e.stopPropagation();

                const tabIds = groupedTabs[domain].map(t => t.id);
                browser.tabs.remove(tabIds).then(() => {
                    details.remove();
                });
            });
            summary.appendChild(closeGroupBtn);

            details.appendChild(summary);

            const dropdown = document.createElement("ul");
            dropdown.classList.add('tab-list');
            groupedTabs[domain].forEach(tab => {
                const li = document.createElement("li");

                // Tab Link
                const a = document.createElement("a");
                a.href = "#";
                a.textContent = tab.title || tab.url;
                a.style.marginRight = "10px";
                a.addEventListener("click", () => {
                    browser.tabs.update(tab.id, { active: true });
                });
                li.appendChild(a);

                // Close Tab Button
                const closeTabBtn = getTrashBtn("Close this tab", () => {
                    browser.tabs.remove(tab.id).then(() => {
                        li.remove();
                        // If no tabs left in group, remove group
                        if (dropdown.children.length === 0) {
                            details.remove();
                        }
                    });
                });
                li.appendChild(closeTabBtn);

                dropdown.appendChild(li);
            });

            details.appendChild(dropdown);
            tabList.appendChild(details);
        }
    });

    // "Group Tabs" button
    const groupButton = document.createElement("button");
    groupButton.textContent = "Group Tabs Now";
    groupButton.addEventListener("click", () => {
        browser.runtime.sendMessage({ action: "groupTabs" }, response => {
            if (response.success) {
                console.log("Tabs grouped successfully!");
            }
        });
    });
    document.body.insertBefore(groupButton, document.getElementById("tabList"));
});

function getTrashBtn(title, callback) {
    const trashBtn = document.createElement("button");

    trashBtn.classList.add('trash-btn');
    trashBtn.textContent = "🗑";
    trashBtn.title = title;
    trashBtn.addEventListener("click", callback);

    return trashBtn;
}

// Format domain names ("addon.mozilla.org" -> "Addon Mozilla")
function formatDomain(domain) {
    try {
        const parts = domain.split('.');
        if (parts.length > 1) {
            parts.pop(); // Remove extension (.com)
        }

        return parts
            .filter(part => part.toLowerCase() !== 'www') // Remove 'www'
            .map(part => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize first letter
            .join(' ');
    } catch (e) {
        return domain;
    }
}