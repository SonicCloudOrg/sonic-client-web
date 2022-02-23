/**
 * 音频接受处理器
 */
import JMuxer from 'jmuxer';
import Socket from './socket';

const DEFAULT_WS_URL = 'ws://localhost:8080';

export default class AudioProcessor {
	constructor(options) {
    const wsUrl = options.wsUrl || DEFAULT_WS_URL
		/**
		 * node: 'player',
		 * mode: 'audio',
		 * debug: true,
		 * flushingTime: 0,
     * wsUrl
		 */
		this.jmuxer = new JMuxer({
      mode: 'audio',
      flushingTime: 0,
      // onReady() {
			// 	console.log('Jmuxer audio init onReady!');
      // },
			// onError(data) {
			// 	console.error('Buffer error encountered', data);
			// },
			...options
		});
		this.audioDom = document.getElementById(options.node)
		this.initWebSocket(wsUrl)
	}

	initWebSocket(url) {
		const that = this
		this.ws = new Socket({
			url,
			binaryType: 'arraybuffer',
      isErrorReconnect: false,
			onmessage: function(event) {
				var data = that.parse(event.data);
				data && that.jmuxer.feed(data);
			}
		});
	}

	/**
	 * 音频解析
	 * @param {*} data AAC Buffer 视频流
	 * @returns 
	 */
	parse(data) {
		let input = new Uint8Array(data)

		return {
			audio: input
		};
	}

	onPlay() {
    this.audioDom.load()
    const playPromise = this.audioDom.play()
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.audioDom.play()
      })
    }
	}

	onPause() {
		this.audioDom.pause()
	}

	onReload() {
		this.audioDom.load()
	}

  onDestroy() {
    this.ws.handleClose()
    this.audioDom.pause()
    this.jmuxer.destroy()
  }
}