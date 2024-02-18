BASE = "https://renderdemo-zxql.onrender.com/";
const filePath =
  "/Users/haoranwu/Documents/GitHub/renderdemo/extra_data/E.coli + 1.bmp";

const countImageBacteria = async () => {
  await fetch(BASE + "connect")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) =>
      console.error(
        "There has been a problem with your fetch operation:",
        error
      )
    );

  console.log("connected to server");

  // await fetch(filePath)
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     return response.blob();
  //   })
  //   .then((blob) => {
  //     // 创建一个 FormData 对象
  //     const formData = new FormData();
  //     // 将文件添加到 FormData 对象中
  //     formData.append("file", blob, "1.bmp");
  //     // 发起 POST 请求上传文件到服务器上的 /change 端点
  //     return fetch(BASE + "change", {
  //       method: "POST",
  //       body: formData,
  //     });
  //   })
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     return response.blob(); // 获取服务器返回的二进制数据
  //   })
  //   .then((blob) => {
  //     // 创建一个 URL 对象，用于生成上传图片的预览
  //     const formData = new FormData();
  //     formData.append("file", blob);

  //     // 发起 POST 请求下载文件到本地
  //     return fetch(BASE + "download", {
  //       method: "POST",
  //       body: formData,
  //     });
  //   })
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     console.log("File saved successfully!");
  //   })
  //   .catch((error) => {
  //     console.error(
  //       "There has been a problem with your fetch operation:",
  //       error
  //     );
  //   });
};
countImageBacteria();
