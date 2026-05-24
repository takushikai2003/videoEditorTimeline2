import { TrackInteractionHandler } from './TrackInteractionHandler.js';
import { ScrollbarInteractionHandler } from './ScrollbarInteractionHandler.js';

export class InteractionManager {
    constructor(timeline) {
        this.timeline = timeline;
        this.trackHandler = new TrackInteractionHandler(timeline);
        this.scrollbarHandler = new ScrollbarInteractionHandler(timeline);
        
        this.initEvents();
    }

    initEvents() {
        const trackCanvas = this.timeline.timelineTracks.canvas;
        const scrollCanvas = this.timeline.scrollbar.canvas;

        // トラックエリアのイベント
        trackCanvas.addEventListener('mousedown', (e) => this.trackHandler.handleMouseDown(e));
        // スクロールバーエリアのイベント
        scrollCanvas.addEventListener('mousedown', (e) => this.scrollbarHandler.handleMouseDown(e));

        // グローバルイベント（ドラッグ継続のため window で受ける）
        window.addEventListener('mousemove', (e) => {
            this.trackHandler.handleMouseMove(e);
            this.scrollbarHandler.handleMouseMove(e);
        });
        window.addEventListener('mouseup', () => {
            this.trackHandler.handleMouseUp();
            this.scrollbarHandler.handleMouseUp();
        });
    }
}