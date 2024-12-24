"use strict";

import { TimeScaleHeader } from './TimeScaleHeader.js';
import { TimeScale } from './TimeScale.js';
import { Playhead } from './Playhead.js';
import { TrackHeader } from './TrackHeader.js';
import { TimelineTrack } from './TimelineTrack.js';


export class VideoEditorTimeline {
    /**
     * @param {HTMLElement} parentElement
     */
    constructor(parentElement){
        this.parentElement = parentElement;
        /** @type {TimelineTrack[]} */
        this.tracks = [];
        /** @type {number} */
        this.#magnification = 1; // タイムラインの拡大率

        // 目盛り行
        const timeScale_row = document.createElement("div");
        timeScale_row.classList.add("timescale-row");
        parentElement.appendChild(timeScale_row);

        // 目盛りヘッダー
        const timeScaleHeader = new TimeScaleHeader();
        timeScale_row.appendChild(timeScaleHeader.element);

        // 目盛り
        const timeScale = new TimeScale(this);
        timeScale_row.appendChild(timeScale.canvas);

        this.timeScale = timeScale;


        // プレイヘッド
        const playhead = new Playhead(this);
        parentElement.appendChild(playhead.element);

        this.playhead = playhead;
    }


    // プライベートフィールドの定義
    #magnification;

    set magnification(value){
        this.#magnification = value;
        this.refresh();
    }

    get magnification(){
        return this.#magnification;
    }

    /**
     * トラックを追加する
     * @param {Object} config 
     * @returns {TimelineTrack, TrackHeader}
     */
    addTrack(config){
        // トラック行（ヘッダー＋トラック本体）
        const track_row = document.createElement("div");
        track_row.classList.add("track-row");
        this.parentElement.appendChild(track_row);


        const track_name = "track" + (this.tracks.length+1);

        // トラックヘッダー
        const track_header = new TrackHeader(track_name, this.parentElement);
        track_row.appendChild(track_header.element);

        // トラック本体
        const track = new TimelineTrack(this, config, track_header);
        this.tracks.push(track);
        track_row.appendChild(track.canvas);

        track.refresh();


        return track;
    }


    refresh(){
        this.timeScale.refresh();
        this.tracks.forEach(track => track.refresh());
    }
}