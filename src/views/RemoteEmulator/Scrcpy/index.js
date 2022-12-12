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
import JMuxer from 'jmuxer';

class Scrcpy {
  // 构造
  constructor(props) {
    const {
      excuteMode, // 运行模式
    } = props;
    this.props = props;
    this.excuteMode = excuteMode;
    // JMuxer初始化
    this.initial(props);
    // websocket初始化
    this.websocketInit(props);
    // 监听页面激活状态
    this.onPageFocus();
  }

  cmdFN(cmd) {
    if (cmd.msg == 'size') {
      console.log(`init size: ${cmd.width},${cmd.height}`);
      this.isInit = true;
    }
  }

  initial(props) {
    // 初始化播放器
    if (!this.jmuxer && this.excuteMode == 'Scrcpy') {
      const {
        node, // video dom节点
      } = props;
      this.jmuxer = new JMuxer({
        node: node || 'player',
        mode: 'video',
        flushingTime: 0,
        fps: 60,
        // readFpsFromTrack: true,
        debug: false,
      });
    }
  }

  websocketInit(props) {
    if (!this.websocket) {
      const { socketURL, onmessage } = props;
      this.websocket = new WebSocket(socketURL);
      this.websocket.binaryType = 'arraybuffer';
      this.websocket.addEventListener('message', (event) => {
        if (typeof event.data === 'string') {
          this.cmdFN(JSON.parse(event.data));
          onmessage && onmessage(event);
        } else if (
          typeof event.data === 'object' &&
          this.excuteMode == 'Scrcpy'
        ) {
          // console.log('feed!', this.excuteMode);
          this.jmuxer.feed({
            video: new Uint8Array(event.data),
          });
        } else {
          onmessage && onmessage(event);
        }
      });
      this.websocket.addEventListener('error', (e) => {
        console.log('Socket Error');
        const { onclose } = props;
        onclose && onclose(e);
      });
      this.websocket.addEventListener('open', (e) => {
        // console.log('open!!', e);
        this.websocket.send(
          JSON.stringify({
            type: 'switch',
            detail: this.excuteMode.toLowerCase(),
          })
        );
      });
    }
  }

  switchMode = (mode) => {
    this.excuteMode = mode;
    this.destroy();
    this.initial(this.props);
    this.websocket.send(
      JSON.stringify({
        type: 'switch',
        detail: this.excuteMode.toLowerCase(),
      })
    );
    if (mode !== 'Scrcpy') {
      // 重置播放器
      this.jmuxer && this.jmuxer.reset();
    }
  };

  destroy() {
    this.jmuxer && this.jmuxer.destroy();
    // 释放内存
    this.jmuxer = null;
    window.onfocus = null;
  }

  onPageFocus() {
    const videoDom = document.getElementById(this.props?.node || 'player');
    window.onfocus = function () {
      // 将当前播放进度更新至当前最新缓冲时间
      videoDom.currentTime = Math.ceil(videoDom.buffered.end(0));
    };
  }
}

export default Scrcpy;
