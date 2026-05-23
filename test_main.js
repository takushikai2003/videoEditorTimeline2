import { Clip, VideoClip, AudioClip, EffectClip, KeyframeEffectClip } from './models/Clip.js';
import { VideoEditorTimeline } from './VideoEditorTimeline.js';

const timelineParent = document.getElementById("timeline_parent");
const timeline = new VideoEditorTimeline(timelineParent);

// テスト用クリップの作成
const testVideoClip = new VideoClip({
    mediaId: "video_asset_01", // 素材ライブラリのID
    name: "テストビデオ",
    startTime: 2.0,           // 2秒地点から配置
    duration: 5.5,            // 5.5秒間の長さ
});

const testAudioClip = new AudioClip({
    mediaId: "audio_asset_01", // 素材ライブラリのID
    name: "テストオーディオ",
    startTime: 2.0,           // 2秒地点から配置
    duration: 5.5,            // 5.5秒間の長さ
});

const testEffectClip = new EffectClip({
    effectId: "effect_01", // 素材ライブラリのID
    name: "テストエフェクト",
    startTime: 2.0,           // 2秒地点から配置
    duration: 5.5,            // 5.5秒間の長さ
});

const testKeyframeEffectClip = new KeyframeEffectClip({
    effectId: "keyframe_effect_01", // 素材ライブラリのID
    name: "テストキーフレーム（仮）",
    startTime: 8.0,           // 2秒地点から配置
    duration: 5.5,            // 5.5秒間の長さ
});

// 配列に追加
timeline.tracks.video.push(testVideoClip);
timeline.tracks.audio.push(testAudioClip);
timeline.tracks.effect.push(testEffectClip);
timeline.tracks.effect.push(testKeyframeEffectClip);

timeline.update();


const mag_slider = document.getElementById("magnification");
mag_slider.addEventListener("input",()=>{
    timeline.magnification = Number(mag_slider.value);
    timeline.update();
});
