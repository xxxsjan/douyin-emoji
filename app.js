const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");

const filePath = path.resolve(process.cwd(), "dom.txt"); // 替换为实际的文件路径

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("读取文件时发生错误：", err);
    return;
  }
  const html = data; // 替换为你的HTML字符串
  // 使用cheerio加载HTML字符串
  const $ = cheerio.load(html);

  // 通过类选择器获取元素并获取其文本内容
  const images = $(".xCXG6Tpy span img");
  images.each((index, element) => {
    const src = $(element).attr("src");
    const imgPath = imgUrlToPath(src);
    downloadImage(src, imgPath)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  });
});

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      reject(filePath, "文件已存在，无需下载。");
      return;
    }
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject("无法下载图片。状态码:", response.statusCode);
          return;
        }

        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
        
          resolve("图片下载完成。");
        });
      })
      .on("error", (err) => {
        reject("下载图片时发生错误:", err);
      });
  });
}

function imgUrlToPath(url) {
  const imageUrl = new URL(url);

  const imagePath = path.resolve(
    __dirname,
    "./emoji",
    path.basename(imageUrl.pathname) + ".png"
  );
  return imagePath;
}


