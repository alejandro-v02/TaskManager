package com.taskmanagerapp.camera

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * ReactPackage registering CameraModule.
 * Add this to MainApplication.kt's getPackages():
 *
 *   override fun getPackages(): List<ReactPackage> =
 *     PackageList(this).packages + listOf(
 *       AvatarViewPackage(),
 *       CameraPackage()
 *     )
 */
class CameraPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(CameraModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
