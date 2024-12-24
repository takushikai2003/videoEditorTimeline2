"use strict";

import { timelineConfig } from './timelineConfig.js';

/**
 * 秒数を「mm:ss:fff」形式にフォーマットして返す
 * @param {number} duration 
 * @returns {string}
 */
function secondToTimestamp(duration) {
    const hour = Math.floor(duration / 3600);
    const minute = Math.floor((duration - 3600 * hour) / 60);
    const second = Math.floor((duration - 3600 * hour) - 60 * minute);
    const ms = Math.floor(((((duration - 3600 * hour) - 60 * minute) - second)* 1000));//小数点下３桁まで

    // const hh = ('00' + hour).slice(-2);
    const mm = ('00' + minute).slice(-2);
    const ss = ('00' + second).slice(-2);
    const msms = ('000' + ms).slice(-3);
  
    const time = `${mm}:${ss},${msms}`;
    return time;
}



export class TimeScale{
    /**
     * @param {Timeline} timeline
     */
    constructor(timeline){
        const canvas = document.createElement("canvas");
        canvas.classList.add("timescale-canvas");
        canvas.width = timelineConfig.trackWidth;
        canvas.height = timelineConfig.timeScaleHeight;

        this.canvas = canvas;
        this.timeline = timeline;
        this.width = canvas.width;
        this.height = canvas.height;

        this.refresh();
    }


    refresh(dynamicInterval=false){
        const timeScale_ctx = this.canvas.getContext("2d");
        
        timeScale_ctx.clearRect(0,0, this.width, this.height);

        timeScale_ctx.fillStyle = "gray";
        timeScale_ctx.fillRect(0, 0, this.width, this.height);

        timeScale_ctx.fillStyle = "black";
        timeScale_ctx.textBaseline = "top";


        let pixel_step;

        if(dynamicInterval){
            // タイムステップをいい感じに決める
            const MAX_INTERVAL = 100;//[px]
            const MIN_INTERVAL = 60;//[px]

            pixel_step = 60;//いい値が見つからなければ60にする

            for(let interval = MIN_INTERVAL; interval < MAX_INTERVAL; interval++){
                if(Number.isInteger(interval / this.timeline.magnification)){//◯.000であれば
                    pixel_step = interval;
                    break;
                }
            }
        }
        else{
            // 60ピクセルごとに目盛りを振る
            pixel_step = 60;
        }

        
        let time = 0;
        let pixel = 0;

        while(true){
            timeScale_ctx.fillRect(pixel, 10, 1, this.height-10);
            timeScale_ctx.fillText(String(secondToTimestamp(time)), pixel, 1);
            time += pixel_step / this.timeline.magnification;

            pixel += pixel_step;

            if(pixel > this.width){
                break;
            }
        }
    }
}