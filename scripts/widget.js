let mainDiv = document.querySelector(".main");
const loadIcon = document.querySelector(".load");
const sourceDiv = document.querySelector("#source");
const copyBtn = document.querySelector(".copy");
const createBtn = document.querySelector(".create");
const rightAreaDiv = document.querySelector(".right-area");
const MEDIUM_IMG_CDN = "https://cdn-images-1.medium.com/max/";

var bg = chrome.extension.getBackgroundPage();
window.onload = function() {
  if (sourceDiv.style.display === "none") {
    sourceDiv.style.display = null;
  }
  createLoadForm();
  loadIcon.style.visibility = "visible";
  exportMedium();
};

copyBtn.addEventListener("click", function() {
  copyBtn.innerText = "已复制";
  const value = document.querySelector("#source").value;
  copyToClipboard(value);
  setTimeout(function() {
    copyBtn.innerText = "复制";
  }, 2000);
});

createBtn.addEventListener("click", function() {
  const value = document.querySelector("#source").value;
  copyToClipboard(value);
  bg.data = value;

  window.open("https://github.com/xitu/gold-miner/new/master/TODO1");
});

function createLoadForm() {
  let shadow = document.createElement("div");
  shadow.id = "shadow";
  const oHeight = document.documentElement.scrollHeight;
  shadow.style.height = oHeight + "px";
  mainDiv.appendChild(shadow);
}

function cancelLoad() {
  const len = mainDiv.childNodes.length;
  mainDiv.removeChild(mainDiv.childNodes[len - 1]);
  loadIcon.style.visibility = "hidden";
}

function exportMedium() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(
    arrayOfTabs
  ) {
    const activeTab = arrayOfTabs[0];
    const url = activeTab.url + "?format=json";
    fetch(url)
      .then(function(res) {
        if (res.ok) {
          return res.text();
        } else {
          console.error(
            "The fetch fails, and the response code is " + res.status
          );
        }
      })
      .then(function(res) {
        let markdownText = "";
        let title = "";
        var isHtml = false;
        try {
          const str = res.substring(16, res.length);
          const temp = JSON.parse(str);
        } catch {
          isHtml = true;
        }

        if (isHtml) {
          fetch(activeTab.url)
            .then(r => r.text())
            .then(res => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(res, "text/html");
              var blog =
                doc.querySelector("main") ||
                doc.querySelector(".main") ||
                doc.querySelector("#main") ||
                doc.querySelector("#content") ||
                doc.querySelector("body");

              console.log(activeTab.url, blog);
              const turndownService = new TurndownService();
              markdownText = turndownService.turndown(blog);
              document.querySelector("#source").value = markdownText;
            })
            .catch(function(err) {
              console.error(err);
              markdownText =
                "网站" + activeTab.url + " 可能还不支持\n错误信息:" + err;
              document.querySelector("#source").value = markdownText;
              cancelLoad();
            });
          cancelLoad();
        } else {
          const story = parseJsonToMarkdown(res);
          title = story.title;
          slug = story.slug;
          markdownText = `> * 原文地址：[${title}](${activeTab.url})
> * 原文作者：[${story.author.name}](${story.author.url})
> * 译文出自：[掘金翻译计划](https://github.com/xitu/gold-miner)
> * 本文永久链接：[https://github.com/xitu/gold-miner/blob/master/TODO1/${slug}.md](https://github.com/xitu/gold-miner/blob/master/TODO1/${slug}.md)
> * 译者：
> * 校对者：

# ${title}
${story.markdown.join("")}
> 如果发现译文存在错误或其他需要改进的地方，欢迎到 [掘金翻译计划](https://github.com/xitu/gold-miner) 对译文进行修改并 PR，也可获得相应奖励积分。文章开头的 **本文永久链接** 即为本文在 GitHub 上的 MarkDown 链接。

---

> [掘金翻译计划](https://github.com/xitu/gold-miner) 是一个翻译优质互联网技术文章的社区，文章来源为 [掘金](https://juejin.im) 上的英文分享文章。内容覆盖 [Android](https://github.com/xitu/gold-miner#android)、[iOS](https://github.com/xitu/gold-miner#ios)、[前端](https://github.com/xitu/gold-miner#前端)、[后端](https://github.com/xitu/gold-miner#后端)、[区块链](https://github.com/xitu/gold-miner#区块链)、[产品](https://github.com/xitu/gold-miner#产品)、[设计](https://github.com/xitu/gold-miner#设计)、[人工智能](https://github.com/xitu/gold-miner#人工智能)等领域，想要查看更多优质译文请持续关注 [掘金翻译计划](https://github.com/xitu/gold-miner)、[官方微博](http://weibo.com/juejinfanyi)、[知乎专栏](https://zhuanlan.zhihu.com/juejinfanyi)。`;
          document.querySelector("#source").value = markdownText;
        }
        cancelLoad();
      })
      .catch(function(err) {
        console.error(err);
        markdownText =
          "网站" + activeTab.url + " 可能还不支持\n错误信息:" + err;
        document.querySelector("#source").value = markdownText;
        cancelLoad();
      });
  });
}

