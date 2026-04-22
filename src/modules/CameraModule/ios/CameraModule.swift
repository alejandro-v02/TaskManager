import Foundation
import UIKit
import React

/**
 * CameraModule — iOS Swift bridge module.
 *
 * Exposes `openCamera()` to JavaScript using UIImagePickerController.
 *
 * Info.plist additions required:
 *   <key>NSCameraUsageDescription</key>
 *   <string>This app uses the camera to attach photos to tasks.</string>
 *
 * Flow:
 * 1. Check if camera is available on device.
 * 2. Present UIImagePickerController modally.
 * 3. On capture: save image to Documents directory.
 * 4. Resolve JS Promise with { uri, fileName, width, height, size }.
 * 5. On cancellation: reject with a descriptive error — caller handles gracefully.
 */
@objc(CameraModule)
final class CameraModule: NSObject, RCTBridgeModule, UIImagePickerControllerDelegate, UINavigationControllerDelegate {

    static func moduleName() -> String! { return "CameraModule" }
    static func requiresMainQueueSetup() -> Bool { return true }

    @objc var bridge: RCTBridge!

    private var pendingResolve: RCTPromiseResolveBlock?
    private var pendingReject: RCTPromiseRejectBlock?

    @objc func openCamera(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            reject("E_NO_CAMERA", "Camera is not available on this device", nil)
            return
        }

        pendingResolve = resolve
        pendingReject = reject

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            let picker = UIImagePickerController()
            picker.sourceType = .camera
            picker.delegate = self
            picker.allowsEditing = false

            if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
                rootVC.present(picker, animated: true)
            } else {
                reject("E_NO_ROOT_VC", "Could not find root view controller", nil)
                self.clearPending()
            }
        }
    }

    // MARK: - UIImagePickerControllerDelegate

    func imagePickerController(
        _ picker: UIImagePickerController,
        didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
    ) {
        picker.dismiss(animated: true)

        guard let image = info[.originalImage] as? UIImage else {
            pendingReject?("E_NO_IMAGE", "No image received from camera", nil)
            clearPending()
            return
        }

        do {
            let fileURL = try saveImage(image)
            let attrs = try FileManager.default.attributesOfItem(atPath: fileURL.path)
            let size = (attrs[.size] as? Double) ?? 0

            let result: [String: Any] = [
                "uri": fileURL.absoluteString,
                "fileName": fileURL.lastPathComponent,
                "width": Double(image.size.width),
                "height": Double(image.size.height),
                "size": size,
            ]
            pendingResolve?(result)
        } catch {
            pendingReject?("E_SAVE_FAILED", error.localizedDescription, error)
        }
        clearPending()
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
        pendingReject?("E_CANCELLED", "User cancelled camera", nil)
        clearPending()
    }

    // MARK: - Private helpers

    private func saveImage(_ image: UIImage) throws -> URL {
        let data = image.jpegData(compressionQuality: 0.85)!
        let fileName = "task_photo_\(Int(Date().timeIntervalSince1970)).jpg"
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let fileURL = docs.appendingPathComponent(fileName)
        try data.write(to: fileURL)
        return fileURL
    }

    private func clearPending() {
        pendingResolve = nil
        pendingReject = nil
    }
}
