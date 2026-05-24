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

        // つまみの位置を計算してヒットテスト
        const visibleDuration = width / this.timeline.magnification;
        const thumbWidth = Math.max(20, (visibleDuration / totalDuration) * width);
        const thumbX = (this.timeline.scrollOffset / totalDuration) * width;

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