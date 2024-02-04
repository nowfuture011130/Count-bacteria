import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import * as RNFS from 'react-native-fs';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const {width, height} = Dimensions.get('window');
const buttonWidth = Dimensions.get('window').width / 3.48;
function AddFolderBtn({folderName, createFile, currentPath, setUpdateFolder}) {
  folderName = (folderName + 1).toString();
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [fName, setFName] = useState(folderName);
  const [pictureName, setPictureName] = useState(folderName);

  useEffect(() => {
    setFName(folderName);
    setPictureName(folderName);
  }, [folderName]);

  useEffect(() => {
    hideModal();
  }, []);

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const createFileClick = () => {
    createFile(fName);
    setFName('');
    hideModal();
  };

  const selectPhotoTapped = async pictureName => {
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
        saveImage(source.replace('file://', ''), pictureName);
        // saveImage('/Users/haoranwu/Documents/GitHub/Count-bacteria/Cat.jpeg');
      }
    });
  };

  const saveImage = async (source, pictureName) => {
    const newPath = `${currentPath}/${pictureName}.jpg`;
    try {
      await RNFS.copyFile(source, newPath);
      console.log('Image saved to', newPath);
      saveMetadata(pictureName, 'example description:' + pictureName);
      setUpdateFolder(true);
      hideModal();
    } catch (error) {
      Alert.alert(error.toString(), error);
    }
  };

  const saveMetadata = async (pictureName, description) => {
    const metadataPath = `${currentPath}/${pictureName}_meta.json`;
    try {
      const metadata = JSON.stringify({description});
      await RNFS.writeFile(metadataPath, metadata, 'utf8');
      console.log('Metadata saved for', pictureName);
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, {width: buttonWidth, height: buttonWidth}]}
        onPress={showModal}>
        <View>
          <Ionicons name="add" size={buttonWidth} color="black" />
        </View>
      </TouchableOpacity>
      {hideModal && (
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={hideModal}>
          <TouchableWithoutFeedback onPress={hideModal}>
            <Animated.View
              style={[
                styles.overlay,
                {
                  opacity: fadeAnim,
                },
              ]}>
              <BlurView
                style={styles.absolute}
                blurType="dark" // "dark", "light", "extraDark" 等选项，根据需要选择
                blurAmount={10} // 模糊强度
                reducedTransparencyFallbackColor="white">
                <View style={styles.modalView}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={hideModal}>
                    <MaterialIcons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => createFileClick()}
                    style={styles.greenButton}>
                    <LinearGradient
                      colors={['#56ab2f', '#a8e063']}
                      style={styles.optionButton}>
                      <Text style={styles.text}>Create folder with name:</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Folder Name"
                        onChangeText={setFName}
                        value={fName}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => selectPhotoTapped(pictureName)}
                    style={styles.greenButton}>
                    <LinearGradient
                      colors={['#56ab2f', '#a8e063']}
                      style={styles.optionButton}>
                      <Text style={{...styles.text}}>
                        Load a phote with name:
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Picture Name"
                        onChangeText={setPictureName}
                        value={pictureName}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => createFileClick()}
                    style={styles.greenButton}>
                    <LinearGradient
                      colors={['#56ab2f', '#a8e063']}
                      style={styles.optionButton}>
                      <Text style={styles.text}>Option 3</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Folder Name"
                        onChangeText={setFName}
                        value={fName}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#FFF',
    elevation: 3, // Android 阴影效果
    shadowColor: '#000', // iOS 阴影效果
    shadowOffset: {width: 0, height: 2}, // iOS 阴影偏移
    shadowOpacity: 0.25, // iOS 阴影不透明度
    shadowRadius: 3.84, // iOS 阴影半径
    borderRadius: 10, // 圆角
  },
  text: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  optionButton: {
    borderRadius: 20,
    elevation: 2,
    padding: 10,
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  absolute: {
    position: 'absolute',
    width: width,
    height: height,
  },

  textInput: {
    borderWidth: 1,
    borderColor: 'white', // Input border color
    borderRadius: 5, // Input border radius
    padding: 5,
    marginLeft: 5,
    height: 40, // Specify the height of the input
    flex: 1, // Take up remaining space
    color: 'white',
    fontWeight: 'bold',
  },
  greenButton: {
    width: '100%',
    height: 60,

    marginVertical: 5,
  },
});

export default AddFolderBtn;
