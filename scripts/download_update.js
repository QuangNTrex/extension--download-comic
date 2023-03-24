const baseUrl = `https://static.nettruyenco.vn/cdn/`;
const nameUrl = "su-tro-lai-cua-vi-than-suc-manh";
const methodUrl = ".jpg";
const starting = Date.now();

let chapter = 1;

let isStopped = false;
let timeout = 2000;
let startTimeToCheckImg = 0;
let lagTimer = 300;
let arrLastestImg = [0];

let img;
let chaptest = 1000,
  serialest = 1000;
let totalImage = 0;

const asyncFunction = (chapter, serial, cb) => {
  timeout = timeout + lagTimer;
  setTimeout(() => {
    cb(chapter, serial);
  }, timeout);
};

async function checkUrl(url) {
  startTimeToCheckImg = Date.now();
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

async function checkLastestImg(chapter) {
  let left = 0,
    right = 1000,
    m;
  while (right - left > 1) {
    m = Math.floor((left + right) / 2);
    if (await checkUrl(baseUrl + nameUrl + `/${chapter}/${m}` + methodUrl))
      left = m;
    else right = m;
  }

  return left;
}

(async () => {
  let latestOfChapter = await checkLastestImg(chapter);
  while (latestOfChapter !== 0) {
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
  console.log(`find out ${chaptest} chap, processing download...`);

  for (chapter = 1; chapter <= chaptest; chapter++) {
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
