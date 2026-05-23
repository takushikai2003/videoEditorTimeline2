"use strict";

import { Ruler } from './views/Ruler.js';
import { Playhead } from './views/Playhead.js';
// import { TrackHeader } from './TrackHeader.js';
import { TimelineTracks } from './views/TimelineTracks.js';
import { Scrollbar } from './views/Scrollbar.js';


export class VideoEditorTimeline extends EventTarget{
    /**
     * @param {HTMLElement} parentElement
     */
    constructor(parentElement){
        super();

        this.parent = parentElement;
        
        this.containers = {
            ruler: this.parent.querySelector("#timeline_ruler"),
            tracks: this.parent.querySelector("#timeline_tracks"),
            scrollbar: this.parent.querySelector("#timeline_scrollbar")
        };

        // 状態の初期化
        this.magnification = 60; // 1秒 = 60px
        this.scrollOffset = 0;
        this.currentTime = 0;
        this.trackHeight = 50; // 高さ50px TODO:高さ変更機能

        // データモデル (Model) の初期化
        // ここには「どの素材がいつ配置されているか」の純粋なデータが入る
        this.tracks = {
            video: [],
            audio: [],
            effect: []
        };

        // 各Viewコンポーネント（Canvas/SVG）の初期化
        // 各クラスには this (Timeline本体) を渡し参照可能にする
        this.ruler = new Ruler(this, this.containers.ruler);
        this.timelineTracks = new TimelineTracks(this, this.containers.tracks);
        this.scrollbar = new Scrollbar(this, this.containers.scrollbar);
        this.playhead = new Playhead(this); // SVG要素として実装

        this.ruler.refresh();
        this.timelineTracks.render();



        this.dispatchEvent(new CustomEvent("init")); // 初期化完了通知

    }

    timeToPx(time) {
        return (time - this.scrollOffset) * this.magnification;
    }

    pxToTime(px){
        return (px / this.magnification) + this.scrollOffset;
    }

    /**
     * タイムラインの現在の状態を出力する
     * 上位プロジェクトはこのデータに .element を紐付けて Core へ渡す
     */
    getState() {
        return {
            tracks: {
                video: this.tracks.video.map(clip => clip.getInternalData()),
                audio: this.tracks.audio.map(clip => clip.getInternalData()),
                effect: this.tracks.effect.map(clip => clip.getInternalData())
            },
            currentTime: this.currentTime,
        };
    }

    /**
     * 内部データが変更された際に呼び出し、Viewの再描画と上位への通知を行う
     */
    update() {
        // 全Viewの再描画を実行
        this.ruler.refresh();
        this.timelineTracks.render();
        this.scrollbar.update();

        // 上位プロジェクトに通知
        this.dispatchEvent(new CustomEvent("update", {detail:{state: this.getState()}}));
    }

}