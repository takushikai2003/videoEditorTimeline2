export class Scrollbar {
    constructor(timeline, container) {
        this.timeline = timeline;
        this.container = container;
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        this.paddingDuration = 5;// クリップの末尾から5秒の余白を追加する

        this.resize();
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    /**
     * スクロールバーを描画
     * @param {number} totalDuration - 全体の長さ（秒）
     */
    refresh(totalDuration) {
        const { width, height } = this.canvas;
        const ctx = this.ctx;
        
        // 1. 背景のクリア
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, width, height);

        if (totalDuration === undefined) {
            console.error("refresh() needs totalDuration");
            return;
        }

        // --- 余白（パディング）の設定 ---
        const displayDuration = totalDuration + this.paddingDuration;

        if (displayDuration <= 0) return;

        // 3. スクロールバーの「つまみ（Thumb）」の計算
        // 画面内に表示されている時間の長さ（秒）
        const visibleDuration = width / this.timeline.magnification;

        // つまみの幅： (画面に見えている時間 / 表示上の全時間) * キャンバス幅
        const thumbWidth = Math.max(20, Math.min(width, (visibleDuration / displayDuration) * width));

        // つまみの位置： (現在のスクロール位置 / 表示上の全時間) * キャンバス幅
        const thumbX = (this.timeline.scrollOffset / displayDuration) * width;

        // 4. つまみの描画
        ctx.fillStyle = "#cccccc";
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 1;
        
        this.drawRoundedRect(ctx, thumbX, 2, thumbWidth, height - 4, 4);
    }


    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}