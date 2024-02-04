import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import * as RNFS from 'react-native-fs';

function ImageTaker() {
  const selectPhotoTapped = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = response.assets[0].uri;
        saveImage('/Users/haoranwu/Documents/GitHub/Count-bacteria/Cat.jpeg');
      }
    });
  };

  const saveImage = async source => {
    const fileName = source.split('/').pop();
    const newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    try {
      if (Platform.OS === 'android') {
        // For Android: Request external storage write permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Write permission denied');
          return;
        }
      }

      await RNFS.copyFile(source, newPath);
      console.log('Image saved to', newPath);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCamera = () => {
    launchCamera({}, response => {
      console.log(response);
    });
  };
  return (
    <View>
      <TouchableOpacity onPress={selectPhotoTapped}>
        <Text>load a phote</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={loadCamera}>
        <Text>take a photo</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ImageTaker;
