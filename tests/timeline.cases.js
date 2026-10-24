import assert from 'node:assert/strict';
import { TrackInteractionHandler } from '../controllers/TrackInteractionHandler.js';
import { VideoClip, AudioClip, EffectClip } from '../models/Clip.js';

// Older Node versions do not provide the browser CustomEvent constructor.
if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class CustomEvent {
        constructor(type, options = {}) {
            this.type = type;
            this.detail = options.detail;
        }
    };
}

export const cases = [];
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

for (const ClipType of [VideoClip, AudioClip, EffectClip]) {
    const type = ClipType === VideoClip ? 'video' : ClipType === AudioClip ? 'audio' : 'effect';
    for (const action of ['move', 'resize-start', 'resize-end']) {
        for (const delta of [-100, -1, 0, 1, 100]) {
            cases.push({ name: `${type}: ${action} by ${delta}s`, run() {
                const clip = new ClipType({name: 'target', startTime: 4, duration: 2,
                    mediaId: 'm', mediaDuration: 12, relativeStartTime: 3, effectId: 'e'});
                const left = {startTime: 0, endTime: 2};
                const right = {startTime: 8, endTime: 10};
                const timeline = {
                    tracks: {video: [], audio: [], effect: []},
                    timelineTracks: {canvas: {style: {}, getBoundingClientRect: () => ({left: 0, top: 0})}},
                    magnification: 60, trackHeight: 50, scrollOffset: 1,
                    timeToPx(t) { return (t - this.scrollOffset) * this.magnification; },
                    pxToTime(x) { return x / this.magnification + this.scrollOffset; },
                    update() {}, dispatchEvent() {}
                };
                // Intentionally unsorted. Overlap on another track must not block editing.
                timeline.tracks[type] = [right, clip, left];
                timeline.tracks[type === 'video' ? 'audio' : 'video'] = [{startTime: 2, endTime: 8}];
                const handler = new TrackInteractionHandler(timeline);
                const start = action === 'move' ? 5 : action === 'resize-start' ? 4 : 6;
                const y = ['video','audio','effect'].indexOf(type) * 50 + 25;
                const x = timeline.timeToPx(start);
                handler.handleMouseDown({clientX: x, clientY: y});
                assert.equal(handler.activeAction, action);
                handler.handleMouseMove({clientX: x + delta * 60, clientY: y});
                const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
                if (action === 'move') {
                    near(clip.startTime, delta < -4 ? 0 : delta > 4 ? 4 + delta : clamp(4 + delta, 2, 6));
                    near(clip.endTime, clip.startTime + 2);
                } else if (action === 'resize-start') {
                    near(clip.startTime, clamp(4 + delta, 2, 5.9));
                    near(clip.endTime, 6);
                } else {
                    near(clip.startTime, 4);
                    near(clip.endTime, clamp(6 + delta, 4.1, 8));
                }
                const sorted = [...timeline.tracks[type]].sort((a, b) => a.startTime - b.startTime);
                for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i-1].endTime <= sorted[i].startTime);
                if (action !== 'move' || Math.abs(delta) <= 4) {
                assert.ok(clip.startTime >= left.endTime);
                assert.ok(clip.endTime <= right.startTime);
                assert.deepEqual(left, {startTime: 0, endTime: 2});
                assert.deepEqual(right, {startTime: 8, endTime: 10});
                }
                if (type !== 'effect') {
                    near(clip.relativeEndTime, clip.relativeStartTime + clip.endTime - clip.startTime);
                    assert.ok(clip.relativeStartTime >= 0 && clip.relativeEndTime <= 12);
                    if (action === 'resize-start') near(clip.relativeEndTime, 5);
                    else near(clip.relativeStartTime, 3);
                }
                // Returning the pointer must restore the original state without accumulated error.
                handler.handleMouseMove({clientX: x, clientY: y});
                near(clip.startTime, 4); near(clip.endTime, 6);
                handler.handleMouseUp();
                assert.equal(handler.targetClip, null);
            }});
        }
    }
}

for (const ClipType of [VideoClip, AudioClip]) {
    for (const action of ['resize-start', 'resize-end']) {
        cases.push({name: `${ClipType.name}: source boundary for ${action}`, run() {
            const clip = new ClipType({name: 'short', mediaId: 'm', startTime: 1,
                duration: 0.05, relativeStartTime: 0, mediaDuration: 0.05});
            const timeline = {tracks: {video: [clip]}, timelineTracks: {canvas: {}}};
            const handler = new TrackInteractionHandler(timeline);
            handler.targetClip = clip;
            handler.targetTrackType = 'video';
            handler.activeAction = action;
            handler.initialState = {startTime: 1, endTime: 1.05, relativeStartTime: 0};
            handler.processResize(action === 'resize-start' ? -100 : 100, true);
            near(clip.startTime, 1); near(clip.endTime, 1.05);
            handler.processResize(action === 'resize-start' ? 100 : -100, true);
            near(clip.endTime - clip.startTime, 0.05);
        }});
    }
}

for (const direction of [-1, 1]) {
    cases.push({name: `reorder unequal clips in direction ${direction}`, run() {
        const a = {startTime: 0, endTime: 1, relativeStartTime: 2};
        const b = {startTime: 2, endTime: 5, relativeStartTime: 3};
        const c = {startTime: 5, endTime: 7, relativeStartTime: 4};
        const target = direction > 0 ? a : c;
        const initial = [a,b,c].map(clip => ({clip, startTime: clip.startTime, endTime: clip.endTime}));
        const handler = new TrackInteractionHandler({tracks: {video: [c,a,b]}, timelineTracks: {canvas: {}}});
        handler.targetClip = target;
        handler.targetTrackType = 'video';
        handler.initialState = {startTime: target.startTime, endTime: target.endTime, trackClips: initial};
        const durations = [1,3,2];
        for (const delta of [direction * 3, direction * 20, direction * 3, 0]) {
            handler.processMove(delta);
            const sorted = [a,b,c].sort((x,y) => x.startTime-y.startTime);
            assert.ok(sorted[0].startTime >= 0);
            for (let i=1;i<sorted.length;i++) assert.ok(sorted[i-1].endTime <= sorted[i].startTime);
            [a,b,c].forEach((clip,i) => near(clip.endTime-clip.startTime, durations[i]));
            assert.deepEqual([a,b,c].map(clip => clip.relativeStartTime), [2,3,4]);
            if (Math.abs(delta) === 20) assert.equal(direction > 0 ? sorted[2] : sorted[0], target);
        }
        for (const state of initial) {
            near(state.clip.startTime, state.startTime);
            near(state.clip.endTime, state.endTime);
        }
    }});
}

cases.push({name: 'swap only after crossing the neighbor midpoint', run() {
    const target = {startTime: 0, endTime: 2};
    const next = {startTime: 2, endTime: 6};
    const handler = new TrackInteractionHandler({timelineTracks: {canvas: {}}});
    handler.targetClip = target;
    handler.initialState = {startTime: 0, endTime: 2, trackClips: [
        {clip: target, startTime: 0, endTime: 2}, {clip: next, startTime: 2, endTime: 6}
    ]};
    handler.processMove(3);
    near(target.startTime, 0); near(next.startTime, 2);
    handler.processMove(3.01);
    near(next.startTime, 0); near(next.endTime, 4); near(target.startTime, 4);
}});
