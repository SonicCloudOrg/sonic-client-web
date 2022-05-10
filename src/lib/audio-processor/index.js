/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
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