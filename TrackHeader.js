"use strict";

export class TrackHeader extends EventTarget{
    /**
     * @param {string} trackName
     */
    constructor(trackName){
        super();
        this.name = trackName;

        const element = document.createElement("div");
        element.classList.add("track-header");
        element.textContent = trackName;
        this.element = element;


        element.addEventListener("click",()=>{
            this.dispatchEvent(new CustomEvent("click"));
        });
    }

}