export class InteractionManager {
    constructor(timeline) {
        this.timeline = timeline;
        this.activeAction = null; // 'move', 'resize-start', 'resize-end' など
        this.targetClip = null;
        this.initialState = null; // 操作開始時のクリップのStartTimeなどを保持

        // ドラッグ開始時の状態を保持（誤差の蓄積を防ぐ）
        this.initialState = {
            startTime: 0,
            endTime: 0,
            mouseX: 0
        };
        
        this.initEvents();
    }

    initEvents() {
        const canvas = this.timeline.timelineTracks.canvas;
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    // 1. ヒットテスト（当たり判定）
    // どのトラックのどのクリップがクリックされたかを特定する
    findClipAt(x, y) {
        // トラックの高さ（this.timeline.trackHeight）から、どのトラック種類か判定
        // 例: 0-50pxならビデオ, 50-100pxならオーディオ...
        const trackTypes = ["video", "audio", "effect"];
        const trackIndex = Math.floor(y / this.timeline.trackHeight);
        const type = trackTypes[trackIndex];

        if (!type || !this.timeline.tracks[type]){
            console.error("track not found");
            return null;
        }

        const time = this.timeline.pxToTime(x);
        // そのトラック内の全クリップから、時間が重なるものを探す
        const clip = this.timeline.tracks[type].find(c => time >= c.startTime && time <= c.endTime);
        
        return clip ? { clip, type } : null;
    }

    // 2. イベントハンドリング
    handleMouseDown(e) {
        const rect = this.timeline.containers.tracks.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hit = this.findClipAt(x, y);
        if (hit) {
            this.targetClip = hit.clip;
            this.targetTrackType = hit.type;
            this.activeAction = 'move'; // 将来的にはここで端をクリックしたか判定し 'resize' に分岐
            
            this.initialState = {
                startTime: this.targetClip.startTime,
                endTime: this.targetClip.endTime,
                mouseX: x
            };
        }
    }

    handleMouseMove(e) {
        if (!this.activeAction || !this.targetClip) return;

        const rect = this.timeline.containers.tracks.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        const deltaX = x - this.initialState.mouseX;
        const deltaTime = deltaX / this.timeline.magnification;

        let nextStartTime = this.initialState.startTime + deltaTime;
        let nextEndTime = this.initialState.endTime + deltaTime;

        // --- バリデーション（将来の衝突判定などもここに追加） ---
        // 0秒以下にならないように制限
        if (nextStartTime < 0) {
            nextEndTime -= nextStartTime;
            nextStartTime = 0;
        }

        // モデルの更新
        this.targetClip.startTime = nextStartTime;
        this.targetClip.endTime = nextEndTime;

        // UIの即時描画（エンジン側への重い同期は行わず、描画のみ更新）
        this.timeline.update();
    }

    handleMouseUp() {
        if (this.targetClip) {
            // 操作確定イベントcommitを発行する
            this.timeline.dispatchEvent(new CustomEvent("commit", { 
                detail: { type: this.targetTrackType } 
            }));
        }
        this.activeAction = null;
        this.targetClip = null;
    }
}