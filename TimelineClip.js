"use strict";

/**
 * @class TimelineClip
 */
export class TimelineClip extends EventTarget{
    /**
     * @param {Clip} clip 
     * 
     * @param {Object} config
     * @param {string} config.middleColor クリップの色
     */
    constructor(clip, config={middleColor: "green"}){
        super();
        
        this.update(clip, config);


        // thisの値が変更されることを監視し、変更されたらchangeイベントを発火する
        const handler = {
            set: (obj, prop, value) => {
                // console.log("変更点", prop, value);
                const result = Reflect.set(obj, prop, value);
                this.dispatchEvent(new CustomEvent('change'));
                return result;
            },

            get: (obj, key)=>{
                let value = Reflect.get(obj, key);
                if(typeof(value) == "function"){
                    return value.bind(obj);
                }
                return value;
            }
        };

        return new Proxy(this, handler);
    }


    // thisにclipのプロパティを展開する
    update(clip, config){
        Object.assign(this, clip);
        Object.assign(this, config);
        this.duration = clip.endTime - clip.startTime;
        this.target = false;
    }

    /**
     * クリップを複製する
     * @returns {TimelineClip} 複製されたクリップ
     */
    duplicate(){
        const config = {
            middleColor: this.middleColor,
        }

        return new TimelineClip(this, config);
    }
}