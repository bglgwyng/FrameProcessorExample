/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-reanimated';

import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';

const CameraApp = () => {
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.front;
  const {width, height} = useWindowDimensions();

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
  }, []);

  return device ? (
    <Camera
      device={device}
      style={{width, height}}
      frameProcessor={frameProcessor}
      frameProcessorFps={5}
      isActive
    />
  ) : null;
};

const App = () => {
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>();

  useEffect(() => {
    if (cameraPermission === undefined) {
      Camera.getCameraPermissionStatus().then(setCameraPermission);
    } else {
      Camera.requestCameraPermission().then(setCameraPermission);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!cameraPermission]);

  if (cameraPermission == null) {
    return null;
  }

  const showPermissionsPage = cameraPermission !== 'authorized';

  return showPermissionsPage ? (
    <View>
      <TouchableOpacity>
        <Text />
      </TouchableOpacity>
    </View>
  ) : (
    <CameraApp />
  );
};

export default App;
