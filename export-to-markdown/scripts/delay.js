(function() {
  console.log("insert script => delay.js");
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

      flag=true
      setInterval(()=>{
        if(find(".selected").href.includes("xitu/gold-miner/issues")){    
          if(flag){
            flag=false;
            this.getNotIssue();
          }
        }else{
          flag=true
        }
      },1000)

    },
    getNotIssue() {
      const query = {
        query: `
        query {
          repository(owner: "xitu", name: "gold-miner") {
            issues(last: 100,states:OPEN, labels: "正在翻译") {
              ...theIssue
            }
          }
        }
        
        fragment theIssue on IssueConnection {
          nodes {
            number
            body
            labels(last:10){
               nodes{
                name
              }
            }
            comments(last:100){
              nodes{
                body
                createdAt
                author{login}
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
          const issues=res.data.repository.issues.nodes
          .map(issue => {
            
            const ed=issue.comments.nodes.reverse().find(co=>{
              return (co.author.login==="fanyijihua")&&
              co.body.includes("棒极啦 :tada:")
            })
           

            return {
              id:issue.number,
              delay:ed&&(new Date().getTime()-new Date(ed.createdAt).getTime())/(1000*60*60*24),
              days:Number(issue.body.match(/(翻译时间：[ ]*)(\d+)([ ]*天)/)&&issue.body.match(/(翻译时间：[ ]*)(\d+)([ ]*天)/)[2])||10
            }
            
          }).filter(i=>i.delay>i.days)
          
          console.log(1,issues)
          issues.forEach(i=>{

            var newNode = document.createElement("span");
            newNode.innerHTML=`
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 476 512">
            <title></title>
            <g id="icomoon-ignore">
            </g>
            <path fill="red" d="M317.459 395.716l-13.141 13.141c-3.425 3.425-9.144 3.425-12.854 0l-53.714-54-53.714 54c-3.712 3.425-9.428 3.425-12.854 0l-13.141-13.141c-3.425-3.425-3.425-9.144 0-12.854l54.001-53.714-54-53.714c-3.425-3.712-3.425-9.428 0-12.854l13.141-13.141c3.425-3.425 9.144-3.425 12.854 0l53.714 53.713 53.714-53.714c3.712-3.425 9.428-3.425 12.854 0l13.141 13.141c3.425 3.425 3.425 9.144 0 12.854l-53.714 53.714 53.714 53.714c3.425 3.712 3.425 9.428 0 12.854zM36.602 475.428h402.291v-292.574h-402.291v292.574zM146.316 127.997v-82.288c0-5.139-3.999-9.144-9.144-9.144h-18.286c-5.141 0-9.144 3.999-9.144 9.144v82.288c0 5.14 3.999 9.144 9.144 9.144h18.286c5.139 0 9.144-3.999 9.144-9.144zM365.747 127.997v-82.288c0-5.139-3.999-9.144-9.144-9.144h-18.286c-5.139 0-9.144 3.999-9.144 9.144v82.288c0 5.14 3.999 9.144 9.144 9.144h18.286c5.139 0 9.144-3.999 9.144-9.144zM475.466 109.711v365.718c0 20.001-16.571 36.57-36.57 36.57h-402.291c-20.001 0-36.571-16.571-36.571-36.57v-365.718c0-20.001 16.571-36.571 36.571-36.571h36.571v-27.428c0-25.139 20.568-45.712 45.713-45.712h18.286c25.139 0 45.713 20.568 45.713 45.712v27.428h109.715v-27.428c0-25.139 20.568-45.712 45.712-45.712h18.286c25.139 0 45.712 20.568 45.712 45.712v27.428h36.57c20.001 0 36.57 16.571 36.57 36.571z"></path>
            </svg>
            `+(i.delay-i.days).toFixed(2)+"天</span>";
            newNode.style.color="red"
            newNode.style.paddingLeft="5px"
            newNode.style.paddingRight="5px"

            find("#issue_"+i.id+"_link")&&find("#issue_"+i.id+"_link").prepend(newNode)
          })


          console.log(issues)

        });
    }
  };
  Page.init();
})();
