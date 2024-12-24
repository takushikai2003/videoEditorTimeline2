"use strict";

export class TimeScaleHeader{
    constructor(){
        const element = document.createElement("div");
        element.classList.add("timescale-header");
        element.textContent = "時間";
        this.element = element;
    }
}