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

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  Frame,
  useCameraDevices,
  useCameraFormat,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanFaces, Face} from 'vision-camera-face-detector';
import {runOnJS} from 'react-native-reanimated';
import adjustToView, {type Dimensions} from './adjustToView';
import {rotationDegrees} from './rotationDegrees';

const styles = StyleSheet.create({
  boundingBox: {
    position: 'absolute',
    borderColor: '#fff',
    borderWidth: 1,
  },
});

const CameraApp = () => {
  const devices = useCameraDevices('wide-angle-camera');
  const direction: 'front' | 'back' = 'front';
  const device = devices[direction];

  const format = useCameraFormat();

  const {width, height} = useWindowDimensions();

  const [frameDimensions, setFrameDimensions] = useState<Dimensions>();
  const [faces, setFaces] = useState<Face[]>([]);

  const handleScan = useCallback(
    (frame: Frame, rotationDegrees$: number, newFaces: Face[]) => {
      const isRotated = rotationDegrees$ === 90 || rotationDegrees$ === 270;
      setFrameDimensions(
        isRotated
          ? {
              width: frame.height,
              height: frame.width,
            }
          : {
              width: frame.width,
              height: frame.height,
            },
      );
      setFaces(newFaces);
    },
    [],
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      runOnJS(handleScan)(frame, rotationDegrees(frame), scanFaces(frame));
    },
    [handleScan],
  );

  const style = useMemo<StyleProp<ViewStyle>>(
    () => ({position: 'absolute', top: 0, left: 0, width, height}),
    [width, height],
  );

  return device ? (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        device={device}
        format={format}
        style={style}
        frameProcessor={frameProcessor}
        frameProcessorFps={30}
        isActive
      />
      <View style={style}>
        {frameDimensions &&
          (() => {
            const mirrored = Platform.OS === 'android' && direction === 'front';
            const {adjustRect} = adjustToView(frameDimensions, {width, height});

            return faces.map((i, index) => {
              const {left, ...others} = adjustRect(i.bounds);

              return (
                <View
                  key={index}
                  style={[
                    styles.boundingBox,
                    {
                      ...others,
                      [mirrored ? 'right' : 'left']: left,
                    },
                  ]}
                />
              );
            });
          })()}
      </View>
    </View>
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
