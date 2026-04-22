#import <React/RCTBridgeModule.h>

/**
 * Objective-C bridge exposing the Swift CameraModule to the React Native bridge.
 */
RCT_EXTERN_MODULE(CameraModule, NSObject)

RCT_EXTERN_METHOD(
  openCamera:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)
