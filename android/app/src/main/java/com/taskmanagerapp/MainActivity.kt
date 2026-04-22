package com.taskmanagerapp

import android.content.Intent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper
import com.taskmanagerapp.camera.CameraModule

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "main"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {}
        )
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        try {
            val reactContext = reactInstanceManager?.currentReactContext ?: return
            val cameraModule = reactContext.getNativeModule(CameraModule::class.java) ?: return
            cameraModule.onActivityResult(requestCode, resultCode)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}