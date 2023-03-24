chrome.runtime.onMessage.addListener((request, sender, sendRes) => {
  if (request.to === "background") {
    switch (request.type) {
      case "REQUEST_DOWNLOAD_IN_MAIN_WEB_TO_STATIC_WEB": {
        chrome.tabs.query(
          { url: "https://static.nettruyenco.vn/*" },
          (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: actionDownloadFn,
              args: [
                request.title,
                request.startChapter,
                request.endChapter,
                request.speed,
              ],
            });
          }
        );
        break;
      }
    }
  }
});

const actionDownloadFn = (nameUrl, startChapter, endChapter, speed) => {
  // ================================ variable
  const baseUrl = `https://static.nettruyenco.vn/cdn/`;
  const methodUrl = ".jpg";
  const starting = Date.now();

  let chapter = startChapter;

  let timeout = 2000;
  let lagTimer = speed || 300;
  let arrLastestImg = [0];

  let img;
  let chaptest = endChapter,
    serialest = 1000;
  let totalImage = 0;

  // ================================ variable

  // hàm dùng để hẹn giờ chạy hàm cb
  const asyncFunction = (chapter, serial, cb) => {
    timeout = timeout + lagTimer;
    setTimeout(() => {
      cb(chapter, serial);
    }, timeout);
  };

  // hàm dùng để lưu lịch sử tải truyện
  const saveInfoToLocal = (nameUrl, chaptest) => {
    let objChap = {};
    const key = "objChap";
    chrome.storage.local.get([key], (data) => {
      if (data) objChap = { ...data.objChap };
      objChap[nameUrl] = chaptest;

      chrome.storage.local.set({ [key]: objChap }, () => {});
    });
  };

  // hàm sẽ kiểm tra url có tồn tại ảnh hay không
  async function checkUrl(url) {
    return new Promise((resolve, reject) => {
      img = new Image();
      img.onload = function () {
        resolve(true);
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = url;
    });
  }

  // hàm trả về số ảnh tối đa của một chap truyện
  async function checkLastestImg(chapter) {
    let left = 0,
      right = 1000;
    while (right - left > 1) {
      let m = Math.floor((left + right) / 2);
      if (await checkUrl(baseUrl + nameUrl + `/${chapter}/${m}` + methodUrl))
        left = m;
      else right = m;
    }
    return left;
  }

  (async () => {
    let latestOfChapter = await checkLastestImg(chapter);
    while (latestOfChapter !== 0 && chapter <= endChapter) {
      // cấu hình cho các array mang thông tin của các lần tải
      totalImage += latestOfChapter;
      arrLastestImg.push(latestOfChapter);

      chaptest = chapter;
      serialest = latestOfChapter;
      chapter++;
      latestOfChapter = await checkLastestImg(chapter);
    }
    console.clear();
    console.log(
      "times to prepare to download: ",
      Math.floor(Date.now() - starting) / 1000 / 60,
      "minutes"
    );
    console.log(
      "download completion time:",
      ((totalImage * lagTimer) / 1000 / 60).toFixed(2),
      "minutes"
    );
    console.log(
      `find out ${
        chaptest - startChapter + 1 > 0 ? chaptest - startChapter + 1 : 0
      } chap, (${
        chaptest - startChapter + 1 > 0
          ? `from ${startChapter} to ${chaptest}`
          : ""
      }), ${totalImage} images, processing download...`
    );

    // console.log(startChapter, endChapter);
    for (chapter = startChapter; chapter <= endChapter; chapter++) {
      for (let i = 1; i <= arrLastestImg[chapter]; i++) {
        asyncFunction(chapter, i, (chapter, serial) => {
          // hàm thực thi tải
          let url = baseUrl + nameUrl + `/${chapter}/${serial}` + methodUrl;
          let a = document.createElement("a");
          a.href = url;
          a.download = nameUrl + "_" + chapter + "_" + serial + methodUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // các phần xuất ra
          if (arrLastestImg[chapter] === serial) {
            console.log(`downloaded chapter: ${chapter} with ${serial} images`);
          }

          if (chapter === chaptest && serial === serialest) {
            saveInfoToLocal(nameUrl, chapter);
            console.log(
              "<=====================================================================================================>"
            );
            console.log(
              `total image is ${totalImage}, time to downloaded all is ${
                (Date.now() - starting) / 1000 / 60
              } minutes`
            );
          }
        });
      }
    }
  })();
};
