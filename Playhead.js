"use strict";
import { timelineConfig } from "./timelineConfig.js";

export class Playhead extends EventTarget{
    constructor(timeline){
        super();

        this.timeline = timeline;
        this.time = 0;

        const height = timelineConfig.trackHeight * timelineConfig.displayTrackCount + timelineConfig.timeScaleHeight;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", "playhead");
        svg.setAttribute("width", "8");
        svg.setAttribute("height", height);
        svg.innerHTML = `<line x1="0" y1="0" x2="0" y2="${height}" stroke="deepskyblue" stroke-width="8"/>`;

        this.element = svg;


        // 初期値へ
        this.moveByTime(0);

        
        let mousedown = false;
        timeline.timeScale.canvas.addEventListener("mousedown", (e)=>{
            const rect = timeline.timeScale.canvas.getBoundingClientRect();
            const point = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        
            if(point.x < 0){
                point.x = 0;
            }
        
            this.moveByX(point.x);
            this.dispatchEvent(new CustomEvent("progressChanged", {detail:{time: this.time}}));

            mousedown = true;
        });
        
        window.addEventListener("mouseup", (e)=>{
            mousedown = false;
        });
        
        window.addEventListener("mousemove", (e)=>{
            if(!mousedown){
                return;
            }
        
        
            const rect = timeline.timeScale.canvas.getBoundingClientRect();
            const point = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        
            if(point.x < 0){
                point.x = 0;
            }
        
            this.moveByX(point.x);
            this.dispatchEvent(new CustomEvent("progressChanged", {detail:{time: this.time}}));

        });
        
    }


    /**
     * @param {number} pointX 
     */
    moveByX(pointX){
        const clientRect = this.timeline.timeScale.canvas.getBoundingClientRect();
        const canvas_left_px = window.pageXOffset + clientRect.left;
    
        this.element.style.left = canvas_left_px + pointX + "px";

        const mag = this.timeline.magnification;
        this.time = pointX / mag;
    }


    /**
     * @param {number} time 
     */
    moveByTime(time){
        const clientRect = this.timeline.timeScale.canvas.getBoundingClientRect();
        const canvas_left_px = window.pageXOffset + clientRect.left;
    
        const mag = this.timeline.magnification;
    
        this.element.style.left = canvas_left_px + time*mag + "px";
    
        this.time = time;
    }
}