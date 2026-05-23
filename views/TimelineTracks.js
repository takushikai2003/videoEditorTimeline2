export class TimelineTracks {
    /**
     * @param {VideoEditorTimeline} timeline - 全体を統括するTimelineインスタンス
     * @param {HTMLElement} container - キャンバスを載せる親要素
     */
    constructor(timeline, container) {
        this.timeline = timeline;
        this.container = container;
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        this.resize();
    }

    /**
     * コンテナのサイズに合わせてキャンバスをリサイズ
     */
    resize() {
        this.canvas.width = this.container.clientWidth;
        // トラック数に合わせて高さを計算（例: トラック数 * 50px）
        // 実際には全トラックを描画できる十分な高さが必要
        this.canvas.height = this.container.clientHeight;
    }

    /**
     * トラックとクリップを描画するメインメソッド
     */
    render() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        const trackHeight = this.timeline.trackHeight; // 50px

        // 1. 背景のクリア
        ctx.clearRect(0, 0, width, height);

        // 2. 各トラック（video, audio, effect）をループして描画
        const trackTypes = ["video", "audio", "effect"];
        
        ctx.strokeStyle = "#444";
        ctx.strokeRect(0, 0, width, height);

        trackTypes.forEach((type, index) => {
            const clips = this.timeline.tracks[type];
            const y = index * trackHeight;
            

            // トラックの背景・境界線を描画
            ctx.strokeStyle = "#444";
            ctx.beginPath();
            // 0.5px オフセットさせると、Canvasの仕様上、線がぼやけず1pxで描画される
            ctx.moveTo(0, y + trackHeight - 0.5);
            ctx.lineTo(width, y + trackHeight - 0.5);
            ctx.stroke();

            // 3. トラック内の各クリップをループして描画
            clips.forEach(clip => {
                this.drawClip(ctx, clip, y, trackHeight);
            });
        });
    }

    /**
     * 個別のクリップを描画する
     */
    drawClip(ctx, clip, y, height) {
        // Timelineクラスの変換メソッドを使用して座標と幅を計算
        const x = this.timeline.timeToPx(clip.startTime);
        const w = this.timeline.timeToPx(clip.endTime) - x;

        // 画面外（左右）にある場合は描画をスキップ（最適化）
        if (x + w < 0 || x > this.canvas.width) return;

        // クリップの外形を描画
        ctx.fillStyle = clip.color || "#555";
        ctx.fillRect(x, y + 5, w, height - 10); // 上下に少し余白

        // クリップの枠線
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.strokeRect(x, y + 5, w, height - 10);

        // クリップ名などのテキスト描画
        if (w > 20) { // 幅が狭すぎる場合は描画しない
            ctx.fillStyle = "white";
            ctx.font = "12px sans-serif";
            ctx.textBaseline = "middle";
            // クリップ名は Clip クラスで定義した this.name を使用
            ctx.fillText(clip.name, x + 5, y + height / 2);
        }
    }
}