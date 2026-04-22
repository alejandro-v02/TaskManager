import { NativeModules, Platform } from 'react-native';
import type { CameraResult } from '../../domain/entities';

/**
 * Type-safe wrapper around the native CameraModule.
 *
 * On a device with the native module compiled (bare workflow build),
 * NativeModules.CameraModule will be the Kotlin/Swift implementation.
 *
 * In Expo Go / Jest the module is not present, so we provide a stub that
 * immediately rejects with a clear error.
 */
interface NativeCameraModule {
  openCamera(): Promise<CameraResult>;
}

const NativeCam = NativeModules.CameraModule as NativeCameraModule | undefined;

const stub: NativeCameraModule = {
  openCamera: () =>
    Promise.reject(
      new Error(
        'CameraModule is not available in this environment. ' +
          'Build the app with `npx expo run:android` or `npx expo run:ios`.',
      ),
    ),
};

export const CameraModule: NativeCameraModule = NativeCam ?? stub;
