export class ScrollbarInteractionHandler {
    constructor(timeline) {
        this.timeline = timeline;
        this.isScrolling = false;
        this.initialState = null;
    }

    handleMouseDown(e) {
        const rect = this.timeline.scrollbar.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const totalDuration = this.timeline.getTotalDuration();
        const width = rect.width;

        // --- 修正ポイント1: paddingDurationを取得し、表示上の全時間を算出 ---
        const padding = this.timeline.scrollbar.paddingDuration || 0;
        const displayDuration = totalDuration + padding;

        if (displayDuration <= 0) return;

        // --- 修正ポイント2: 全ての計算に displayDuration を使用する ---
        const visibleDuration = width / this.timeline.magnification;
        const thumbWidth = Math.max(20, Math.min(width, (visibleDuration / displayDuration) * width));
        const thumbX = (this.timeline.scrollOffset / displayDuration) * width;


        if (x >= thumbX && x <= thumbX + thumbWidth) {
            this.isScrolling = true;
            this.initialState = {
                scrollOffset: this.timeline.scrollOffset,
                mouseX: e.clientX,
                totalDuration,
                width
            };
        }
    }

    handleMouseMove(e) {
        if (!this.isScrolling) return;

        const deltaX = e.clientX - this.initialState.mouseX;
        
        // ScrollbarからpaddingDurationを取得
        const padding = this.timeline.scrollbar.paddingDuration || 0;
        const displayDuration = this.initialState.totalDuration + padding;

        // 比率計算： (ピクセル移動量 / バーの幅) * 表示上の全時間
        const deltaScroll = (deltaX / this.initialState.width) * displayDuration;
        
        let nextOffset = this.initialState.scrollOffset + deltaScroll;

        // --- 最大スクロール値の制限（クランプ） ---
        const visibleDuration = this.initialState.width / this.timeline.magnification;
        const maxOffset = Math.max(0, displayDuration - visibleDuration);
        
        this.timeline.scrollOffset = Math.max(0, Math.min(nextOffset, maxOffset));
        this.timeline.update();
    }

    handleMouseUp() {
        this.isScrolling = false;
    }
}