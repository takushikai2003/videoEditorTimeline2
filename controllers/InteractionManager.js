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


    findActionAt(x, y, clip, type) {
        const edgeThreshold = 10; // 端から10px以内をリサイズ領域とする
        const startPx = this.timeline.timeToPx(clip.startTime);
        const endPx = this.timeline.timeToPx(clip.endTime);

        if (x <= startPx + edgeThreshold) return 'resize-start';
        if (x >= endPx - edgeThreshold) return 'resize-end';
        return 'move';
    }

    handleMouseDown(e) {
        const rect = this.timeline.timelineTracks.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hit = this.findClipAt(x, y);

        if (hit) {
            this.targetClip = hit.clip;
            this.targetTrackType = hit.type;
            // 端の判定を行い、アクションを決定
            this.activeAction = this.findActionAt(x, y, hit.clip, hit.type);
            
            this.initialState = {
                startTime: this.targetClip.startTime,
                endTime: this.targetClip.endTime,
                // Video/Audioの場合は相対時間も保持
                relativeStartTime: this.targetClip.relativeStartTime || 0,
                relativeEndTime: this.targetClip.relativeEndTime || 0,
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

    handleMouseMove(e) {
        if (!this.activeAction || !this.targetClip) return;

        const rect = this.timeline.timelineTracks.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const deltaTime = (x - this.initialState.mouseX) / this.timeline.magnification;

        const isVideoOrAudio = this.targetTrackType === 'video' || this.targetTrackType === 'audio';

        if (this.activeAction === 'move') {
            let nextStartTime = this.initialState.startTime + deltaTime;
            let nextEndTime = this.initialState.endTime + deltaTime;

            // 0秒以下にならないように制限
            if (nextStartTime < 0) {
                nextEndTime -= nextStartTime;
                nextStartTime = 0;
            }

            // モデルの更新
            this.targetClip.startTime = nextStartTime;
            this.targetClip.endTime = nextEndTime;
        } 
        else if (this.activeAction === 'resize-start') {
            let newStartTime = this.initialState.startTime + deltaTime;
            
            if (isVideoOrAudio) {
                // 素材の開始点（0）より前には広げられない
                let newRelativeStart = this.initialState.relativeStartTime + deltaTime;
                if (newRelativeStart < 0) {
                    newRelativeStart = 0;
                    newStartTime = this.initialState.startTime - this.initialState.relativeStartTime;
                }
                this.targetClip.relativeStartTime = newRelativeStart;
            }
            // startTimeがendTimeを超えないように制約
            this.targetClip.startTime = Math.min(newStartTime, this.targetClip.endTime - 0.1);
        } 
        else if (this.activeAction === 'resize-end') {
            // --- 右端リサイズ ---
            let newEndTime = this.initialState.endTime + deltaTime;

            if (isVideoOrAudio) {
                // 素材の最大長 (mediaDuration) を超えない制約
                let newRelativeEnd = this.initialState.relativeEndtime + deltaTime;
                if (newRelativeEnd > this.targetClip.mediaDuration) {
                    newRelativeEnd = this.targetClip.mediaDuration;
                    newEndTime = this.initialState.endTime + (this.targetClip.mediaDuration - this.initialState.relativeEndtime);
                }
                this.targetClip.relativeEndtime = newRelativeEnd;
            }

            // 常に endTime > startTime を維持
            this.targetClip.endTime = Math.max(newEndTime, this.targetClip.startTime + 0.1);
        }

        this.timeline.update();
    }

    handleMouseUp() {
        if (this.targetClip) {
            // 操作確定イベントcommitを発行する
            this.timeline.dispatchEvent(new CustomEvent("commit", { 
                detail: { 
                    trackType: this.targetTrackType,
                    targetClip: this.targetClip,
                } 
            }));
        }
        this.activeAction = null;
        this.targetClip = null;
    }
}