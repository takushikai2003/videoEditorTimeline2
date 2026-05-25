"use strict";

import { Ruler } from './views/Ruler.js';
import { Playhead } from './views/Playhead.js';
// import { TrackHeader } from './TrackHeader.js';
import { TimelineTracks } from './views/TimelineTracks.js';
import { Scrollbar } from './views/Scrollbar.js';
import { InteractionManager } from './controllers/InteractionManager.js';

export class VideoEditorTimeline extends EventTarget{
    // プライベートフィールドの定義
    #currentTime = 0; // プレイヘッドの現在時間

    /**
     * @param {HTMLElement} parentElement
     */
    constructor(parentElement){
        super();

        this.parent = parentElement;
        
        this.containers = {
            ruler: this.parent.querySelector("#timeline_ruler"),
            tracks: this.parent.querySelector("#timeline_tracks"),
            scrollbar: this.parent.querySelector("#timeline_scrollbar"),
            playhead: this.parent.querySelector("#timeline_playhead_container"),
        };

        // 状態の初期化
        this.magnification = 60; // 1秒 = 60px
        this.scrollOffset = 0;
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
        this.playhead = new Playhead(this, this.containers.playhead); // SVG要素として実装

        this.ruler.refresh();
        this.timelineTracks.render();
        this.scrollbar.refresh(this.getTotalDuration());
        this.playhead.refresh(this.currentTime);

        // controllerの初期化
        this.interactionManager = new InteractionManager(this);

        this.dispatchEvent(new CustomEvent("init")); // 初期化完了通知

    }

    /**
     * 現在の再生時刻の取得（エンジンから直接参照）
     */
    get currentTime() {
        return this.#currentTime;
    }

    /**
     * 現在の再生時刻の設定（外部からのシーク用）
     * この setter がエンジン更新と UI 再描画の起点となる
     */
    set currentTime(time) {
        this.#currentTime = Math.max(0, time);
        this.playhead.refresh(this.#currentTime);
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

    // タイムライン全体の長さを取得する
    getTotalDuration() {
        let maxEndTime = 0;
        const trackTypes = ["video", "audio", "effect"];

        trackTypes.forEach(type => {
            this.tracks[type].forEach(clip => {
                if (clip.endTime > maxEndTime) {
                    maxEndTime = clip.endTime;
                }
            });
        });
        
        // クリップが何もない場合や、末尾に少し余裕を持たせたい場合は調整
        return Math.max(maxEndTime, 10); // 最低10秒分は表示するなど
    }

    /**
     * 内部データが変更された際に呼び出し、Viewの再描画と上位への通知を行う
     */
    update() {
        // 全Viewの再描画を実行
        this.ruler.refresh();
        this.timelineTracks.render();
        this.scrollbar.refresh(this.getTotalDuration());
        this.playhead.refresh(this.currentTime);

        // 上位プロジェクトに通知
        this.dispatchEvent(new CustomEvent("update", {detail:{state: this.getState()}}));
    }

}