# SpeakEasy iOS 版本 — 构建与安装指南

## 概述

SpeakEasy iOS 版本使用 **iOS 系统原生语音 API**，完全离线运行，无需 Google 服务，无需网络。

### 技术方案

| 功能 | Android 版 | iOS 版 |
|------|-----------|--------|
| 语音识别 (ASR) | Vosk 离线模型 (39MB) | **SFSpeechRecognizer** (系统自带，0MB) |
| 语音朗读 (TTS) | 预录音频 + Android TTS | **AVSpeechSynthesizer** (系统自带，0MB) |
| 中文支持 | 需额外下载模型 | **内置** (iOS 自带中文语音) |
| 英文支持 | Vosk 小模型 | **内置** (iOS 自带英文语音) |
| 离线运行 | ✅ | ✅ |
| APK/IPA 大小 | ~50MB | 预计 ~5MB |

### iOS 原生插件

1. **IosTtsPlugin** (`IosTtsPlugin.swift`)
   - `AVSpeechSynthesizer` — iOS 系统自带 TTS 引擎
   - 支持中英文（`zh-CN`, `en-US`, `en-GB`, `en-AU` 等）
   - 可调语速、音高、音量
   - 无需任何第三方依赖

2. **IosAsrPlugin** (`IosAsrPlugin.swift`)
   - `SFSpeechRecognizer` — iOS 10+ 系统自带语音识别
   - 支持中英文离线识别
   - 实时部分结果 + 最终结果
   - 自动请求麦克风和语音识别权限

## 构建方式

### 方式一：GitHub Actions 云编译（推荐，免费）

**前提条件：**
- GitHub 账号（免费注册）
- 将 SpeakEasy-App 项目推送到 GitHub 仓库

**步骤：**

1. 在 GitHub 创建新仓库（公开或私有均可）
2. 将本地代码推送上去：
   ```bash
   cd SpeakEasy-App
   git init
   git add .
   git commit -m "Add iOS support"
   git remote add origin https://github.com/你的用户名/SpeakEasy-App.git
   git push -u origin main
   ```
3. 进入 GitHub 仓库页面 → **Actions** 标签
4. 选择 "Build iOS IPA" 工作流
5. 点击 **Run workflow** → 等待编译完成（约 10-15 分钟）
6. 编译完成后，在运行记录底部 **Artifacts** 区域下载 `SpeakEasy-iOS-IPA`
7. 解压得到 `SpeakEasy-ios-unsigned.ipa`

### 方式二：本地 Mac 编译（如有 Mac）

```bash
cd SpeakEasy-App
npm ci --legacy-peer-deps
npm run build
npx cap add ios  # 首次需要
npx cap sync ios
npx cap open ios  # 打开 Xcode

# 在 Xcode 中：
# 1. 将 IosTtsPlugin.swift/.m 和 IosAsrPlugin.swift/.m 拖入 App target
# 2. 设置 Signing Team（免费 Apple ID 即可）
# 3. Product → Archive → 导出 IPA
```

## 安装到 iPhone

### 方法一：爱思助手（推荐，Windows/Mac）

1. 下载安装 [爱思助手](https://www.i4.cn/)
2. iPhone 用数据线连接电脑
3. 打开爱思助手 → 「应用游戏」→「导入IPA」
4. 选择 `SpeakEasy-ios-unsigned.ipa`
5. 安装后需要信任开发者：iPhone 设置 → 通用 → VPN与设备管理 → 信任

### 方法二：AltStore（需同 WiFi）

1. 电脑安装 [AltServer](https://altstore.io/)
2. iPhone 连接电脑，AltServer 中选择「Enable AltStore」
3. 在 AltStore 中导入 .ipa 安装
4. **注意**：免费 Apple ID 签名 7 天有效，过期需重新签名

### 方法三：Apple Developer 账号（$99/年，长期有效）

1. 在 Xcode 中使用开发者账号签名
2. 直接安装到 iPhone，签名 1 年有效
3. 可上架 App Store

## 权限说明

安装后首次使用语音功能，iPhone 会弹出以下权限请求：

1. **麦克风权限** — "SpeakEasy 需要麦克风权限来进行语音识别"
2. **语音识别权限** — "SpeakEasy 需要语音识别权限来听懂你的英语发音"

请点击「允许」。

## 文件结构

```
SpeakEasy-App/
├── src/
│   ├── plugins/
│   │   ├── ios-tts/src/index.ts      # iOS TTS 插件 TypeScript shim
│   │   ├── ios-asr/src/index.ts      # iOS ASR 插件 TypeScript shim
│   │   ├── native-tts/               # Android TTS 插件
│   │   └── voice-input/              # Android Voice Input 插件
│   ├── services/
│   │   ├── speechService.ts          # 语音服务（自动检测平台）
│   │   ├── offlineTts.ts             # 离线音频回退
│   │   └── voskAsr.ts                # Vosk ASR（仅 Android）
│   └── App.tsx                       # 主界面
├── ios/
│   └── App/App/
│       ├── IosTtsPlugin/
│       │   ├── IosTtsPlugin.swift    # AVSpeechSynthesizer 实现
│       │   └── IosTtsPlugin.m        # Capacitor 插件注册
│       ├── IosAsrPlugin/
│       │   ├── IosAsrPlugin.swift    # SFSpeechRecognizer 实现
│       │   └── IosAsrPlugin.m        # Capacitor 插件注册
│       └── Info.plist                # 权限描述
└── .github/workflows/
    └── build-ios.yml                 # GitHub Actions 编译工作流
```
