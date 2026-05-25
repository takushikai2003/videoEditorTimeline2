import { TrackInteractionHandler } from './TrackInteractionHandler.js';
import { ScrollbarInteractionHandler } from './ScrollbarInteractionHandler.js';
import { PlayheadHandler } from './PlayheadHandler.js';

export class InteractionManager {
    constructor(timeline) {
        this.timeline = timeline;
        this.trackHandler = new TrackInteractionHandler(timeline);
        this.scrollbarHandler = new ScrollbarInteractionHandler(timeline);
        this.playheadHandler = new PlayheadHandler(timeline);
        
        this.initEvents();
    }

    initEvents() {
        const trackCanvas = this.timeline.timelineTracks.canvas;
        const scrollCanvas = this.timeline.scrollbar.canvas;
        const rulerCanvas = this.timeline.ruler.canvas;

        // トラックエリアのイベント
        trackCanvas.addEventListener('mousedown', (e) => this.trackHandler.handleMouseDown(e));
        // スクロールバーエリアのイベント
        scrollCanvas.addEventListener('mousedown', (e) => this.scrollbarHandler.handleMouseDown(e));
        // 目盛エリアのイベント（playheadを動かす）
        rulerCanvas.addEventListener("mousedown", (e)=>this.playheadHandler.handleMouseDown(e));

        // グローバルイベント（ドラッグ継続のため window で受ける）
        window.addEventListener('mousemove', (e) => {
            this.trackHandler.handleMouseMove(e);
            this.scrollbarHandler.handleMouseMove(e);
            this.playheadHandler.handleMouseMove(e);
        });
        window.addEventListener('mouseup', () => {
            this.trackHandler.handleMouseUp();
            this.scrollbarHandler.handleMouseUp();
            this.playheadHandler.handleMouseUp();
        });
    }
}