function parseJsonToMarkdown(jsonStr) {
  // cut the useless string to format json string
  const str = jsonStr.substring(16, jsonStr.length);
  const data = JSON.parse(str);
  let article = null;
  if (!data.payload) {
    return null;
  }
  article = data.payload.value || data.payload.post;
  let story = {};
  story.title = article.title;
  story.subtile = article.content.subtitle;
  story.date = new Date(article.createdAt);
  story.url = article.canonicalUrl;
  story.language = article.detectedLanguage;
  story.license = article.license;
  story.sections = article.content.bodyModel.sections;
  story.paragraphs = article.content.bodyModel.paragraphs;
  story.slug = article.slug;
  var author = Object.values(data.payload.references.User)[0];
  story.author = {
    name: author.name || "",
    url: `https://medium.com/@${author.username}`
  };

  const paragraphs = story.paragraphs.filter((p, i) => {
    // console.log(p.text,article.title)
    return !(
      (i == 0 || i == 1) &&
      p.text.replace(/(\s)/g, "") === article.title.replace(/(\s)/g, "")
    );
  });

  let sections = [];
  for (let i = 0; i < story.sections.length; i++) {
    const s = story.sections[i];
    let section = processSection(s);
    if (i === 0) {
      section = "";
    }
    sections[s.startIndex] = section;
  }

  story.markdown = [];

  let sequence = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    if (sections[i]) {
      story.markdown.push(sections[i]);
    }
    const p = paragraphs[i];
    if (p.type === 10) {
      sequence++;
    } else {
      sequence = 0;
    }
    const text = processParagraph(
      p,
      sequence,
      i > 0 ? paragraphs[i - 1].type : 0,
      i < paragraphs.length - 1 ? paragraphs[i + 1].type : 0
    );
    lastPtype = p.type;
    if (text !== story.markdown[i]) {
      story.markdown.push(text);
    }
  }
  console.log(story);
  return story;
}

function processSection(s) {
  let section = "\n***\n";
  if (s.backgroundImage) {
    const imageWidth = parseInt(s.backgroundImage.originalWidth, 10);
    const imageSrc =
      MEDIUM_IMG_CDN +
      Math.max(imageWidth * 2, 2000) +
      "/" +
      s.backgroundImage.id;
    section = "\n![](" + imageSrc + ")";
  }
  return section;
}

function processParagraph(p, sequence, preType, nextType) {
  const markups_array = createMarkupsArray(p.markups, p.type);
  if (markups_array.length > 0) {
    let previousIndex = 0,
      text = p.text,
      tokens = [];
    let j = 0;
    for (; j < markups_array.length; j++) {
      if (markups_array[j]) {
        token = text.substring(previousIndex, j);
        previousIndex = j;
        tokens.push(token);
        tokens.push(markups_array[j]);
      }
    }

    tokens = processMarkupSpace(tokens);
    tokens.push(text.substring(j - 1));
    p.text = tokens.join("");
  }

  let markup = "";
  switch (p.type) {
    case 1:
      markup = "\n";
      break;
    case 2:
      p.text = "\n# " + p.text.replace(/\n/g, "\n# ");
      break;
    case 3:
      p.text = "\n## " + p.text.replace(/\n/g, "\n## ");
      break;
    case 4:
      const imageWidth = parseInt(p.metadata.originalWidth, 10);
      const imageSrc =
        MEDIUM_IMG_CDN + Math.max(imageWidth * 2, 2000) + "/" + p.metadata.id;
      p.text = "\n![" + p.text + "](" + imageSrc + ")";
      break;
    case 6:
      markup = "> ";
      break;
    case 7:
      p.text = "> # " + p.text.replace(/\n/g, "\n> # ");
      break;
    case 8:
      p.text =
        (preType === 8 ? "\n" : "\n```\n") +
        p.text.replace(/\n/g, "\n") +
        (nextType === 8 ? "" : "\n```");
      break;
    case 9:
      markup = "\n* ";
      break;
    case 10:
      markup = "\n " + sequence + ". ";
      break;
    case 11:
      p.text = "";
      break;
    case 13:
      markup = "\n### ";
      break;
    case 15:
      p.text = "*" + p.text + "*";
      break;
  }

  if (p.text[0] === "⦁") {
    p.text = "-" + (p.text[1] === " " ? "" : " ") + p.text.substring(1);
  }
  p.text = markup + p.text + "\n";

  // 除了代码块之外的小于号避免被md作为标签处理
  if (p.type !== 8) {
    p.text = p.text.replace(/</g, "\\<");
  }

  if (p.alignment === 2 && p.type !== 6 && p.type !== 7) {
    p.text = "<center>" + p.text + "</center>";
  }
  return p.text;
}

