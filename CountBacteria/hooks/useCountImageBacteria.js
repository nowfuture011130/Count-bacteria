import React, {useState} from 'react';
import {View, Button, Image} from 'react-native';
import RNFS from 'react-native-fs';

// const BASE = 'https://renderdemo-zxql.onrender.com/';
const BASE = 'http://127.0.0.1:5000/';
const useCountImageBacteria = () => {
  const handleUploadImage = async (
    imgPath,
    imgName,
    currentPath,
    updateMetadata,
    setCounting,
  ) => {
    try {
      setCounting(true);
      await fetch(BASE + 'connect')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => console.log(data));

      console.log('connected to server');

      const imagePath = imgPath;

      // 读取图片文件为 base64 编码字符串
      const base64ImageData = await RNFS.readFile(imagePath, 'base64');

      const response = await fetch(BASE + 'change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({image: base64ImageData}), // 传递 base64 编码的图片数据
      });
      const data = await response.json();
      //   console.log(data);
      console.log(data.bact_count);
      console.log(data.noise_count);
      const newDescription =
        'bact_count:' + data.bact_count + ' noise_count' + data.noise_count;

      imgName = imgName.replaceAll('.jpg', '');
      updateMetadata(imgName, newDescription);
      saveImageToLocal(data.bact_img, imgName + '_bact_img.png', currentPath);
      saveImageToLocal(data.all_img, imgName + '_all_img.png', currentPath);
      setCounting(false);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const saveImageToLocal = async (base64ImageData, fileName, currentPath) => {
    try {
      const filePath = `${currentPath}/${fileName}`;

      // 创建目录
      // 将 base64 编码的图片数据写入文件
      await RNFS.writeFile(filePath, base64ImageData, 'base64');
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return {handleUploadImage};
};

export default useCountImageBacteria;
