// console.log("init");
window.data = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ? "来自内容脚本：" + sender.tab.url : "来自扩展程序");

  if (request.action == "GETARTICLE") {
    // console.log(window.data);
    sendResponse({ value: window.data });
    window.data=null;
  }
});
