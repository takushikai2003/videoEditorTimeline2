import { Clip, VideoClip, AudioClip, EffectClip, KeyframeEffectClip } from './models/Clip.js';
import { VideoEditorTimeline } from './VideoEditorTimeline.js';

const timelineParent = document.getElementById("timeline_parent");
const timeline = new VideoEditorTimeline(timelineParent);

// テスト用クリップの作成
const testVideoClip = new VideoClip({
    mediaId: "video_asset_01", // 素材ライブラリのID
    mediaDuration: 8.0,
    name: "テストビデオ",
    startTime: 2.0,           // 2秒地点から配置
    relativeStartTime: 0,
    duration: 5.5,            // 5.5秒間の長さ
});

const testVideoClip2 = new VideoClip({
    mediaId: "video_asset_02",
    mediaDuration: 8.0,
    name: "テストビデオ2",
    startTime: 8.0,
    relativeStartTime: 0,
    duration: 3.5,
});

const testVideoClip3 = new VideoClip({
    mediaId: "video_asset_03",
    mediaDuration: 8.0,
    name: "テストビデオ3",
    startTime: 13.0,
    relativeStartTime: 0,
    duration: 5.0,
});

const testAudioClip = new AudioClip({
    mediaId: "audio_asset_01", // 素材ライブラリのID
    mediaDuration: 8.0,
    name: "テストオーディオ",
    startTime: 2.0,           // 2秒地点から配置
    relativeStartTime: 0,
    duration: 5.5,            // 5.5秒間の長さ
});

const testAudioClip2 = new AudioClip({
    mediaId: "audio_asset_02",
    mediaDuration: 8.0,
    name: "テストオーディオ2",
    startTime: 8.0,
    relativeStartTime: 0,
    duration: 3.5,
});

const testAudioClip3 = new AudioClip({
    mediaId: "audio_asset_03",
    mediaDuration: 8.0,
    name: "テストオーディオ3",
    startTime: 13.0,
    relativeStartTime: 0,
    duration: 5.0,
});

const testEffectClip = new EffectClip({
    effectId: "effect_01", // 素材ライブラリのID
    name: "テストエフェクト",
    startTime: 2.0,           // 2秒地点から配置
    duration: 5.5,            // 5.5秒間の長さ
});

const testEffectClip2 = new EffectClip({
    effectId: "effect_01", // 素材ライブラリのID
    name: "テストエフェクト",
    startTime: 15.0,           // 2秒地点から配置
    duration: 3,            // 5.5秒間の長さ
});

const testKeyframeEffectClip = new KeyframeEffectClip({
    effectId: "keyframe_effect_01", // 素材ライブラリのID
    name: "テストキーフレーム（仮）",
    startTime: 8.0,           // 2秒地点から配置
    duration: 5.5,            // 5.5秒間の長さ
});

// 配列に追加
timeline.tracks.video.push(testVideoClip, testVideoClip2, testVideoClip3);
timeline.tracks.audio.push(testAudioClip, testAudioClip2, testAudioClip3);
timeline.tracks.effect.push(testEffectClip);
timeline.tracks.effect.push(testEffectClip2);
timeline.tracks.effect.push(testKeyframeEffectClip);

timeline.update();



timeline.addEventListener("commit",(e)=>{
    console.log(e.detail.targetClip);
});

const mag_slider = document.getElementById("magnification");
mag_slider.addEventListener("input",()=>{
    timeline.magnification = Number(mag_slider.value);
    timeline.update();
});


// timeline.currentTimeを更新することでplayheadを動かせる
// let num = 0;
// setInterval(() => {
//     timeline.currentTime = num;
//     num +=0.01;
// }, 10);
