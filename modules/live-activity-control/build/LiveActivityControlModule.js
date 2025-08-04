"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const expo_modules_core_1 = require("expo-modules-core");
// Import the native module. On web, it will be resolved to a web-specific implementation
// and on native platforms to the native implementation.
exports.default = (_a = expo_modules_core_1.NativeModulesProxy.LiveActivityControl) !== null && _a !== void 0 ? _a : {
    async startActivity(side, babyName) {
        return {
            success: false,
            message: 'Live Activities not supported on this platform'
        };
    },
    async endActivity() {
        return {
            success: false,
            message: 'Live Activities not supported on this platform'
        };
    },
    async updateActivity(side) {
        return {
            success: false,
            message: 'Live Activities not supported on this platform'
        };
    },
    async areActivitiesEnabled() {
        return false;
    }
};
