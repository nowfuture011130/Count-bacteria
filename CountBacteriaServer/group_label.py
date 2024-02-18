from label_img import label_image
import numpy as np
import cv2
import os
from flask import Flask, request
from flask_restful import Api, Resource
from flask_cors import CORS
import time
from io import BytesIO
import base64
from PIL import Image

INPUT_DIR = "extra_data"
MODEL_DIR = 'models'
LOG_DIR = 'logs'
COVER_CORNERS = False  # for 2, 3, 4
MODEL_NUM = 100
PREDICTION_THRESHOLD = 0.5


class ChangeImage(Resource):
    def post(self):
        try:
            # 检查是否有文件上传
            if 'file' not in request.files:
                return {"error": "No file uploaded"}, 400

            # 获取上传的文件
            uploaded_file = request.files['file']

            # 检查文件是否存在
            if uploaded_file.filename == '':
                return {"error": "No selected file"}, 400

            # 读取上传的图像文件
            image = Image.open(uploaded_file)

            bact_img, all_img, bact_count, noise_count = label_image(
                MODEL_DIR, MODEL_NUM, image, COVER_CORNERS, image_name="image", prediction_threshold=PREDICTION_THRESHOLD)

            print(bact_count)
            print(noise_count)
            print(bact_img)
            print(all_img)

            # 将图像转换为 base64 编码
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

            # 返回 base64 编码的图片数据
            return {"imageData": img_str}

        except Exception as e:
            return {"error": str(e)}, 500
