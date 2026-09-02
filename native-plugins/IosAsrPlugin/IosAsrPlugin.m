// IosAsrPlugin.m — Capacitor plugin registration
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(IosAsrPlugin, "IosAsr",
    CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(isAvailable, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startListening, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopListening, CAPPluginReturnPromise);
)
