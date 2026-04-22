#import <React/RCTViewManager.h>

/**
 * Objective-C bridge that exposes the Swift AvatarViewManager to the
 * React Native bridge and declares the `name` prop.
 *
 * The macro RCT_EXTERN_MODULE links to the Swift class.
 * RCT_EXTERN__REMAP_METHOD is used for custom prop setters.
 *
 * Place this file in the same iOS target as AvatarViewManager.swift and
 * AvatarUIView.swift.
 */
RCT_EXTERN_MODULE(AvatarViewManager, RCTViewManager)

RCT_EXTERN_METHOD(name : (NSString *)name)
