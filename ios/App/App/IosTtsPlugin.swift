import Foundation
import Capacitor
import AVFoundation

/**
 * IosTtsPlugin — iOS 原生 TTS 插件
 *
 * 使用 AVSpeechSynthesizer（iOS 系统自带，完全离线，支持中英文）
 * 无需 Google 服务，无需网络，无需第三方依赖
 */
@objc(IosTtsPlugin)
public class IosTtsPlugin: CAPPlugin {

    private let synthesizer = AVSpeechSynthesizer()
    private var currentUtterance: AVSpeechUtterance?
    private var currentLang = "en-US"
    private var isReady = false

    public override func load() {
        // AVSpeechSynthesizer 开箱即用，无需初始化
        isReady = true
    }

    // MARK: - Plugin Methods

    @objc func init(_ call: CAPPluginCall) {
        isReady = true
        call.resolve(["ready": true])
    }

    @objc func checkAvailable(_ call: CAPPluginCall) {
        // AVSpeechSynthesizer 在所有 iOS 设备上都可用
        let voices = AVSpeechSynthesisVoice.speechVoices()
        call.resolve([
            "available": true,
            "engine": "AVSpeechSynthesizer (iOS built-in)"
        ])
    }

    @objc func getLanguages(_ call: CAPPluginCall) {
        let voices = AVSpeechSynthesisVoice.speechVoices()
        let langs = Set(voices.map { $0.language })
        call.resolve(["languages": Array(langs)])
    }

    @objc func setLanguage(_ call: CAPPluginCall) {
        guard let lang = call.getString("language") else {
            call.resolve(["set": false])
            return
        }
        currentLang = lang
        call.resolve(["set": true])
    }

    @objc func speak(_ call: CAPPluginCall) {
        guard let text = call.getString("text"), !text.isEmpty else {
            call.reject("text is required")
            return
        }

        let language = call.getString("language") ?? currentLang
        let rate = call.getFloat("rate") ?? 1.0
        let pitch = call.getFloat("pitch") ?? 1.0
        let volume = call.getFloat("volume") ?? 1.0

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            // 停止当前朗读
            self.synthesizer.stopSpeaking(at: .immediate)

            let utterance = AVSpeechUtterance(string: text)
            utterance.language = language

            // AVSpeechUtterance rate: 0.0~1.0（AVSpeechUtteranceDefaultSpeechRate ≈ 0.5）
            // 我们接收 0.5~2.0 范围，映射到 0.0~1.0
            let mappedRate = Float(rate) * 0.5
            utterance.rate = max(AVSpeechUtteranceMinimumSpeechRate,
                                min(AVSpeechUtteranceMaximumSpeechRate, mappedRate))
            utterance.pitchMultiplier = max(0.5, min(2.0, pitch))
            utterance.volume = max(0.0, min(1.0, volume))

            // 尝试找到匹配的语音
            if let voice = AVSpeechSynthesisVoice(language: language) {
                utterance.voice = voice
            }

            self.currentUtterance = utterance
            self.synthesizer.delegate = self
            self.synthesizer.speak(utterance)

            call.resolve(["started": true])
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.synthesizer.stopSpeaking(at: .immediate)
            self?.currentUtterance = nil
            call.resolve()
        }
    }

    @objc func isSpeaking(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            let speaking = self?.synthesizer.isSpeaking ?? false
            call.resolve(["speaking": speaking])
        }
    }
}

// MARK: - AVSpeechSynthesizerDelegate

extension IosTtsPlugin: AVSpeechSynthesizerDelegate {

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer,
                                   didFinish utterance: AVSpeechUtterance) {
        self.notifyListeners("ttsEnd", data: ["text": utterance.speechString])
        self.currentUtterance = nil
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer,
                                   didCancel utterance: AVSpeechUtterance) {
        self.currentUtterance = nil
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer,
                                   didEncounterError error: AVSpeechSynthesisVoice.Error) {
        self.notifyListeners("ttsError", data: ["message": error.localizedDescription])
    }
}
