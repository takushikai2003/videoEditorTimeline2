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
                relativeEndTime: this.targetClip.relativeEndTime || 0,
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
        else if (this.activeAction === 'resize-start') {
            this.canvas.style.cursor = 'ew-resize';

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
        // --- 右端リサイズ ---
        else if (this.activeAction === 'resize-end') {
            this.canvas.style.cursor = 'ew-resize';

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

    /**
     * リサイズ処理：素材の長さ制限と衝突時の停止
     */
    processResize(deltaTime, isVideoOrAudio, trackClips) {
        if (this.activeAction === 'resize-start') {
            let newStartTime = this.initialState.startTime + deltaTime;
            
            // Video/Audioの素材範囲制限
            if (isVideoOrAudio) {
                let newRelativeStart = this.initialState.relativeStartTime + deltaTime;
                if (newRelativeStart < 0) {
                    newRelativeStart = 0;
                    newStartTime = this.initialState.startTime - this.initialState.relativeStartTime;
                }
                this.targetClip.relativeStartTime = newRelativeStart;
            }

            // 衝突判定：左側のクリップにぶつかったら止める
            const obstacle = trackClips.find(other => 
                other !== this.targetClip && newStartTime < other.endTime && this.targetClip.endTime > other.startTime
            );
            if (obstacle) newStartTime = obstacle.endTime;

            this.targetClip.startTime = Math.min(newStartTime, this.targetClip.endTime - 0.1);

        } else if (this.activeAction === 'resize-end') {
            let newEndTime = this.initialState.endTime + deltaTime;

            // Video/Audioの素材範囲制限
            if (isVideoOrAudio) {
                let newRelativeEnd = this.initialState.relativeEndtime + deltaTime;
                if (newRelativeEnd > this.targetClip.mediaDuration) {
                    newRelativeEnd = this.targetClip.mediaDuration;
                    newEndTime = this.initialState.endTime + (this.targetClip.mediaDuration - this.initialState.relativeEndtime);
                }
                this.targetClip.relativeEndtime = newRelativeEnd;
            }

            // 衝突判定：右側のクリップにぶつかったら止める
            const obstacle = trackClips.find(other => 
                other !== this.targetClip && this.targetClip.startTime < other.endTime && newEndTime > other.startTime
            );
            if (obstacle) newEndTime = obstacle.startTime;

            this.targetClip.endTime = Math.max(newEndTime, this.targetClip.startTime + 0.1);
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