export class Scrollbar {
    constructor(timeline, container) {
        this.timeline = timeline;
        this.container = container;
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

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
        
        // 1. 背景のクリア（ライトグレー）
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, width, height);

        if(!totalDuration){
            console.error("refresh() needs totalDuration");
        }

        if (totalDuration <= 0) return;

        // 2. ミニマップ（クリップの簡易表示）
        // 全体の長さを canvas の幅にマッピングして、クリップの位置を描画
        // ごちゃごちゃするので使わない
        // this.drawMinimap(totalDuration);

        // 3. スクロールバーの「つまみ（Thumb）」の計算
        const visibleDuration = width / this.timeline.magnification;
        const thumbWidth = Math.max(20, (visibleDuration / totalDuration) * width);
        const thumbX = (this.timeline.scrollOffset / totalDuration) * width;

        // 4. つまみの描画
        // ライトテーマに合わせ、少し透明度のある青系 (#4a90e2)
        ctx.fillStyle = "#cccccc";      // つまみの塗り
        ctx.strokeStyle = "#aaaaaa";    // つまみの枠線        ctx.strokeStyle = "#45515e";
        ctx.lineWidth = 1;
        
        // 角丸の矩形を描画（お好みで）
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