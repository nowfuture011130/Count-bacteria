# Count Bacteria
The target users of this software are students and professors in food safety and biology. The software allows users to easily view the number of bacteria in a photo taken under a microscope and highlights potentially bacterial areas with red circles. The software interface mimics a mobile folder system, making it easy to manage photo information. Additionally, the software supports taking photos with a mobile phone, requiring only a phone microscope attachment to be placed in front of the camera to use.
# Features
For backend:
1) Extract bacteria from the image based on color differences, filtering out bacteria with strange shapes or those that are too large.
2) Train a simple CNN on the extracted bacteria to distinguish between bacteria and residue.
3) Finally, draw the bacteria on the input image. Residue will be marked in blue, while bacteria will be marked in red.
4) Use Flask to create API, allowing communication with the frontend through HTTP requests.

For frontend:
1) Develop the interface display using React Native and manage files using fs.
2) Allow users to create folders and photos, as well as batch delete photos and search for bacteria in photos.
3) Create animations for deleting and searching photos to provide users with visual feedback on the progress of bacterial counting.

# How to use
To install dependencies, please refer to the `package-lock.json` file in the `CountBacteria` directory for React Native dependencies and the `requirements.txt` file in the `CountBacteriaServer` directory for server dependencies.

Additionally, ensure you have React Native and Xcode installed on your computer.

To start the server, navigate to the `CountBacteriaServer` directory and run `python __init__.py`.

To launch the app, navigate to the `CountBacteria` directory and run `npm start`.

Choose the iOS system to run the software.
