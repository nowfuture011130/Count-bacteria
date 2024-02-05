import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Modal,
} from 'react-native';
import DeleteIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

import * as RNFS from 'react-native-fs';
const {width, height} = Dimensions.get('window');
const buttonWidth = Dimensions.get('window').width / 3.48;
const ImageBtn = ({
  name,
  url,
  onDelete,
  removeLongPress,
  currentPath,
  onPress,
  multiSelectMode,
  selected,
}) => {
  // 计算宽度为父容器的三分之一
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [metadata, setMetadata] = useState('');
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const startShakeAnimation = () => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: -1, // 无限循环
      },
    );
    animationRef.current.start();
  };

  const handleLongPress = () => {
    if (!multiSelectMode) {
      setIsLongPressed(true);
      startShakeAnimation();
    }
  };

  const handleDelete = () => {
    onDelete(); // onDelete 应处理删除逻辑
    setIsLongPressed(false);
    if (animationRef.current) {
      animationRef.current.stop(); // 正确停止动画
      shakeAnimation.setValue(0); // 重置动画值
    }
  };

  const readMetadata = async pictureName => {
    const name = pictureName.replace('.jpg', '');
    const metadataPath = `${currentPath}/${name}_meta.json`;
    try {
      const metadata = await RNFS.readFile(metadataPath, 'utf8');

      setMetadata(JSON.parse(metadata).description);
    } catch (error) {
      console.error('Error reading metadata:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop(); // 确保动画停止
        shakeAnimation.setValue(0); // 重置动画值
      }
    };
  }, [shakeAnimation]);

  useEffect(() => {
    setIsLongPressed(false);
    if (animationRef.current) {
      animationRef.current.stop(); // 正确停止动画
      shakeAnimation.setValue(0); // 重置动画值
    }
  }, [removeLongPress]);

  useEffect(() => {
    if (modalVisible) {
      readMetadata(name);
    }
  }, [modalVisible]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, {width: buttonWidth, height: buttonWidth}]}
        onLongPress={handleLongPress}
        onPress={() => {
          if (!isLongPressed) {
            if (onPress()) {
              setModalVisible(true);
            }
          }
        }}>
        <Animated.View style={{transform: [{translateX: shakeAnimation}]}}>
          <View style={styles.iconContainer}>
            <Image
              source={{uri: url}}
              style={{
                resizeMode: 'contain',
                width: buttonWidth * 0.7,
                height: buttonWidth * 0.7,
              }}
            />
            <Text style={styles.text}>{name}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      {isLongPressed && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
          <DeleteIcon name="cancel" size={20} color="#FF0000" />
        </TouchableOpacity>
      )}
      {multiSelectMode &&
        (selected ? (
          <Feather
            name="check-circle"
            size={25}
            color="blue"
            style={styles.selectIcon}
          />
        ) : (
          <Feather
            name="circle"
            size={25}
            color="blue"
            style={styles.selectIcon}
          />
        ))}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setModalVisible(!modalVisible)}>
            <FontAwesome name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalText}>{name}</Text>
          <Image
            source={{uri: url}}
            style={{
              resizeMode: 'contain',
              width: width,
              height: height * 0.75,
            }}
          />
          <Text style={styles.descriptionText}>{metadata}</Text>
        </View>
      </Modal>
    </View>
  );
};

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
  iconContainer: {justifyContent: 'center', alignItems: 'center'},
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
  deleteIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalText: {
    marginHorizontal: 60,
    fontSize: 20,
    marginBottom: 15,
  },

  descriptionText: {
    marginTop: 20,
  },
  selectIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 15,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, // 按钮的宽度
    height: 40, // 按钮的高度
    backgroundColor: '#FFF', // 按钮的背景色
    borderRadius: 20, // 使按钮成为圆形
    borderWidth: 1, // 边框宽度
    borderColor: '#000', // 边框颜色
    position: 'absolute',
    top: 47,
    left: 20,
  },
});

export default ImageBtn;
