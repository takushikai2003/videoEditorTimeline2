// クリップの基本クラス
export class Clip {
    constructor({ name, startTime, duration, color }) {
        this.name = name; // 表示名
        this.startTime = startTime;
        this.endTime = startTime + duration;
        this.color = color;
    }

    // 内部データを出力
    getInternalData() {
        return {
            id: this.id,
            startTime: this.startTime,
            endTime: this.endTime,
            color: this.color,
        };
    }
}

// ビデオトラック用（relativeStartTime や gain を保持）
export class VideoClip extends Clip {
    constructor(data) {
        super(data);
        this.mediaId = data.mediaId;
        this.relativeStartTime = data.relativeStartTime || 0;
        this.gain = data.gain || 1;

        // デフォルト色の設定
        this.color = data.color || "#4a90e2";
    }

    getInternalData() {
        return {
            ...super.getInternalData(),
            mediaId: this.mediaId,
            relativeStartTime: this.relativeStartTime,
            gain: this.gain
        };
    }
}

// オーディオトラック用（relativeStartTime や gain を保持）
export class AudioClip extends Clip {
    constructor(data) {
        super(data);
        this.mediaId = data.mediaId;
        this.relativeStartTime = data.relativeStartTime || 0;
        this.gain = data.gain || 1;

        // デフォルト色の設定
        this.color = data.color || "#2ecc71";
    }

    getInternalData() {
        return {
            ...super.getInternalData(),
            mediaId: this.mediaId,
            relativeStartTime: this.relativeStartTime,
            gain: this.gain
        };
    }
}

// エフェクトトラック用
export class EffectClip extends Clip {
    constructor(data) {
        super(data);
        this.effectId = data.effectId;
        this.effectParams = data.effectParams; // エフェクトの内部パラメータ（文字の色など）

        // デフォルト色の設定
        this.color = data.color || "#e6bd1a";
    }

    getInternalData() {
        return {
            ...super.getInternalData(),
            effectId: this.effectId,
            effectParams: this.effectParams,
        };
    }
}

// 仮
// キーフレーム用（トラックはEffectと同じになる？）
export class KeyframeEffectClip extends Clip {
    constructor(data) {
        super(data);

        this.keyframes = data.keyframes;

        // デフォルト色の設定
        this.color = data.color || "#9b59b6";
    }

    getInternalData() {
        return {
            ...super.getInternalData(),
            keyframes: this.keyframes,
        };
    }
}