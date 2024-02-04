import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo'; // 使用 Material Icons
import DeleteIcon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const width = Dimensions.get('window').width / 3.48;
const FolderBtn = ({
  name,
  onPress,
  onDelete,
  removeLongPress,
  multiSelectMode,
  selected,
}) => {
  // 计算宽度为父容器的三分之一
  const [isLongPressed, setIsLongPressed] = useState(false);
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

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, {width: width, height: width}]}
        onLongPress={handleLongPress}
        onPress={() => {
          if (!isLongPressed) {
            onPress();
          }
        }}>
        <Animated.View style={{transform: [{translateX: shakeAnimation}]}}>
          <View style={styles.iconContainer}>
            <Icon name="folder" size={width * 0.5} color="#FCC419" />
          </View>
          <Text style={styles.text}>{name}</Text>
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
  iconContainer: {
    marginBottom: 10, // 图标和文本之间的距离
  },
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
  selectIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 15,
  },
});

export default FolderBtn;
