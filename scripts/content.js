// nghe sự kiện download
chrome.runtime.onMessage.addListener((req, sender, funcRes) => {
  const tab = req.tab;
  if (req.type === "SEND_REQ_DOWNLOAD_IN_STATIC") {
    // nếu tải được thực hiện ở một trang hình ảnh của nettruyen
    chrome.runtime
      .sendMessage({
        type: "REQUEST_DOWNLOAD_IN_MAIN_WEB_TO_STATIC_WEB",
        from: "content",
        to: "background",
        title: req.title,
        speed: req.speed,
        startChapter: req.startChapter,
        endChapter: req.endChapter,
      })
      .then();
  } else if (req.type === "SEND_REQ_DOWNLOAD_IN_MAIN_WEB") {
    // nếu tải được thực hiện ở trang chính của nettruyen
    let url =
      "https://static.nettruyenco.vn/cdn/day-hu-do-de-phan-dien-roi-phai-lam-sao-day/1/1.jpg";
    let a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    chrome.runtime
      .sendMessage({
        type: "REQUEST_DOWNLOAD_IN_MAIN_WEB_TO_STATIC_WEB",
        from: "content",
        to: "background",
        title: req.title,
        speed: req.speed,
        startChapter: req.startChapter,
        endChapter: req.endChapter,
      })
      .then();
  }
});
