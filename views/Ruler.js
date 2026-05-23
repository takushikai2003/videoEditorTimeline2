export class Ruler {
    /**
     * @param {VideoEditorTimeline} timeline - 全体を統括するクラス
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

    resize() {
        // コンテナのサイズに合わせてキャンバスをリサイズ
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    refresh() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const mag = this.timeline.magnification;
    const offset = this.timeline.scrollOffset;

    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, width, height);

    // 1. 適切なステップ（秒）を取得
    const stepSeconds = this.calculateStep(mag);

    // 2. 左端のオフセットから「何番目の目盛りか」を整数で計算
    const startStepIndex = Math.floor(offset / stepSeconds);

    ctx.strokeStyle = "#555555";
    ctx.fillStyle = "black";
    ctx.font = "13px sans-serif";
    

    // 3. インデックスベースのループで描画
    for (let i = 0; ; i++) {
        // 現在の目盛りの正確な時間を計算（累積誤差を防止）
        const t = (startStepIndex + i) * stepSeconds;
        
        // 時間を座標に変換
        const x = this.timeline.timeToPx(t);


        // 画面右端を超えたらループ終了
        if (x > width) break;

        // 目盛り線の描画
        ctx.beginPath();
        ctx.moveTo(x, height * 0.7);
        ctx.lineTo(x, height);
        ctx.stroke();

        // タイムスタンプの描画（t < 0 の場合は描画しない）
        if (t >= 0) {
            const label = this.secondToTimestamp(t);
            ctx.fillText(label, x + 4, 12);
        }
    }
}


    /**
     * 倍率(mag)に応じて適切な目盛り間隔（秒）を返す
     */
    calculateStep(mag) {
        // 画面上で目盛りの間隔が 100px 以上になるように、キリの良い秒数を選択する
        const targetPx = 100;

        // 候補となる秒数のリスト（0.1秒から1時間まで）
        const steps = [
            0.1, 0.5, 1, 2, 5, 10, 30, 60, 300, 600, 1800, 3600
        ];

        // step * mag (px/s) が targetPx を超える最初の秒数を見つける
        const bestStep = steps.find(s => s * mag >= targetPx);

        // 見つからなければ最大値（3600秒）を返す
        return bestStep || 3600;
    }

    secondToTimestamp(sec) {
        // 分(mm)と秒(ss)を計算
        // 1時間を超える場合も分に合算される（例: 61:05）
        const mm = Math.floor(sec / 60).toString().padStart(2, '0');
        const ss = Math.floor(sec % 60).toString().padStart(2, '0');

        // 小数点以下の部分を抽出し、ミリ秒(3桁)に変換
        // sec % 1 で小数点以下のみを取得し、1000を掛けて四捨五入/切り捨てを行う
        const msms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');

        return `${mm}:${ss},${msms}`;
    }
}