import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome';

import FolderBtn from './components/FolderBtn';
import AddFolderBtn from './components/AddFolderBtn';
import ImageBtn from './components/ImageBtn';
import useCountImageBacteria from './hooks/useCountImageBacteria';
// import CountImageBacteria from './components/CountImageBacteria';
function App(): React.JSX.Element {
  const [currentPath, setCurrentPath] = useState(RNFS.DocumentDirectoryPath);
  const [folderContents, setFolderContents] = useState([]);
  const [updateFolder, setUpdateFolder] = useState(true);
  const [rootFolderName, setRootFolderName] = useState('');
  const [removeLongPress, setRemoveLongPress] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [counting, setCounting] = useState(false);
  const {handleUploadImage} = useCountImageBacteria();

  const createFolder = async (fName: any) => {
    const folderPath = `${currentPath}/${fName}`;
    try {
      await RNFS.mkdir(folderPath);
      console.log('Folder created');
      setUpdateFolder(true);
    } catch (error) {
      Alert.alert(error.toString(), error);
    }
  };

  const listFilesInDirectory = async (path: string) => {
    try {
      const files = await RNFS.readDir(path);
      files.forEach(file => {
        console.log(file.name);
      });
      setFolderContents(files);
    } catch (error) {
      Alert.alert(error.toString(), error);
    }
  };

  const enterFolder = (folder: any) => {
    setCurrentPath(`${currentPath}/${folder}`);

    setUpdateFolder(true);
  };

  const exitFolder = () => {
    const newPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setCurrentPath(newPath);
    setMultiSelectMode(false);
    setSelectedFiles(new Set());
    setUpdateFolder(true);
  };

  const deleteFolder = async (folder: string) => {
    try {
      await RNFS.unlink(`${currentPath}/${folder}`);
      setUpdateFolder(true);
      console.log('Folder deleted successfully');
    } catch (error) {
      Alert.alert(error.toString(), error);
    }
  };

  const deleteMetaFolder = async (folder: string) => {
    try {
      const name = folder.replace('.jpg', '');
      await RNFS.unlink(`${currentPath}/${name}_meta.json`);
      const exists = await RNFS.exists(`${currentPath}/${name}_bact_img.png`);
      if (exists) {
        await RNFS.unlink(`${currentPath}/${name}_bact_img.png`);
        await RNFS.unlink(`${currentPath}/${name}_all_img.png`);
      }
      setUpdateFolder(true);
      console.log('Meta Folder deleted successfully');
    } catch (error) {
      Alert.alert(error.toString(), error);
    }
  };

  const updateCurrentFoldername = (path: string) => {
    const pathSegments = path.split('/');
    const name = pathSegments[pathSegments.length - 1] || 'Documents';
    setRootFolderName(name);
  };

  const toggleSelection = fileName => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileName)) {
      newSelection.delete(fileName);
    } else {
      newSelection.add(fileName);
    }
    setSelectedFiles(newSelection);
  };

  const updateMetadata = async (pictureName, newDescription) => {
    const metadataPath = `${currentPath}/${pictureName}_meta.json`;
    try {
      // 步骤1: 读取现有的JSON文件
      const existingMetadataJson = await RNFS.readFile(metadataPath, 'utf8');

      // 步骤2: 解析JSON内容
      const existingMetadata = JSON.parse(existingMetadataJson);

      // 步骤3: 更新描述
      existingMetadata.description = newDescription;

      // 步骤4: 将更新后的对象写回文件
      const updatedMetadataJson = JSON.stringify(existingMetadata);
      await RNFS.writeFile(metadataPath, updatedMetadataJson, 'utf8');

      console.log('Metadata updated for', pictureName);
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  };

  const deleteSelectedFiles = async () => {
    try {
      for (let fileName of selectedFiles) {
        if (fileName.endsWith('.jpg')) {
          await deleteFolder(fileName);
          await deleteMetaFolder(fileName);
        } else {
          await deleteFolder(fileName);
        }
      }
      // 更新UI或状态
      setMultiSelectMode(false);
      setSelectedFiles(new Set()); // 清空选择
      // 重新加载或更新folderContents状态
    } catch (error) {
      console.error('delete file error:', error);
    }
    // 适当更新状态和UI
    setMultiSelectMode(!multiSelectMode);
    setSelectedFiles(new Set());
  };

  const outputSelectedFiles = async () => {
    try {
      for (let fileName of selectedFiles) {
        if (fileName.endsWith('.jpg')) {
          const path = `${currentPath}/${fileName}`;
          console.log('所选文件名称：', fileName);
          await handleUploadImage(
            path,
            fileName,
            currentPath,
            updateMetadata,
            setCounting,
          );
        }
      }
      // 更新UI或状态
      setMultiSelectMode(false);
      setSelectedFiles(new Set()); // 清空选择
      // 重新加载或更新folderContents状态
    } catch (error) {
      console.error('delete file error:', error);
    }

    console.log('所选文件名称：', Array.from(selectedFiles).join(', '));
    // 可以在此处进行更多操作，如显示所选文件名的弹窗等
    setMultiSelectMode(!multiSelectMode);
    setSelectedFiles(new Set());
  };

  useEffect(() => {
    if (updateFolder) {
      listFilesInDirectory(currentPath);
      updateCurrentFoldername(currentPath);
      setUpdateFolder(false);
    }
  }, [updateFolder]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setRemoveLongPress(!removeLongPress);
      }}>
      <View style={{flex: 1}}>
        {counting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="black" />
          </View>
        )}
        {multiSelectMode && (
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={deleteSelectedFiles}>
              <Text style={styles.toolbarButtonText}>
                Delete selected files
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={outputSelectedFiles}>
              <Text style={styles.toolbarButtonText}>
                Output selected files
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{height: 50, backgroundColor: '#f0f0f0'}}></View>
        <View style={styles.header}>
          <Text style={styles.rootFolderName}>{rootFolderName}</Text>
          <TouchableOpacity
            onPress={() => {
              setMultiSelectMode(!multiSelectMode);
              setSelectedFiles(new Set());
            }}>
            <Text
              style={{
                fontSize: 18,
                color: 'blue',
                fontWeight: 'bold',
                position: 'absolute',
                right: 10,
              }}>
              {multiSelectMode ? `Cancel Select` : `Select`}
            </Text>
          </TouchableOpacity>
          {rootFolderName === 'Documents' ? (
            <></>
          ) : (
            <TouchableOpacity onPress={exitFolder} style={styles.backButton}>
              <Icon name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView contentContainerStyle={{paddingBottom: 170}}>
          <View style={styles.folderContainer}>
            {folderContents
              .sort((a, b) => {
                return new Date(a.ctime) - new Date(b.ctime);
              })
              .map((file: any, index) => {
                if (file.isDirectory()) {
                  return (
                    <FolderBtn
                      key={index}
                      name={file.name}
                      onPress={() => {
                        if (multiSelectMode) {
                          toggleSelection(file.name); // 选择或取消选择
                        } else {
                          enterFolder(file.name); // 常规操作
                        }
                      }}
                      onDelete={() => {
                        deleteFolder(file.name);
                      }}
                      removeLongPress={removeLongPress}
                      multiSelectMode={multiSelectMode}
                      selected={selectedFiles.has(file.name)}
                    />
                  );
                }
              })}
            {folderContents
              .sort((a, b) => {
                return new Date(a.ctime) - new Date(b.ctime);
              })
              .map((file: any, index) => {
                if (file.name.endsWith('.jpg')) {
                  return (
                    <ImageBtn
                      key={index}
                      name={file.name}
                      url={file.path}
                      onDelete={() => {
                        deleteFolder(file.name);
                        deleteMetaFolder(file.name);
                      }}
                      removeLongPress={removeLongPress}
                      currentPath={currentPath}
                      multiSelectMode={multiSelectMode}
                      selected={selectedFiles.has(file.name)}
                      onPress={() => {
                        if (multiSelectMode) {
                          toggleSelection(file.name); // 选择或取消选择
                          return false;
                        } else {
                          return true; // 常规操作
                        }
                      }}
                    />
                  );
                }
              })}
            <AddFolderBtn
              folderName={
                folderContents.filter(file => !file.name.endsWith('.json'))
                  .length
              }
              createFile={createFolder}
              currentPath={currentPath}
              setUpdateFolder={setUpdateFolder}
            />
          </View>
        </ScrollView>
        {/* <CountImageBacteria /> */}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  rootFolderName: {
    fontWeight: 'bold',
    fontSize: 18,
    padding: 10,
    paddingHorizontal: 40,
    textAlign: 'center',
    flex: 1,
  },
  folderContainer: {
    flexDirection: 'row', // 水平排列子组件
    flexWrap: 'wrap', // 超出行的子组件移到下一行
    justifyContent: 'flex-start', // 从行的起始端开始排列子组件
    alignItems: 'flex-start', // 从列的起始端开始排列子组件
    padding: 10, // 容器内边距
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
    left: 10,
  },
  backButtonText: {
    fontSize: 18,
  },
  header: {
    flexDirection: 'row', // 水平排列子项
    alignItems: 'center', // 垂直居中
    justifyContent: 'space-between', // 在主轴方向上平均分配子元素
    padding: 10, // 或根据需要调整
    backgroundColor: '#f0f0f0',
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: 'lightgray',
    padding: 40,
    zIndex: 1,
  },
  toolbarButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  toolbarButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // 半透明白色背景
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});
export default App;