// for the first position is space
function processMarkupSpace(tokens) {
  let times = 0; // ** times
  for (let i = 0; i < tokens.length; i++) {
    const ele = tokens[i];
    if (ele.indexOf("**") > -1) {
      times = times + 1;
      // 奇数后的空格
      if (times % 2 === 1 && tokens[i + 1] && tokens[i + 1][0] === " ") {
        tokens[i + 1] = tokens[i + 1].substring(1);
        tokens[i - 1] = tokens[i - 1] + " ";
        i = i + 1;
      }
      // 偶数前的空格
      if (
        times % 2 === 0 &&
        tokens[i - 1] &&
        tokens[i - 1][tokens[i - 1].length - 1] === " "
      ) {
        tokens[i - 1] = tokens[i - 1].substring(0, tokens[i - 1].length - 1);
        tokens[i + 1] = " " + tokens[i + 1];
        i = i + 1;
      }
    }

    if (ele === "[" && tokens[i + 1] && tokens[i + 1][0] === " ") {
      tokens[i + 1] = tokens[i + 1].substring(1);
      tokens[i - 1] = tokens[i - 1] + " ";
      i = i + 1;
    }
    if (
      ele === "]" &&
      tokens[i - 1] &&
      tokens[i - 1][tokens[i - 1].length - 1] === " "
    ) {
      tokens[i - 1] = tokens[i - 1].substring(0, tokens[i - 1].length - 1);
      tokens[i + 1] = " " + tokens[i + 1];
      i = i + 1;
    }
  }
  return tokens;
}

function addMarkup(markups_array, open, close, start, end) {
  if (markups_array[start]) {
    markups_array[start] = markups_array[start] + open;
  } else {
    markups_array[start] = open;
  }
  if (markups_array[end]) {
    markups_array[end] = close + markups_array[end];
  } else {
    markups_array[end] = close;
  }
  return markups_array;
}

function createMarkupsArray(markups, pType) {
  let markups_array = [];
  if (!markups || markups.length === 0 || pType === 8) {
    return markups_array;
  }
  //标题一律取消加粗
  if (pType === 2 || pType === 3 || pType === 13) {
    markups = markups.filter(m => !(m.type == 1 || m.type));
  }
  markups = markups.sort((a, b) => b.end - b.start - (a.end - a.start));

  for (let i = 0; i < markups.length; i++) {
    const m = markups[i];
    switch (m.type) {
      case 1: // bold
        addMarkup(markups_array, "**", "**", m.start, m.end);
        break;
      case 2: // italic
        addMarkup(markups_array, "**", "**", m.start, m.end);
        break;
      case 3: // anchor tag
        addMarkup(markups_array, "[", "](" + m.href + ")", m.start, m.end);
        break;
      case 10: // code tag
        if (m.end - m.start < 30) {
          addMarkup(markups_array, "`", "`", m.start, m.end);
        }
        break;
      default:
        console.log("Unknown markup type" + m.type, m);
        break;
    }
  }
  return markups_array;
}

function copyToClipboard(input) {
  const el = document.createElement("textarea");
  el.style.fontsize = "12pt";
  el.style.border = "0";
  el.style.padding = "0";
  el.style.margin = "0";
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.setAttribute("readonly", "");
  el.value = input;

  document.body.appendChild(el);
  el.select();

  let success = false;
  try {
    success = document.execCommand("copy", true);
  } catch (err) {}

  document.body.removeChild(el);

  return success;
}
