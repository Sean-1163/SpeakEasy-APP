#!/bin/bash
# iOS 项目初始化脚本（在 macOS CI 上运行）
# 此脚本由 GitHub Actions 自动调用，也可在本地 Mac 上手动运行

set -e

echo "📱 Initializing SpeakEasy iOS project..."

cd "$(dirname "$0")/.."

# 1. 确保 iOS 平台已添加
if [ ! -d "ios/App" ]; then
  echo "📦 Adding iOS platform..."
  npx cap add ios
fi

# 2. 复制自定义插件文件到 Xcode 项目
echo "📋 Copying iOS plugin files..."

# IosTtsPlugin
cp -f ios/App/App/IosTtsPlugin/IosTtsPlugin.swift ios/App/App/IosTtsPlugin/
cp -f ios/App/App/IosTtsPlugin/IosTtsPlugin.m ios/App/App/IosTtsPlugin/

# IosAsrPlugin
cp -f ios/App/App/IosAsrPlugin/IosAsrPlugin.swift ios/App/App/IosAsrPlugin/
cp -f ios/App/App/IosAsrPlugin/IosAsrPlugin.m ios/App/App/IosAsrPlugin/

# 3. 安装 Pods
echo "📦 Installing CocoaPods..."
cd ios/App
pod install --repo-update || true

# 4. 同步 Capacitor
cd ../..
npx cap sync ios

echo "✅ iOS project ready!"
echo "📝 To open in Xcode: npx cap open ios"
echo "📝 To build: cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -sdk iphoneos"
