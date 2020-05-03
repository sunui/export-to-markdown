(function() {
  console.log("insert script => github.js");
  const find = function(selector) {
    return document.querySelector(selector);
  };
  const sendMessage = chrome.runtime.sendMessage;
  const onMessage = chrome.runtime.onMessage;

  const loginButton = find("input[name=commit]");

  const Page = {
    bindEvent: function() {
      onMessage.addListener(function(req, sender, sendResponse) {
        if (req.action === "LOGIN") {
          loginButton.click();
          sendResponse("Success.");
        }
      });
    },
    init: function() {
      this.bindEvent();
      sendMessage(
        {
          action: "GETARTICLE"
        },
        function(r) {
          console.log(1, r);
          if (r.value) {
            const filePath = r.value.split("\n");
            const line = filePath.find(l => l.indexOf("本文永久链接") > -1);
            console.log(line);
            const title = line.substring(
              line.indexOf("TODO1/") + 6,
              line.indexOf(".md") + 3
            );
            console.log(2, title);
            document.querySelector(".js-blob-filename").value = title || "";
          }
        }
      );
    }
  };

  Page.init();
})();
