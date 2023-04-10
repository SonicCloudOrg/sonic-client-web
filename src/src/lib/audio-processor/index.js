/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * 音频接受处理器
 */
import JMuxer from 'jmuxer';
import Socket from './socket';

const DEFAULT_WS_URL = 'ws://localhost:8080';

export default class AudioProcessor {
  constructor(options) {
    const wsUrl = options.wsUrl || DEFAULT_WS_URL;
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
      ...options,
    });
    this.audioDom = document.getElementById(options.node);
    this.initWebSocket(wsUrl);
  }

  initWebSocket(url) {
    const that = this;
    this.ws = new Socket({
      url,
      binaryType: 'arraybuffer',
      isErrorReconnect: false,
      onmessage(event) {
        const data = that.parse(event.data);
        data && that.jmuxer.feed(data);
      },
    });
  }

  /**
   * 音频解析
   * @param {*} data AAC Buffer 视频流
   * @returns
   */
  parse(data) {
    const input = new Uint8Array(data);

    return {
      audio: input,
    };
  }

  onPlay() {
    this.audioDom.load();
    const playPromise = this.audioDom.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.audioDom.play();
      });
    }
  }

  onPause() {
    this.audioDom.pause();
  }

  onReload() {
    this.audioDom.load();
  }

  onDestroy() {
    this.ws.handleClose();
    this.audioDom.pause();
    this.jmuxer.destroy();
  }
}
