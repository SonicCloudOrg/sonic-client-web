import JMuxer from 'jmuxer';

class Scrcpy {
  // 构造
  constructor(props) {
    const {
      excuteMode, // 运行模式
    } = props;
    this.props = props;
    this.excuteMode = excuteMode;
    //
    this.initial(props)
    //
    this.websocketInit(props);
  }

  cmdFN(cmd) {
    if (cmd.msg == 'size') {
      console.log('初始化成功: size: ' + cmd.width + ',' + cmd.height);
      this.isInit = true;
    }
  }
  initial(props){
    // 初始化播放器
    if (!this.jmuxer && this.excuteMode == 'Scrcpy') {
      const {
        node, // video dom节点
      } = props;
      this.jmuxer = new JMuxer({
        node: node || 'player',
        mode: 'video',
        flushingTime: 16.6,
        fps: 60,
        // readFpsFromTrack: true,
        debug: false,
      });
    }
  }
  websocketInit(props){
    if (!this.websocket) {
      const {
        socketURL,
        onmessage,
      } = props;
      this.websocket = new WebSocket(socketURL);
      this.websocket.binaryType = 'arraybuffer';
      this.websocket.addEventListener('message', (event) => {
        if (typeof event.data == 'string') {
          this.cmdFN(JSON.parse(event.data));
          onmessage && onmessage(event);
        } else if (typeof event.data == 'object' && this.excuteMode == 'Scrcpy') {
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
          }),
        )
      });
    }
  }
  switchMode = (mode) => {
    this.excuteMode = mode;
    this.initial(this.props);
    this.websocket.send(
      JSON.stringify({
        type: 'switch',
        detail: this.excuteMode.toLowerCase(),
      }),
    )
    if (mode !== 'Scrcpy') {
      // 重置播放器
      this.jmuxer && this.jmuxer.reset()
    }
  }
  destroy(){
    this.jmuxer && this.jmuxer.destroy();
  }
}

export default Scrcpy;
