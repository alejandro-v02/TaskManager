package com.taskmanagerapp.avatarview

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * React Native ViewManager that exposes AvatarNativeView to JavaScript.
 *
 * Registration:
 *   Add AvatarViewPackage to the list in MainApplication.kt:
 *     override fun getPackages() = listOf(..., AvatarViewPackage())
 *
 * Usage in JS (via AvatarView.tsx wrapper):
 *   <AvatarView name="Santiago Lopez" size={44} />
 */
class AvatarViewManager : SimpleViewManager<AvatarNativeView>() {

    override fun getName(): String = "AvatarView"

    override fun createViewInstance(reactContext: ThemedReactContext): AvatarNativeView {
        return AvatarNativeView(reactContext)
    }

    /**
     * Receives the `name` prop from JS and forwards it to the native view.
     * The view extracts initials and computes background color internally.
     */
    @ReactProp(name = "name")
    fun setName(view: AvatarNativeView, name: String?) {
        view.setName(name ?: "")
    }
}
