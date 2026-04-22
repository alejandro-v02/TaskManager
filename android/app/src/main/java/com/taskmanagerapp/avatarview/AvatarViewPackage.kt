package com.taskmanagerapp.avatarview

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * ReactPackage that registers the AvatarViewManager.
 *
 * Add this class to MainApplication.kt's getPackages() list:
 *
 *   override fun getPackages(): List<ReactPackage> =
 *     PackageList(this).packages + listOf(
 *       AvatarViewPackage(),
 *       CameraPackage()
 *     )
 */
class AvatarViewPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        emptyList()

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        listOf(AvatarViewManager())
}
