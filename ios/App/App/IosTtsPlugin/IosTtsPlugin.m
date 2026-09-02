// IosTtsPlugin.m — Capacitor plugin registration
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(IosTtsPlugin, "IosTts",
    CAP_PLUGIN_METHOD(init, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(checkAvailable, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getLanguages, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setLanguage, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(speak, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(isSpeaking, CAPPluginReturnPromise);
)
