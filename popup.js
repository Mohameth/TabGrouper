document.addEventListener("DOMContentLoaded", () => {
    // Request tab data and display
    browser.runtime.sendMessage({ action: "getTabs" }, response => {
        const groupedTabs = response.groupedTabs;
        const tabList = document.getElementById("tabList");

        for (const domain in groupedTabs) {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = `${domain} (${groupedTabs[domain].length} tabs)`;
            details.appendChild(summary);

            const dropdown = document.createElement("ul");
            groupedTabs[domain].forEach(tab => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = "#";
                a.textContent = tab.title || tab.url;
                a.addEventListener("click", () => {
                    browser.tabs.update(tab.id, { active: true });
                });
                li.appendChild(a);
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