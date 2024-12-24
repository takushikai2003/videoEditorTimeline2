// JSDoc用の型を定義するだけ。
// d.tsファイルとかに置いたほうがいいかも？

/**
 * @typedef Timeline
 * @property {Playhead} playhead
 * @property {TimelineTrack[]} tracks
 * @property {number} magnification セッターにより自動で描画更新される
 * @property {TimeScale} timeScale
 * @method movePlayheadByTime
 * @method addTrack
 * @method xToTime
 * @method refresh
 * 
 */


/**
 * @typedef Playhead
 * @extends EvetntTarget
 * 
 * @property {number} time
 * @property {HTMLElement} element
 * @property {Timeline} timeline
 * 
 * @method moveByTime
 * @method moveByX
 * 
 * @event Playhead#progressChanged
 */



/**
 * @typedef TimeScaleHeader
 * @property {HTMLDivElement} element
 */


/**
 * @typedef TimeScale
 * @property {HTMLCanvasElement} canvas
 * @property {Timeline} timeline
 * @property {number} width
 * @property {number} height
 * @method refresh
 */


/**
 * @typedef TrackHeader
 * @extends EventTarget
 * 
 * @property {string} trackName
 * @property {HTMLElement} element
 * @event TrackHeader#click
 */


/**
 * @typedef TimelineTrack
 * @extends EventTarget
 * 
 * @property {TimelineClip[]} tclips
 * @property {TrackHeader} header
 * @property {Timeline} timeline
 * @property {HTMLCanvasElement} canvas
 * @property {HTMLCanvasContext2D} ctx
 * @property {number} width
 * @property {number} height
 * @property {Object} config
 * @property {TimelineClip | null} targetClip
 * 
 * @method addClip
 * @method refresh
 * @method splitClip
 * @method deleteClip
 * 
 * @event TimelineTrack#clipBlur
 * @event TimelineTrack#clipSelect
 * @event TimelineTrack#pointerDown
 */



/**
 * 外部から入力されるクリップ
 * @typedef Clip
 * @property {string} text
 * @property {number} startTime
 * @property {number} endTime
 * @property {number} relativeStartTime
 * @property {number} relativeEndTime
*/


/**
 * タイムライン内部でのクリップ
 * @typedef TimelineClip
 * @extends EventTarget
 * 
 * @property {string} text
 * @property {number} startTime
 * @property {number} relativeStartTime
 * @property {number} relativeEndTime
 * @property {string} middleColor
 * @property {number} [endTime]
 * 
 * @property {number} duration
 * @property {boolean} target
 * @property {string} middleColor
 * 
 * @method update
 * @method duplicate
 * 
 * @event TimelineClip#select
 * @event TimelineClip#change
 * 
*/