import Foundation
import Capacitor
import Speech
import AVFoundation

/**
 * IosAsrPlugin — iOS 原生语音识别插件
 *
 * 使用 SFSpeechRecognizer（iOS 10+，系统自带，支持中英文离线识别）
 * 无需 Google 服务，无需第三方依赖
 *
 * 权限要求（Info.plist）：
 * - NSSpeechRecognitionUsageDescription
 * - NSMicrophoneUsageDescription
 */
@objc(IosAsrPlugin)
public class IosAsrPlugin: CAPPlugin {

    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private var currentLang = "en-US"
    private var isListening = false

    public override func load() {
        // 初始化默认语言识别器
        setupRecognizer(for: currentLang)
    }

    private func setupRecognizer(for lang: String) {
        let locale = Locale(identifier: lang)
        speechRecognizer = SFSpeechRecognizer(locale: locale)
        speechRecognizer?.delegate = self
    }

    // MARK: - Plugin Methods

    @objc public override func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            let granted: Bool
            switch status {
            case .authorized:
                granted = true
            default:
                granted = false
            }
            DispatchQueue.main.async {
                self?.notifyListeners("asrPermission", data: ["granted": granted])
                call.resolve(["granted": granted])
            }
        }
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        let available = speechRecognizer?.isAvailable ?? false
        call.resolve(["available": available])
    }

    @objc func startListening(_ call: CAPPluginCall) {
        let language = call.getString("language") ?? currentLang
        let partialResults = call.getBool("partialResults") ?? true

        // 如果语言变了，重新创建识别器
        if language != currentLang {
            currentLang = language
            setupRecognizer(for: language)
        }

        guard let recognizer = speechRecognizer, recognizer.isAvailable else {
            call.reject("Speech recognizer not available for language: \(language)")
            return
        }

        // 已在监听
        if isListening {
            call.resolve(["started": false])
            return
        }

        // 检查麦克风权限
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            guard let self = self else { return }

            if !granted {
                DispatchQueue.main.async {
                    self.notifyListeners("asrError", data: ["message": "Microphone permission denied"])
                    call.reject("Microphone permission denied")
                }
                return
            }

            DispatchQueue.main.async {
                self.beginRecognition(partialResults: partialResults, call: call)
            }
        }
    }

    private func beginRecognition(partialResults: Bool, call: CAPPluginCall) {
        // 停止之前的任务
        cancelRecognition()

        // 创建音频会话
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            notifyListeners("asrError", data: ["message": "Audio session error: \(error.localizedDescription)"])
            call.reject("Audio session error")
            return
        }

        // 创建识别请求
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let request = recognitionRequest else {
            call.reject("Failed to create recognition request")
            return
        }
        request.shouldReportPartialResults = partialResults

        // 启动识别任务
        recognitionTask = speechRecognizer?.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }

            if let error = error {
                self.notifyListeners("asrError", data: ["message": error.localizedDescription])
                self.stopRecognition()
                return
            }

            if let result = result {
                let text = result.bestTranscription.formattedString
                let isFinal = result.isFinal
                let alternatives = result.transcriptions
                    .map { $0.formattedString }
                    .filter { $0 != text }

                self.notifyListeners("asrResult", data: [
                    "text": text,
                    "isFinal": isFinal,
                    "alternatives": alternatives
                ])

                if isFinal {
                    self.stopRecognition()
                }
            }
        }

        // 配置音频引擎
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            self?.recognitionRequest?.append(buffer)
        }

        do {
            try audioEngine.start()
            isListening = true
            call.resolve(["started": true])
        } catch {
            notifyListeners("asrError", data: ["message": "Audio engine start failed: \(error.localizedDescription)"])
            call.reject("Audio engine start failed")
        }
    }

    @objc func stopListening(_ call: CAPPluginCall) {
        stopRecognition()
        call.resolve(["stopped": true])
    }

    private func stopRecognition() {
        if !isListening { return }

        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)

        recognitionRequest?.endAudio()
        recognitionTask?.cancel()

        recognitionRequest = nil
        recognitionTask = nil

        // 停用音频会话
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)

        isListening = false
        notifyListeners("asrEnd", data: [:])
    }

    private func cancelRecognition() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
    }
}

// MARK: - SFSpeechRecognizerDelegate

extension IosAsrPlugin: SFSpeechRecognizerDelegate {

    public func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer,
                                  availabilityDidChange available: Bool) {
        if !available {
            notifyListeners("asrError", data: ["message": "Speech recognizer became unavailable"])
            stopRecognition()
        }
    }
}
