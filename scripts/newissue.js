(function() {
  console.log("insert script => newissues.js");
  const find = function(selector) {
    return document.querySelector(selector);
  };
  const sendMessage = chrome.runtime.sendMessage;
  const onMessage = chrome.runtime.onMessage;


  const Page = {
    init: function() {
      var newNode = document.createElement("div");
      newNode.innerHTML = ` 
<div class="discussion-sidebar-item js-discussion-sidebar-item">
  <div class="text-bold mb-2">未发布文章</div>
  <ul id="newissues" class="list-style-none">
  </ul>
</div>
`;
      find(".col-md-3").prepend(newNode);
      this.getNotIssue();
    },
    getNotIssue() {
      const query = {
        query: `
        {
          repository(owner: "xitu", name: "gold-miner") {
            pullRequests(states: MERGED,last: 20) {
              nodes {
                mergedAt
                title
                files(last: 1) {
                  nodes {
                    path
                  }
                }
              }
            }
            issues(last:100,labels:["正在翻译","翻译完成","正在校对","翻译认领"]){
              nodes{
                title
                body
                createdAt
                labels(first:10){
                  nodes{
                    name
                  }
                }
              }
            }
          }
        }
        
        `
      };

      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          // 个人token 没有操作权限 不要滥用
          Authorization: "Bearer 545c28023ff1317b390c66b3d0b476233301de1c",
          "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(query)
      })
        .then(res => res.json())
        .catch(error => console.error("Error:", error))
        .then(res => {
          const notIssues=res.data.repository.pullRequests.nodes
          .filter(p => {
            return /^(C|c)reate.+.md$/.test(p.title);
          })
          .filter(p => {
            return !res.data.repository.issues.nodes.some(i => {
              return i.body.includes(p.files.nodes[0].path);
            });
          })
          .map(p=>{
            return p.files.nodes[0].path
          })

          Promise.all(notIssues.map(path=>{
            const raw="https://raw.githubusercontent.com/xitu/gold-miner/master/"+path;
            const fullpath="https://github.com/xitu/gold-miner/blob/master/"+path
            return fetch(raw)
          })).then(a=>{
           a.map(r=>{
              return r.text().then(r=>{
                const texts=r.split("\n")
                const ob={
                  title:texts[0].match(/(?<=\[).+(?=\])/)[0],
                  body:`
* 原文链接：${texts[0].match(/\[.+\)/)[0]}
* Markdown文件：[文件地址]${texts[3].match(/(?<=\])\(.+\)/)[0]}
* PR 地址：
* 文章分类：** **
* **注意：文件位置在 \`TODO1\` 文件夹中，不是之前的 \`TODO\` 了。**
----
* 翻译时间： 天
* 校对时间： 天
* 翻译积分： 分
* 校对积分： 分
* [积分有什么用](https://github.com/xitu/gold-miner/wiki)`
                }
                const aa = document.createElement("a");
                const li = document.createElement("li");
                aa.innerHTML=ob.title
                aa.href="https://github.com/xitu/gold-miner/issues/new?labels=翻译认领&assignees=leviding&title="+encodeURIComponent(ob.title)+"&body="+encodeURIComponent(ob.body)
                find("#newissues").appendChild(li).appendChild(aa)
                console.log(ob)
              })
            })
          })

          

        });
    }
  };
  Page.init();
})();
