from flask import Flask, request
from flask_restful import Api, Resource
from flask_cors import CORS
import time
from io import BytesIO
import base64
from PIL import Image
from label_img import label_image
import numpy as np


app = Flask(__name__)
CORS(app)
api = Api(app)

INPUT_DIR = "extra_data"
MODEL_DIR = 'models'
LOG_DIR = 'logs'
COVER_CORNERS = False  # for 2, 3, 4
MODEL_NUM = 100
PREDICTION_THRESHOLD = 0.5


class HelloWorld(Resource):
    def get(self):
        time.sleep(2)
        return {"data": "Hello World"}


api.add_resource(HelloWorld, "/connect")


class ChangeImage(Resource):
    def post(self):
        try:
            if not request.json:
                return {"error": "Request body is missing or is not JSON"}, 400

            request_data = request.get_json()

            if 'image' not in request_data:
                return {"error": "Missing 'image' key in request body"}, 400

            base64_image_data = request_data['image']
            image_data = base64.b64decode(base64_image_data)
            image = Image.open(BytesIO(image_data))
            print(image)
            image_np = np.array(image)

            bact_img, all_img, bact_count, noise_count = label_image(
                MODEL_DIR, MODEL_NUM, image_np, COVER_CORNERS, image_name="image", prediction_threshold=PREDICTION_THRESHOLD)

            print(bact_count)
            print(noise_count)
            print(bact_img)
            print(all_img)

            img = Image.fromarray(bact_img)

            buffered = BytesIO()
            img.save(buffered, format="PNG")

            bact_img_str = base64.b64encode(
                buffered.getvalue()).decode('utf-8')

            img = Image.fromarray(all_img)

            buffered = BytesIO()
            img.save(buffered, format="PNG")

            all_img_str = base64.b64encode(
                buffered.getvalue()).decode('utf-8')

            return {"bact_count": bact_count, "noise_count": noise_count,  "bact_img": bact_img_str, "all_img": all_img_str}

        except Exception as e:
            return {"error": str(e)}, 500


api.add_resource(ChangeImage, "/change")

if __name__ == "__main__":
    app.run(debug=True)
