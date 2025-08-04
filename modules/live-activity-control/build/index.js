"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveActivityControlModule = void 0;
exports.startActivity = startActivity;
exports.endActivity = endActivity;
exports.updateActivity = updateActivity;
exports.areActivitiesEnabled = areActivitiesEnabled;
exports.startNursingActivity = startNursingActivity;
exports.pauseActivity = pauseActivity;
exports.resumeActivity = resumeActivity;
exports.completeActivity = completeActivity;

const LiveActivityControlModule_1 = __importDefault(require("./LiveActivityControlModule"));
exports.LiveActivityControlModule = LiveActivityControlModule_1.default;

// Legacy compatibility functions
async function startActivity(side, babyName) {
    return await LiveActivityControlModule_1.default.startActivity(side, babyName);
}
async function endActivity() {
    return await LiveActivityControlModule_1.default.endActivity();
}
async function updateActivity(side) {
    return await LiveActivityControlModule_1.default.updateActivity(side);
}
async function areActivitiesEnabled() {
    return await LiveActivityControlModule_1.default.areActivitiesEnabled();
}

// Enhanced functions with pause/resume support
async function startNursingActivity(activityName, activityIcon) {
    return await LiveActivityControlModule_1.default.startActivity(activityName, activityIcon);
}
async function pauseActivity(activityId) {
    return await LiveActivityControlModule_1.default.pauseActivity(activityId);
}
async function resumeActivity(activityId) {
    return await LiveActivityControlModule_1.default.resumeActivity(activityId);
}
async function completeActivity(activityId) {
    return await LiveActivityControlModule_1.default.completeActivity(activityId);
}
