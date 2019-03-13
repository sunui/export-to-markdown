(function() {
  console.log("insert script => wiki.js");
  const find = function(selector) {
    return document.querySelector(selector);
  };
  const sendMessage = chrome.runtime.sendMessage;
  const onMessage = chrome.runtime.onMessage;

  const loginButton = find("input[name=commit]");

  const Page = {
    bindEvent: function() {},
    init: function() {
      this.bindEvent();
      const data = {
        variables: JSON.stringify({
          number_of_issues: 80,
          issue_order: { field: "CREATED_AT", direction: "ASC" }
        }),
        query: `query ($number_of_issues: Int!, $issue_order: IssueOrder!) {
        repository(owner: "xitu", name: "gold-miner") {
          fe: issues(last: $number_of_issues, labels: "前端", orderBy: $issue_order) {
            ...theIssue
          }
          be: issues(last: $number_of_issues, labels: "后端", orderBy: $issue_order) {
            ...theIssue
          }
          android: issues(last: $number_of_issues, labels: "Android", orderBy: $issue_order) {
            ...theIssue
          }
          ios: issues(last: $number_of_issues, labels: "iOS", orderBy: $issue_order) {
            ...theIssue
          }
          ai: issues(last: $number_of_issues, labels: "AI", orderBy: $issue_order) {
            ...theIssue
          }
          design: issues(last: $number_of_issues, labels: "设计", orderBy: $issue_order) {
            ...theIssue
          }
          product: issues(last: $number_of_issues, labels: "产品", orderBy: $issue_order) {
            ...theIssue
          }
          google: issues(last: $number_of_issues, labels: "Google", orderBy: $issue_order) {
            ...theIssue
          }
          chain: issues(last: $number_of_issues, labels: "区块链", orderBy: $issue_order) {
            ...theIssue
          }
          algorithm: issues(last: $number_of_issues, labels: "算法", orderBy: $issue_order) {
            ...theIssue
          }
          other: issues(last: $number_of_issues, labels: "其他", orderBy: $issue_order) {
            ...theIssue
          }
        }
      }
      fragment theIssue on IssueConnection {
        nodes {
          createdAt
        }
      }`
      };
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          // 个人token 没有操作权限 不要滥用
          Authorization: "Bearer 545c28023ff1317b390c66b3d0b476233301de1c",
          "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .catch(error => console.error("Error:", error))
        .then(response => {
          const analysis = [];
          Object.keys(response.data.repository).forEach(t => {
            let tmap = {
              fe: "前端",
              be: "后端",
              android: "Android",
              ios: "iOS",
              ai: "AI",
              design: "设计",
              product: "产品",
              google: "Google",
              chain: "区块链",
              algorithm: "算法",
              other: "其他"
            };
            analysis.push({
              key: tmap[t] || "t",
              week: response.data.repository[t].nodes.filter(d => {
                return (
                  new Date(d.createdAt).getTime() >
                  new Date().getTime() - 24 * 60 * 60 * 1000 * 7
                );
              }).length,
              month: response.data.repository[t].nodes.filter(d => {
                return (
                  new Date(d.createdAt).getTime() >
                  new Date().getTime() - 24 * 60 * 60 * 1000 * 30
                );
              }).length
            });
          });
          console.table(analysis);
          var newNode = document.createElement("div");
          newNode.style.position = "absolute";
          newNode.style.top = "240px";
          newNode.style.left = "10px";
          newNode.style.width = "160px";

          newNode.innerHTML =
            `
<div class="js-navigation-container js-active-navigation-container">
  <div class="Box-row Box-row--focus-gray p-0 js-navigation-item js-issue-row selectable read border-bottom">
  <div class="border d-table table-fixed width-full Box-row--drag-hide position-relative">
  <div class="float-left col-6">板块</div>
  <div class="float-left col-3">本周</div>
  <div class="float-right col-3">本月</div></div>` +
            analysis
              .map(line => {
                return `
       <div class="border-top border-left border-right d-table table-fixed width-full Box-row--drag-hide position-relative">
       <div class="float-left col-6">
       ${line.key}
       </div>
       <div class="float-left col-3">
       ${line.week}
       </div>
       <div class="float-right col-3">
       ${line.month}
       </div> </div>`;
              })
              .join("") +
            `</div></div>`;
          find("body").appendChild(newNode);
        });
    }
  };

  Page.init();
})();
