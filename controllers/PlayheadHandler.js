export class PlayheadHandler {
    constructor(timeline) {
        this.timeline = timeline;
        this.isSeeking = false;
        this.rulerCanvas = this.timeline.ruler.canvas;
    }

    /**
     * マウスダウン時の処理(on ruler canvas)：再生位置を更新しドラッグ開始
     */
    handleMouseDown(e) {
        const rect = this.rulerCanvas.getBoundingClientRect();
        
        this.isSeeking = true;
        this.updatePlayheadPosition(e, rect);
    }

    /**
     * マウス移動時の処理：シーク中なら継続して再生位置を更新
     */
    handleMouseMove(e) {
        if (!this.isSeeking) return;

        const rect = this.rulerCanvas.getBoundingClientRect();
        this.updatePlayheadPosition(e, rect);
    }

    /**
     * マウスアップ時の処理：シーク終了
     */
    handleMouseUp() {
        this.isSeeking = false;
    }

    /**
     * 座標から時間を計算し、エンジンおよびUIに反映
     */
    updatePlayheadPosition(e, rect) {
        const x = e.clientX - rect.left;
        
        // --- 座標を時間に変換する計算式 ---
        // time = (x / 倍率) + スクロールオフセット
        let targetTime = this.timeline.pxToTime(x);

        // 0秒以下にならないように制限
        targetTime = Math.max(0, targetTime);

        // 2. UIの更新(setterなので描画も更新される)
        this.timeline.currentTime = targetTime;

    }
}