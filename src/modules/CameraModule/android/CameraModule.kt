package com.taskmanagerapp.camera

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

@ReactModule(name = CameraModule.MODULE_NAME)
class CameraModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "CameraModule" // nombre con el que JS llama al módulo
        private const val REQUEST_CAMERA_PERMISSION = 100
        private const val REQUEST_IMAGE_CAPTURE = 101
    }

    private var pendingPromise: Promise? = null // guarda la promesa mientras la cámara está abierta
    private var photoUri: Uri? = null
    private var photoFile: File? = null

    override fun getName(): String = MODULE_NAME

    // Método expuesto a JS: CameraModule.openCamera()
    @ReactMethod
    fun openCamera(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("E_ACTIVITY_NULL", "No current activity")
            return
        }

        // Verifica si ya tiene permiso de cámara, si no lo pide en tiempo de ejecución
        if (ContextCompat.checkSelfPermission(reactContext, android.Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(activity, arrayOf(android.Manifest.permission.CAMERA), REQUEST_CAMERA_PERMISSION)
            pendingPromise = promise // espera el resultado del permiso
            return
        }

        launchCamera(activity, promise)
    }

    private fun launchCamera(activity: Activity, promise: Promise) {
        pendingPromise = promise
        try {
            val file = createImageFile() // crea el archivo donde se guardará la foto
            photoFile = file
            // FileProvider genera una URI segura para compartir el archivo con la app de cámara
            val uri = FileProvider.getUriForFile(reactContext, "${reactContext.packageName}.fileprovider", file)
            photoUri = uri

            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, uri) // le dice a la cámara dónde guardar la foto
                addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            activity.startActivityForResult(intent, REQUEST_IMAGE_CAPTURE)
        } catch (e: Exception) {
            pendingPromise = null
            promise.reject("E_CAMERA_LAUNCH", e.message ?: "Unknown error", e)
        }
    }

    // Se ejecuta cuando el usuario toma la foto o cancela
    fun onActivityResult(requestCode: Int, resultCode: Int) {
        if (requestCode != REQUEST_IMAGE_CAPTURE) return
        val promise = pendingPromise ?: return
        pendingPromise = null

        if (resultCode == Activity.RESULT_OK) {
            val file = photoFile
            if (file != null && file.exists() && file.length() > 0) {
                // Retorna a JS la ruta, nombre y tamaño de la foto
                val result = Arguments.createMap().apply {
                    putString("uri", "file://${file.absolutePath}")
                    putString("fileName", file.name)
                    putDouble("size", file.length().toDouble())
                }
                promise.resolve(result)
            } else {
                promise.reject("E_FILE_NOT_FOUND", "Photo file not found or empty after capture")
            }
        } else {
            promise.reject("E_CANCELLED", "User cancelled camera") // usuario canceló sin tomar foto
        }
    }

    // Crea un archivo vacío con nombre único basado en timestamp en la carpeta Pictures de la app
    private fun createImageFile(): File {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = reactContext.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            ?: throw IllegalStateException("External storage not available")
        return File.createTempFile("JPEG_${timestamp}_", ".jpg", storageDir)
    }
}