import Foundation
import React

/**
 * RCTViewManager that exposes AvatarUIView to the React Native bridge.
 *
 * Registration:
 *   Swift modules are auto-registered when they conform to RCTBridgeModule.
 *   No additional Obj-C boilerplate needed beyond AvatarViewManager.m.
 *
 * Usage (via AvatarView.tsx wrapper):
 *   <AvatarView name="Santiago Lopez" size={44} />
 */
@objc(AvatarViewManager)
final class AvatarViewManager: RCTViewManager {

    override func view() -> UIView! {
        return AvatarUIView()
    }

    /// Tells React Native this view manager should be used on the main queue.
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
