import { VideoEditorTimeline } from './VideoEditorTimeline.js';

const timelineParent = document.getElementById("timeline_parent");
const timeline = new VideoEditorTimeline(timelineParent);



const track1 = timeline.addTrack({backgroundColor: "palegreen"});
const track2 = timeline.addTrack({backgroundColor: "skyblue"});


class Clip{
    constructor(text, startTime, endTime, relativeStartTime, relativeEndTime){
        this.text = text;
        this.startTime = startTime;
        this.endTime = endTime;
        this.relativeStartTime = relativeStartTime;
        this.relativeEndTime = relativeEndTime;
    }
}


const clip1 = new Clip("clip1", 0, 10, 0, 10);
const clip2 = new Clip("clip2", 10, 20, 0, 10);

const tclip1 = track1.addClip(clip1, {middleColor: "pink"});
const tclip2 = track1.addClip(clip2, {middleColor: "pink"});

// tclip1.addEventListener("change",()=>{
//     console.log("change", tclip1);
// });

// tclip1.addEventListener("select",()=>{
//     console.log("select", tclip1);
// });

const mag_slider = document.getElementById("magnification");
mag_slider.addEventListener("input",()=>{
    timeline.magnification = Number(mag_slider.value);
});
