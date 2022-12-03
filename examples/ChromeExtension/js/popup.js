const settingsButton = document.querySelector(".settings-page");
if (settingsButton) {
  settingsButton.addEventListener("click", (e) => {
    const url = chrome.runtime.getURL("/html/settings.html");
    chrome.tabs.create({ url });
    window.close();
  });
}

const helpButton = document.querySelector(".help-page");
if (helpButton) {
  helpButton.addEventListener("click", (e) => {
    const url = chrome.runtime.getURL("/html/hello.html");
    chrome.tabs.create({ url });
    window.close();
  });
}

const clockCheckbox = document.querySelector(".clock-ckeckbox");

chrome.storage.sync.get(["showClock"], (result) => {
  clockCheckbox.checked = result.showClock;
  if (result.showClock) {
    chrome.action.setBadgeText({ text: "ON" });
  }
});

if (clockCheckbox) {
  clockCheckbox.addEventListener("click", async (e) => {
    const checked = e.target.checked;
    console.log(checked);
    chrome.action.setBadgeText({ text: checked ? "ON" : "" });
    //chrome.alarms.create({delayInMinutes: minutes});
    chrome.storage.sync.set({ showClock: checked });
  });
}

const inputColor = document.querySelector(".input-color");
const buttonColor = document.querySelector(".color-button");

if (buttonColor) {
  buttonColor.addEventListener("click", async (e) => {
    const background = inputColor.value;
    chrome.tabs.update({}, async (tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (color) => {
          const body = document.querySelector("body");
          let hasBackupStyle = body.hasAttribute("backup-style");
          let hasStyle = body.hasAttribute("style");
          let style = body.getAttribute("style");
          let backupStyle = body.getAttribute("backup-style");
          if (!hasBackupStyle) {
            if (hasStyle) {
              body.setAttribute("backup-style", style);
            } else {
              body.setAttribute("backup-style", "");
            }
          }

          if (color.trim() === "") {
            backupStyle = body.getAttribute("backup-style");
            if (backupStyle) {
              body.setAttribute("style", backupStyle);
            } else {
              body.removeAttribute("style");
            }
          } else {
            if (backupStyle) {
              body.setAttribute("style", `${backupStyle}; background-color: ${color} !important;`);
            } else {
              body.setAttribute("style", `background-color: ${color} !important;`);
            }
          }
        },
        args: [background],
      });
    });
  });
}

const inputAlert = document.querySelector(".input-alert");
const buttonAlert = document.querySelector(".alert-button");

console.log(buttonAlert);

if (buttonAlert) {
  buttonAlert.addEventListener("click", async (e) => {
    console.log("click");
    const minutes = parseFloat(inputAlert.value);
    chrome.storage.sync.set({ timer: minutes });
    chrome.alarms.create({ delayInMinutes: minutes });
    window.close();
  });

  chrome.storage.sync.get(["timer"], (result) => {
    inputAlert.value = result.timer || 1;
  });
}
