export class TrackInteractionHandler {
    constructor(timeline) {
        this.timeline = timeline;
        this.canvas = timeline.timelineTracks.canvas;
        this.activeAction = null; // 'move', 'resize-start', 'resize-end' など
        this.targetClip = null;
        this.initialState = null; // 操作開始時のクリップのStartTimeなどを保持

        // ドラッグ開始時の状態を保持（誤差の蓄積を防ぐ）
        this.initialState = {
            startTime: 0,
            endTime: 0,
            mouseX: 0
        };
    }


    // どのトラックのどのクリップがクリックされたかを特定する
    findClipAt(x, y) {
        // トラックの高さ（this.timeline.trackHeight）から、どのトラック種類か判定
        // 例: 0-50pxならビデオ, 50-100pxならオーディオ...
        const trackTypes = ["video", "audio", "effect"];
        const trackIndex = Math.floor(y / this.timeline.trackHeight);
        const type = trackTypes[trackIndex];

        if (!type || !this.timeline.tracks[type]){
            // console.error("track not found");
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
        const rect = this.canvas.getBoundingClientRect();
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
                mouseX: x
            };
        }
    }


    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!this.activeAction || !this.targetClip){
            // --- ホバー中（非ドラッグ時）のカーソル判定 ---
            const hit = this.findClipAt(x, y);
            if (hit) {
                // ヒットテストを行い、端か中央かを判定
                const action = this.findActionAt(x, y, hit.clip, hit.type);

                if (action === 'resize-start' || action === 'resize-end') {
                    this.canvas.style.cursor = 'ew-resize'; // 左右リサイズ
                } else {
                    this.canvas.style.cursor = 'grab'; // 移動可能
                }
            } else {
                this.canvas.style.cursor = 'default'; // 何もない場所
            }
            return;
        }


        const deltaTime = (x - this.initialState.mouseX) / this.timeline.magnification;

        const isVideoOrAudio = this.targetTrackType === 'video' || this.targetTrackType === 'audio';

        // --- 衝突判定の適用 ---
        let nextStartTime = this.initialState.startTime + deltaTime;
        let nextEndTime = this.initialState.endTime + deltaTime;
        // const obstacle = this.checkCollision(nextStartTime, nextEndTime);


        if (this.activeAction === 'move') {
            this.canvas.style.cursor = 'grabbing';
            // let nextStartTime = this.initialState.startTime + deltaTime;
            // let nextEndTime = this.initialState.endTime + deltaTime;

            // 0秒以下にならないように制限
            if (nextStartTime < 0) {
                nextEndTime -= nextStartTime;
                nextStartTime = 0;
            }

            // モデルの更新
            this.targetClip.startTime = nextStartTime;
            this.targetClip.endTime = nextEndTime;
        }
        else if (this.activeAction === 'resize-start' || this.activeAction === 'resize-end') {
            this.canvas.style.cursor = 'ew-resize';
            this.processResize(deltaTime, isVideoOrAudio);
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


    /**
     * 移動処理：衝突検知と入れ替え（スワップ）ロジック
     */
    processMove(deltaTime, trackClips) {
        let nextStartTime = this.initialState.startTime + deltaTime;
        const duration = this.initialState.endTime - this.initialState.startTime;

        // 0秒以下にならない制限
        if (nextStartTime < 0) nextStartTime = 0;
        let nextEndTime = nextStartTime + duration;

        // 仮の状態で衝突判定用オブジェクトを作成
        const ghost = { startTime: nextStartTime, endTime: nextEndTime };

        // 衝突している相手を探す
        const obstacle = trackClips.find(other =>
            other !== this.targetClip && this.isCollision(ghost, other)
        );

        if (obstacle) {
            const draggedMid = nextStartTime + (duration / 2);
            const obstacleDuration = obstacle.endTime - obstacle.startTime;
            const obstacleMid = obstacle.startTime + (obstacleDuration / 2);

            // 中心点を超えたら入れ替え（スワップ）を実行
            if (nextStartTime > this.initialState.startTime) { // 右移動中
                if (draggedMid > obstacleMid) {
                    obstacle.startTime = nextStartTime - obstacleDuration;
                    obstacle.endTime = nextStartTime;
                } else {
                    nextStartTime = obstacle.startTime - duration;
                    nextEndTime = obstacle.startTime;
                }
            } else { // 左移動中
                if (draggedMid < obstacleMid) {
                    obstacle.startTime = nextEndTime;
                    obstacle.endTime = nextEndTime + obstacleDuration;
                } else {
                    nextStartTime = obstacle.endTime;
                    nextEndTime = obstacle.endTime + duration;
                }
            }
        }

        this.targetClip.startTime = nextStartTime;
        this.targetClip.endTime = nextEndTime;
    }

    // Clamp one delta so timeline and source positions stay in sync.
    processResize(deltaTime, isVideoOrAudio) {
        const { startTime, endTime, relativeStartTime } = this.initialState;
        const minDuration = Math.min(0.1, endTime - startTime);

        if (this.activeAction === 'resize-start') {
            let minDelta = -startTime;
            if (isVideoOrAudio) {
                minDelta = Math.max(minDelta, -relativeStartTime);
            }
            const maxDelta = endTime - startTime - minDuration;
            const appliedDelta = Math.max(minDelta, Math.min(deltaTime, maxDelta));
            this.targetClip.startTime = startTime + appliedDelta;
            if (isVideoOrAudio) {
                this.targetClip.relativeStartTime = relativeStartTime + appliedDelta;
            }
        } else if (this.activeAction === 'resize-end') {
            const minDelta = startTime + minDuration - endTime;
            const relativeEndTime = relativeStartTime + endTime - startTime;
            const maxDelta = isVideoOrAudio
                ? this.targetClip.mediaDuration - relativeEndTime
                : Infinity;
            const appliedDelta = Math.max(minDelta, Math.min(deltaTime, maxDelta));
            this.targetClip.endTime = endTime + appliedDelta;
        }
    }


    /**
     * クリップ同士の衝突を判定する（提供された isCollisionX をクラスメソッド化）
     */
    isCollision(clip1, clip2) {
        if (!clip1 || !clip2) return false;
        // 提供されたロジック: (1の開始 <= 2の開始 かつ 1の終了 >= 2の開始) OR (2の開始 <= 1の開始 かつ 2の終了 >= 1の開始)
        // 実装を Clip モデルのプロパティ (startTime, endTime) に合わせて最適化
        return (clip1.startTime < clip2.endTime && clip1.endTime > clip2.startTime);
    }


    // 同じトラック内の「自分以外のクリップ」を走査し、時間が重なっているものを特定
    checkCollision(nextStartTime, nextEndTime) {
        const trackClips = this.timeline.tracks[this.targetTrackType];

        // 衝突相手を特定
        return trackClips.find(other => {
            if (other === this.targetClip) return false; // 自分自身は除外

            // 衝突条件：(自分の開始 < 相手の終了) かつ (自分の終了 > 相手の開始)
            return nextStartTime < other.endTime && nextEndTime > other.startTime;
        });
    }
}
