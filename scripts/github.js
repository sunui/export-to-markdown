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
          if (r.value) {
          }
        }
      );
    }
  };

  Page.init();
})();
