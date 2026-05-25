export class Playhead {
    constructor(timeline, container) {
        this.timeline = timeline;
        this.container = container;

        this.canvas = document.createElement("canvas");

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        this.resize();
    }

    /**
     * 親コンテナのサイズに合わせてキャンバスをリサイズ
     */
    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    /**
     * 再生ヘッドを描画
     * @param {number} currentTime - 現在の再生時間（秒）
     */
    refresh(currentTime) {
        if(currentTime == undefined){
            console.error("refresh() needs currentTime")
            return;
        }

        const { width, height } = this.canvas;
        const ctx = this.ctx;

        // キャンバスをクリア
        ctx.clearRect(0, 0, width, height);

        // 1. 現在の時間からX座標を計算
        // 式: (現在の秒数 - スクロールオフセット) * 1秒あたりのピクセル数
        const x = (currentTime - this.timeline.scrollOffset) * this.timeline.magnification;

        // 画面外（左端より前、または右端より後ろ）なら描画をスキップ
        if (x < 0 || x > width) return;

        // 2. 縦線の描画（赤色）
        ctx.strokeStyle = "#ff4d4d"; // 少し明るい赤
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // 3. ヘッド部分（上の逆三角形）の描画
        const headSize = 7;
        ctx.fillStyle = "#ff4d4d";
        ctx.beginPath();
        ctx.moveTo(x - headSize, 0);
        ctx.lineTo(x + headSize, 0);
        ctx.lineTo(x, headSize * 1.5);
        ctx.closePath();
        ctx.fill();
    }
}