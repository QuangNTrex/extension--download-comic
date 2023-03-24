const endChapElement = document.getElementById("end-chapter");
const startChapElement = document.getElementById("start-chapter");
const titleElement = document.getElementById("title");
const speedElement = document.getElementById("speed");
const btnElement = document.getElementById("btn");

// defailt

// defalut

btnElement.addEventListener("click", () => {
  // nhấn vào nút bắt đầu
  (async () => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    const hostname = tab.url.split("//")[1].split("/")[0];
    // nếu hostname không phải nettruyen thì bỏ qua
    if (!(hostname.includes("net") && hostname.includes("truyen"))) return;

    // thiết lập giá trị đầu vào
    let title = titleElement.value;
    let startChapter = Number(startChapElement.value) || 1;
    let endChapter = Number(endChapElement.value) || 10000;
    const speed =
      Number(speedElement.value) < 200 ? 200 : Number(speedElement.value);

    // nếu tiêu đề rỗng thì lấy tiêu đề của trang hiện tại
    if (title === "") {
      let queryOptions = { active: true, lastFocusedWindow: true };
      let [tab] = await chrome.tabs.query(queryOptions);
      titleElement.value = tab.url.split("//")[1].split("/")[2];
      title = titleElement.value;
    }

    // kiểm tra truyện đã tải chưa để nối tiếp lần tải trước
    const data = await chrome.storage.local.get(["objChap"]);

    if (data.objChap[title] !== undefined) {
      startChapter =
        startChapter < data.objChap[title] + 1
          ? data.objChap[title] + 1
          : startChapter;
      startChapElement.value = startChapter;
    }

    // nếu ở web static
    if (hostname.includes("static")) {
      chrome.tabs.sendMessage(tab.id, {
        title,
        speed,
        startChapter,
        endChapter,
        type: "SEND_REQ_DOWNLOAD_IN_STATIC",
        from: "popup",
        to: "background",
        tab,
      });
    }
    // nếu ở web chính
    else if (!hostname.includes("static")) {
      chrome.tabs.sendMessage(tab.id, {
        title,
        startChapter,
        endChapter,
        speed,
        type: "SEND_REQ_DOWNLOAD_IN_MAIN_WEB",
        from: "popup",
        to: "background",
        tab,
      });
    }
  })();
});
