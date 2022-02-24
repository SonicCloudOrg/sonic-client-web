<script setup>
import {useRoute, useRouter} from 'vue-router';
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useStore} from 'vuex';
import axios from '@/http/axios';
import {ElMessage} from 'element-plus';
import useClipboard from 'vue-clipboard3';
import StepList from '@/components/StepList.vue';
import TestCaseList from '@/components/TestCaseList.vue';
import StepLog from '@/components/StepLog.vue';
import ElementUpdate from '@/components/ElementUpdate.vue';
import Pageable from '@/components/Pageable.vue'
import defaultLogo from '@/assets/logo.png';
import {
  VideoPause,
  Refresh,
  Connection,
  Delete,
  Place,
  Download,
  Search,
  SwitchButton,
  Position,
  Pointer,
  Camera,
  Sunny,
  Phone,
  PhoneFilled,
  Minus,
  MuteNotification,
  Plus,
  CaretRight,
  CaretLeft,
  Operation,
  Cellphone,
  Menu,
  CopyDocument,
  House,
  Back,
  View,
  InfoFilled,
  Bell,
  Service
} from '@element-plus/icons';
import RenderDeviceName from "../../components/RenderDeviceName.vue";
import AudioProcessor from '@/lib/audio-processor'

const {toClipboard} = useClipboard();
const route = useRoute();
const store = useStore();
const router = useRouter();
const filterAppText = ref("")
const iFrameHeight = ref(0);
const terminalHeight = ref(0);
const caseList = ref(null);
const loading = ref(false);
const appList = ref([]);
const device = ref({});
const agent = ref({});
const screenUrls = ref([])
const uploadUrl = ref('');
const text = ref({content: ''});
let imgWidth = 0;
let imgHeight = 0;
// 旋转状态 // 0 90 180 270
let directionStatus = {
  value: -1,
  // calcMap: {
  //   0: 1,
  //   90: 1,
  //   180: 1,
  //   270: -1,
  // }
};
let moveX = 0;
let moveY = 0;
let isFixTouch = false;
let isPress = false;
let loop = null;
let time = 0;
let isLongPress = false;
// let isRotated = 0; // 是否转向 // 0 90 180 270
let mouseMoveTime = 0;
const pic = ref('高');
const elementLoading = ref(false);
const isShowImg = ref(false);
const isDriverFinish = ref(false);
const imgUrl = ref('');
const activity = ref('');
const webViewData = ref([]);
const isShowTree = ref(false);
const elementData = ref([]);
const elementDetail = ref(null);
const elementScreenLoading = ref(false);
const tree = ref(null);
const currentId = ref([]);
const filterText = ref('');
const project = ref(null);
const testCase = ref({});
const activeTab = ref('main');
const activeTab2 = ref('step');
const stepLog = ref([]);
const debugLoading = ref(false);
const dialogElement = ref(false);
const dialogImgElement = ref(false);
const imgElementUrl = ref(null);
const updateImgEle = ref(null);
const webViewListDetail = ref([]);
const chromePort = ref(0);
const isWebView = ref(true);
const iframeUrl = ref('');
const title = ref('');
const webViewLoading = ref(false);
const cmdInput = ref('');
const cmdOutPut = ref([]);
const cmdUser = ref('');
const logcatOutPut = ref([]);
const terScroll = ref(null);
const logcatScroll = ref(null);
const cmdIsDone = ref(true);
const uploadLoading = ref(false);
const remoteAdbUrl = ref("");
const logcatFilter = ref({
  level: 'E',
  filter: '',
});
let oldBlob = undefined;
const element = ref({
  id: null,
  eleName: '',
  eleType: 'image',
  eleValue: '',
  projectId: 0,
});
const computedCenter = (b1, b2) => {
  let x1 = b1.substring(0, b1.indexOf(','));
  let y1 = b1.substring(b1.indexOf(',') + 1);
  let x2 = b2.substring(0, b2.indexOf(','));
  let y2 = b2.substring(b2.indexOf(',') + 1);
  let x = parseInt((parseInt(x2) + parseInt(x1)) / 2);
  let y = parseInt((parseInt(y1) + parseInt(y2)) / 2);
  return x + ',' + y;
};
const switchTabs = (e) => {
  if (e.props.name === 'apps') {
    if (appList.value.length === 0) {
      refreshAppList()
    }
  }
  if (e.props.name === 'terminal') {
    terminalHeight.value = document.getElementById('pressKey').offsetTop - 200;
  }
  if (e.props.name === 'webview') {
    if (webViewListDetail.value.length === 0) {
      getWebViewForward();
    }
  }
};
const img = import.meta.globEager('../../assets/img/*');
let websocket = null;
let terminalWebsocket = null;

defineProps({
  tabPosition: String,
  canvasRectInfo: Object,
  layoutSplitInfo: Object,
  isSplitPressing: Boolean,
  lineMouseup: Function,
  lineMousemove: Function,
  lineMousedown: Function,
  lineMouseleave: Function,
});

const tabWebView = (port, id, transTitle) => {
  title.value = transTitle;
  isWebView.value = false;
  iframeUrl.value =
      'http://' + agent.value['host'] + ':' + chromePort.value
      + '/devtools/inspector.html?ws=' + agent.value['host']
      + ':' + agent.value['port'] + '/websockets/webView/'
      + agent.value['secretKey'] + '/' + port + '/' + id;
  nextTick(() => {
    iFrameHeight.value = document.getElementById('pressKey').offsetTop - 50;
  });
};
const saveEle = () => {
  updateImgEle['value'].validate((valid) => {
    if (valid) {
      element.value.eleValue = imgElementUrl.value;
      element.value.projectId = project.value['id'];
      axios.put('/controller/elements', element.value)
          .then((resp) => {
            if (resp['code'] === 2000) {
              ElMessage.success({
                message: resp['message'],
              });
              dialogImgElement.value = false;
            }
          });
    }
  });
};
/**
 * app列表处理
 */
const appListPageData = ref([]);
const currAppListPageIndex = ref(0);
const currAppListPageData = ref([]);
// 转换分页数组
const transformPageable = (data) => {
  const pageSize = 7;
  const len = data.length;
  let start = 0;
  let end = pageSize;
  // 重置分页数组
  appListPageData.value = [];
  while (end <= len) {
    appListPageData.value.push(data.slice(start, end));
    start = end;
    end += pageSize;
  }
  if (len % pageSize) {
    appListPageData.value.push(data.slice(start, len));
  }
  currAppListPageData.value = appListPageData.value[currAppListPageIndex.value];
}
const changeAppListPage = (pageNum) => {
  currAppListPageIndex.value = pageNum - 1;
  currAppListPageData.value = appListPageData.value[currAppListPageIndex.value];
}
const filterTableData = computed(() => {
  const list = appList.value.filter(
      (data) =>
          !filterAppText.value ||
          data.appName.toLowerCase().includes(filterAppText.value.toLowerCase()) ||
          data.packageName.toLowerCase().includes(filterAppText.value.toLowerCase())
  )
  transformPageable(list);
  return list;
})
const fixTouch = () => {
  ElMessage.success({
    message: '修复成功！',
  });
  isFixTouch = !isFixTouch;
};
const switchIsWebView = () => {
  isWebView.value = true;
};
const selectCase = (val) => {
  ElMessage.success({
    message: '关联成功！',
  });
  testCase.value = val;
};
const removeCase = () => {
  testCase.value = {};
};
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu';
  }
  try {
    result = img['../../assets/img/' + name + '.jpg'].default;
  } catch {
    result = img['../../assets/img/unName.jpg'].default;
  }
  return result;
};
watch(filterText, (newValue, oldValue) => {
  tree['value'].filter(newValue);
});
const filterNode = (value, data) => {
  if (!value) return true;
  return (data.label.indexOf(value) !== -1) ||
      (data.detail['resource-id'] ? data.detail['resource-id'].indexOf(value) !== -1 : false);
};
const findBestXpath = (elementDetail) => {
  let result = []
  if (elementDetail['resource-id']) {
    result.push('//' + elementDetail['class']
        + '[@resource-id=\'' + elementDetail['resource-id'] + '\']');
  }
  if (elementDetail['text']) {
    result.push('//' + elementDetail['class']
        + '[@text=\'' + elementDetail['text'] + '\']');
    result.push('//' + elementDetail['class']
        + '[contains(@text,\'' + elementDetail['text'] + '\')]');
  }
  if (elementDetail['content-desc']) {
    result.push('//' + elementDetail['class']
        + '[@content-desc=\'' + elementDetail['content-desc'] + '\']');
    result.push('//' + elementDetail['class']
        + '[contains(@content-desc,\'' + elementDetail['content-desc'] + '\')]');
  }
  return result;
}
const downloadImg = (url) => {
  let time = new Date().getTime();
  let link = document.createElement('a');
  fetch(url).then(res => res.blob()).then(blob => {
    link.href = URL.createObjectURL(blob);
    link.download = time + ".jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })
};
const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: '复制成功！',
    });
  } catch (e) {
    ElMessage.error({
      message: '复制失败！',
    });
  }
};
const removeScreen = () => {
  screenUrls.value = [];
}
const quickCap = () => {
  if (oldBlob) {
    const img = new Image();
    const blob = new Blob([oldBlob], {type: 'image/jpeg'});
    const URL = window.URL || window.webkitURL;
    const u = URL.createObjectURL(blob);
    screenUrls.value.push(u);
    img.src = u;
  } else {
    ElMessage.error({
      message: '快速截图失败！',
    });
  }
}
const setImgData = (data) => {
  const img = new Image();
  if (data) {
    imgUrl.value = data;
    img.src = data;
  } else {
    const blob = new Blob([oldBlob], {type: 'image/jpeg'});
    const URL = window.URL || window.webkitURL;
    const u = URL.createObjectURL(blob);
    imgUrl.value = u;
    img.src = u;
  }
  const canvas = document.getElementById('debugPic');
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
  };
  isShowImg.value = true;
};
const openSocket = (host, port, udId, key) => {
  if ('WebSocket' in window) {
    websocket = new WebSocket(
        'ws://' + host + ':' + port + '/websockets/android/' + udId + '/' + key + '/' + localStorage.getItem('SonicToken'),
    );
    terminalWebsocket = new WebSocket(
        'ws://' + host + ':' + port + '/websockets/terminal/' + udId + '/' + key,
    );
  } else {
    console.error('不支持WebSocket');
  }
  websocket.onmessage = websocketOnmessage;
  websocket.onclose = (e) => {
  };
  terminalWebsocket.onmessage = terminalWebsocketOnmessage;
  terminalWebsocket.onclose = (e) => {
  };
};
const sendLogcat = () => {
  terminalWebsocket.send(
      JSON.stringify({
        type: 'logcat',
        level: logcatFilter.value.level,
        filter: logcatFilter.value.filter,
      }),
  );
};
const clearLogcat = () => {
  logcatOutPut.value = [];
};
const stopLogcat = () => {
  terminalWebsocket.send(
      JSON.stringify({
        type: 'stopLogcat',
      }),
  );
};
const sendCmd = () => {
  if (cmdInput.value.length > 0 && cmdIsDone.value === true) {
    cmdIsDone.value = false;
    cmdOutPut.value.push(JSON.parse(JSON.stringify(
        '<span style=\'color: #409EFF\'>' + cmdUser.value + '</span>:/ $ ' + cmdInput.value)));
    terminalWebsocket.send(
        JSON.stringify({
          type: 'command',
          detail: cmdInput.value,
        }),
    );
    cmdInput.value = '';
  }
};
const clearCmd = () => {
  cmdOutPut.value = [];
};
const stopCmd = () => {
  cmdIsDone.value = true;
  terminalWebsocket.send(
      JSON.stringify({
        type: 'stopCmd',
      }),
  );
};
const terminalWebsocketOnmessage = (message) => {
  switch (JSON.parse(message.data)['msg']) {
    case 'appListDetail': {
      appList.value.push(JSON.parse(message.data).detail)
      break;
    }
    case 'logcat':
      logcatOutPut.value.push('连接成功！');
      break;
    case 'logcatResp':
      logcatOutPut.value.push(
          JSON.parse(message.data)['detail']
              .replace(/ I /g, '<span style=\'color: #0d84ff\'> I </span>')
              .replace(/ V /g, '<span style=\'color: #0d84ff\'> I </span>')
              .replace(/ D /g, '<span style=\'color: #0d84ff\'> D </span>')
              .replace(/ W /g, '<span style=\'color: #E6A23C\'> W </span>')
              .replace(/ E /g, '<span style=\'color: #F56C6C\'> E </span>')
              .replace(/ F /g, '<span style=\'color: #F56C6C\'> F </span>'),
      );
      nextTick(() => {
        logcatScroll['value'].wrap.scrollTop =
            logcatScroll['value'].wrap.scrollHeight;
      });
      break;
    case 'terminal':
      cmdUser.value = JSON.parse(message.data)['user'];
      cmdOutPut.value.push('连接成功！');
      break;
    case 'terResp':
      cmdOutPut.value.push(JSON.parse(message.data)['detail']);
      nextTick(() => {
        terScroll['value'].wrap.scrollTop =
            terScroll['value'].wrap.scrollHeight;
      });
      break;
    case 'terDone':
      cmdIsDone.value = true;
      break;
    case 'error':
      ElMessage.error({
        message: '系统出现异常！已断开远程控制！',
      });
      close();
      router.go(-1);
      break;
  }
};
const websocketOnmessage = (message) => {
  if (typeof message.data === 'object') {
    oldBlob = message.data;
    const blob = new Blob([message.data], {type: 'image/jpeg'});
    const URL = window.URL || window.webkitURL;
    const img = new Image();
    const canvas = document.getElementById('canvas'),
        g = canvas.getContext('2d');
    img.onload = function () {
      // 不根据按钮组，使用数据源的分辨率点对点
      const width = img.width, height = img.height;
      canvas.width = width;
      canvas.height = height;
      g.drawImage(img, 0, 0, width, height);
    };
    const u = URL.createObjectURL(blob);
    img.src = u;
  } else {
    switch (JSON.parse(message.data)['msg']) {
      case 'adbkit': {
        if (JSON.parse(message.data).isEnable) {
          remoteAdbUrl.value = agent.value['host'] + ":" + JSON.parse(message.data).port
        }
        break;
      }
      case 'rotation': {
        if (directionStatus.value !== -1) {
          loading.value = true;
          ElMessage.success({
            message: '检测到屏幕旋转！请稍后...',
          });
        }
        directionStatus.value = JSON.parse(message.data).value; // TODO
        break;
      }
      case 'support': {
        ElMessage.error({
          message: JSON.parse(message.data).text,
        });
        loading.value = false;
        break;
      }
      case 'size': {
        imgWidth = JSON.parse(message.data).width;
        imgHeight = JSON.parse(message.data).height;
        loading.value = false;
        break;
      }
      case 'tree': {
        ElMessage.success({
          message: '获取控件元素成功！',
        });
        let result = JSON.parse(message.data);
        currentId.value = [1];
        elementData.value = result.detail;
        isShowTree.value = true;
        elementLoading.value = false;
        if (result.img) {
          setImgData(result.img);
        }
        webViewData.value = result['webView'];
        activity.value = result['activity'];
        break;
      }
      case 'treeFail': {
        ElMessage.error({
          message: '获取控件元素失败！请重新获取',
        });
        elementLoading.value = false;
        break;
      }
      case 'installFinish': {
        if (JSON.parse(message.data).status === 'success') {
          ElMessage.success({
            message: '安装成功！',
          });
        } else {
          ElMessage.error({
            message: '安装失败！',
          });
        }
        break;
      }
      case 'uninstallFinish': {
        if (JSON.parse(message.data).detail === 'success') {
          ElMessage.success({
            message: '卸载成功！',
          });
        } else {
          ElMessage.error({
            message: '卸载失败！',
          });
        }
        break;
      }
      case 'openDriver': {
        ElMessage({
          type: JSON.parse(message.data).status,
          message: JSON.parse(message.data).detail,
        });
        if (JSON.parse(message.data).status === 'success') {
          isDriverFinish.value = true;
        }
        break;
      }
      case 'picFinish': {
        loading.value = false;
        break;
      }
      case 'step': {
        setStepLog(JSON.parse(message.data));
        break;
      }
      case 'status': {
        debugLoading.value = false;
        ElMessage.info({
          message: '运行完毕！',
        });
        break;
      }
      case 'forwardView': {
        webViewLoading.value = false;
        ElMessage.success({
          message: '获取成功！',
        });
        webViewListDetail.value = JSON.parse(message.data)['detail'];
        chromePort.value = JSON.parse(message.data)['chromePort'];
        break;
      }
      case 'eleScreen': {
        if (JSON.parse(message.data).img) {
          ElMessage.success({
            message: '获取快照成功！',
          });
          imgElementUrl.value = JSON.parse(message.data)['img'];
          dialogImgElement.value = true;
        } else {
          ElMessage.error(JSON.parse(message.data)['errMsg']);
        }
        elementScreenLoading.value = false;
        break;
      }
      case 'error': {
        ElMessage.error({
          message: '系统出现异常！已断开远程控制！',
        });
        close();
        router.go(-1);
        break;
      }
    }
  }
};
const getCurLocation = () => {
  let x, y;
  let _x, _y;
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  if (directionStatus.value != 0 && directionStatus.value != 180) { // 左右旋转
    _x = parseInt(
        (event.clientY - rect.top) *
        (imgWidth / canvas.clientHeight),
    );
    x = (directionStatus.value == 90) ? imgWidth - _x : _x;
    //
    _y = parseInt(
        (event.clientX - rect.left) *
        (imgHeight / canvas.clientWidth),
    );
    y = (directionStatus.value == 270) ? imgHeight - _y : _y;
  } else {
    _x = parseInt(
        (event.clientX - rect.left) *
        (imgWidth / canvas.clientWidth),
    );
    x = (directionStatus.value == 180) ? imgWidth - _x : _x;
    //
    _y = parseInt(
        (event.clientY - rect.top) *
        (imgHeight / canvas.clientHeight),
    );
    y = (directionStatus.value == 180) ? imgHeight - _y : _y;
  }
  // console.log('xy', { x, y });
  return ({
    x, y
  })
}
const mouseup = (event) => {
  if (!isFixTouch) {
    if (isPress) {
      isPress = false;
      websocket.send(
          JSON.stringify({
            type: 'touch',
            detail: 'u 0\n',
          }),
      );
    }
  } else {
    clearInterval(loop);
    time = 0;
    const canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    let x;
    let y;
    x = parseInt(
        (event.clientX - rect.left) *
        (imgWidth / canvas.clientWidth),
    );
    y = parseInt(
        (event.clientY - rect.top) *
        (imgHeight / canvas.clientHeight),
    );
    if (moveX === x && moveY === y) {
      if (!isLongPress) {
        websocket.send(
            JSON.stringify({
              type: 'debug',
              detail: 'tap',
              point: x + ',' + y,
            }),
        );
      }
    } else {
      websocket.send(
          JSON.stringify({
            type: 'debug',
            detail: 'swipe',
            pointA: moveX + ',' + moveY,
            pointB: x + ',' + y,
          }),
      );
    }
    isLongPress = false;
  }
};
const mouseleave = () => {
  if (isFixTouch) {
    clearInterval(loop);
    isLongPress = false;
  } else {
    if (isPress) {
      isPress = false;
      websocket.send(
          JSON.stringify({
            type: 'touch',
            detail: 'u 0\n',
          }),
      );
    }
  }
};
const mousedown = (event) => {
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  if (!isFixTouch) { // 安卓高版本
    const {x, y} = getCurLocation();
    isPress = true;
    websocket.send(
        JSON.stringify({
          type: 'touch',
          detail: 'd 0 ' + x + ' ' + y + ' 50\n',
        }),
    );
  } else {
    moveX = parseInt(
        (event.clientX - rect.left) *
        (imgWidth / canvas.clientWidth),
    );
    moveY = parseInt(
        (event.clientY - rect.top) *
        (imgHeight / canvas.clientHeight),
    );
    clearInterval(loop);
    loop = setInterval(() => {
      time += 500;
      if (time >= 1000 && isLongPress === false) {
        websocket.send(
            JSON.stringify({
              type: 'debug',
              detail: 'longPress',
              point: moveX + ',' + moveY,
            }),
        );
        isLongPress = true;
      }
    }, 500);
  }
};
const mousemove = (event) => {
  if (!isFixTouch) {
    if (isPress) {
      if (mouseMoveTime < 2) {
        mouseMoveTime++;
        return;
      } else {
        const {x, y} = getCurLocation();
        websocket.send(
            JSON.stringify({
              type: 'touch',
              detail: 'm 0 ' + x + ' ' + y + ' 50\n',
            }),
        );
        mouseMoveTime = 0;
      }
    }
  }
};
const touchstart = async (event) => {
  const debugPic = document.getElementById('debugPic');
  const rect = debugPic.getBoundingClientRect();
  const x = parseInt(
      (event.clientX - rect.left) * (imgWidth / debugPic.clientWidth)
  );
  // _x = parseInt(
  //     (event.clientY - rect.top) *
  //     (imgWidth / canvas.clientHeight),
  // );
  const y = parseInt(
      (event.clientY - rect.top) * (imgHeight / debugPic.clientHeight),
  );
  await nextTick(() => {
    tree['value'].setCurrentKey(
        findMinSize(findElementByPoint(elementData.value, x, y)),
    );
  });
  await handleNodeClick(tree['value'].getCurrentNode());
};
const findMinSize = (data) => {
  if (data.length === 0) {
    return null;
  }
  let result = data[0];
  for (let i in data) {
    if (data[i].size === result.size) {
      if (data[i].ele.detail.text.length !== 0) {
        result = data[i];
      }
    }
    if (data[i].size < result.size) {
      result = data[i];
    }
  }
  currentId.value = [result.ele.id];
  return result.ele.id;
};
const findElementByPoint = (ele, x, y) => {
  let result = [];
  for (let i in ele) {
    const eleStartX = ele[i].detail['bStart'].substring(
        0,
        ele[i].detail['bStart'].indexOf(','),
    );
    const eleStartY = ele[i].detail['bStart'].substring(
        ele[i].detail['bStart'].indexOf(',') + 1,
    );
    const eleEndX = ele[i].detail['bEnd'].substring(
        0,
        ele[i].detail['bEnd'].indexOf(','),
    );
    const eleEndY = ele[i].detail['bEnd'].substring(
        ele[i].detail['bEnd'].indexOf(',') + 1,
    );
    if (x >= eleStartX && x <= eleEndX && y >= eleStartY && y <= eleEndY) {
      result.push({
        ele: ele[i],
        size: (eleEndY - eleStartY) * (eleEndX - eleStartX),
      });
    }
    if (ele[i].children) {
      let childrenResult = findElementByPoint(ele[i].children, x, y);
      if (childrenResult.length > 0) {
        result.push.apply(result, childrenResult);
      }
    }
  }
  return result;
};
const handleNodeClick = (data) => {
  if (data !== null) {
    elementDetail.value = data.detail;
    print(data);
  }
};
const print = (data) => {
  const canvas = document.getElementById('debugPic'),
      g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  const eleStartX = data.detail['bStart'].substring(
      0,
      data.detail['bStart'].indexOf(','),
  );
  const eleStartY = data.detail['bStart'].substring(
      data.detail['bStart'].indexOf(',') + 1,
  );
  const eleEndX = data.detail['bEnd'].substring(
      0,
      data.detail['bEnd'].indexOf(','),
  );
  const eleEndY = data.detail['bEnd'].substring(
      data.detail['bEnd'].indexOf(',') + 1,
  );
  let a = Math.round(Math.random() * 255);
  let b = Math.round(Math.random() * 255);
  let c = Math.round(Math.random() * 255);
  g.fillStyle = 'rgba(' + a + ', ' + b + ', ' + c + ', 0.6)';
  g.fillRect(
      eleStartX * (canvas.width / imgWidth),
      eleStartY * (canvas.height / imgHeight),
      (eleEndX - eleStartX) * (canvas.width / imgWidth),
      (eleEndY - eleStartY) * (canvas.height / imgHeight),
  );
};
const searchDevice = () => {
  websocket.send(
      JSON.stringify({
        type: 'find',
      }),
  );
};
const openApp = (pkg) => {
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'openApp',
        pkg
      }),
  );
};
const refreshAppList = () => {
  appList.value = [];
  ElMessage.success({
    message: '加载应用列表中，请稍后...',
  });
  terminalWebsocket.send(
      JSON.stringify({
        type: 'appList'
      }),
  );
};
const uninstallApp = (pkg) => {
  ElMessage.success({
    message: '开始卸载！请稍后...',
  });
  websocket.send(
      JSON.stringify({
        type: 'uninstallApp',
        detail: pkg
      }),
  );
};
const getEleScreen = (xpath) => {
  elementScreenLoading.value = true;
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'eleScreen',
        xpath,
      }),
  );
};
const clearLog = () => {
  stepLog.value = [];
};
const setStepLog = (data) => {
  stepLog.value.push(data);
};
const runStep = () => {
  debugLoading.value = true;
  activeTab2.value = 'log';
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'runStep',
        caseId: testCase.value['id'],
        pwd: device.value['password'],
      }),
  );
};
const stopStep = () => {
  debugLoading.value = false;
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'stopStep',
        udId: device.value['udId'],
        caseId: testCase.value['id'],
        pf: device.value['platform'],
      }),
  );
};
const pressKey = (keyNum) => {
  websocket.send(
      JSON.stringify({
        type: 'keyEvent',
        detail: keyNum,
      }),
  );
};
const batteryDisconnect = () => {
  websocket.send(
      JSON.stringify({
        type: 'battery',
        detail: 0,
      }),
  );
};
const batteryReset = () => {
  websocket.send(
      JSON.stringify({
        type: 'battery',
        detail: 1,
      }),
  );
};
const changePic = (type) => {
  loading.value = true;
  let pic;
  switch (type) {
    case '低':
      pic = 'low';
      break;
    case '中':
      pic = 'middle';
      break;
    case '高':
      pic = 'high';
      break;
    case 'fixed':
      pic = 'fixed';
      break;
  }
  websocket.send(
      JSON.stringify({
        type: 'pic',
        detail: pic,
      }),
  );
};
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    return true;
  } else {
    ElMessage.error({
      message: '文件格式有误！',
    });
    return false;
  }
};
const beforeAvatarUpload2 = (file) => {
  if (file.name.endsWith('.apk')) {
    return true;
  } else {
    ElMessage.error({
      message: '文件格式有误！',
    });
    return false;
  }
};
const limitOut = () => {
  ElMessage.error({
    message: '只能添加一个文件！请先移除旧文件',
  });
};
const uploadPackage = (content) => {
  uploadLoading.value = true;
  let formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'packageFiles');
  axios
      .post('/folder/upload', formData, {headers: {'Content-type': 'multipart/form-data'}})
      .then((resp) => {
        uploadLoading.value = false;
        if (resp['code'] === 2000) {
          install(resp['data']);
        }
      });
};
const uploadScan = (content) => {
  let formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'imageFiles');
  axios
      .post('/folder/upload', formData, {headers: {'Content-type': 'multipart/form-data'}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          scan(resp['data']);
        }
      });
};
const scan = (url) => {
  websocket.send(
      JSON.stringify({
        type: 'scan',
        url,
      }),
  );
};
const sendText = (text) => {
  websocket.send(
      JSON.stringify({
        type: 'text',
        detail: text,
      }),
  );
};
const install = (apk) => {
  if (apk.length > 0) {
    websocket.send(
        JSON.stringify({
          type: 'debug',
          detail: 'install',
          apk,
        }),
    );
    ElMessage.success({
      message: '开始安装！请稍后...',
    });
  }
};
const getElement = () => {
  elementLoading.value = true;
  if (oldBlob !== undefined) {
    setImgData(undefined);
  }
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'tree',
        hasScreen: oldBlob !== undefined,
      }),
  );
};
const getWebViewForward = () => {
  webViewLoading.value = true;
  websocket.send(
      JSON.stringify({
        type: 'forwardView',
      }),
  );
};
const close = () => {
  if (websocket !== null) {
    websocket.close();
    websocket = null;
  }
  if (terminalWebsocket !== null) {
    terminalWebsocket.close();
    terminalWebsocket = null;
  }
  if (audioPlayer !== null) {
    destroyAudio()
  }
};
onBeforeUnmount(() => {
  close();
});
const getDeviceById = (id) => {
  loading.value = true;
  axios
      .get('/controller/devices', {params: {id: id}}).then((resp) => {
    if (resp['code'] === 2000) {
      device.value = resp.data;
      if (device.value['status'] !== 'ONLINE') {
        ElMessage.error({
          message: '该设备暂时不可使用！',
        });
        router.replace('/Index/Devices');
        return;
      }
      axios
          .get('/controller/agents', {params: {id: device.value['agentId']}}).then((resp) => {
        if (resp['code'] === 2000) {
          agent.value = resp.data;
          openSocket(agent.value['host'], agent.value['port']
              , agent.value['secretKey'], device.value['udId']);
        }
      });
    }
  });
};
/**
 * 实时音频
 */
let audioPlayer = null;
let isConnectAudio = ref(false);
const initAudioPlayer = () => {
  audioPlayer = new AudioProcessor({
    node: 'audio-player',
    wsUrl: 'ws://' + agent.value['host'] + ':' + agent.value['port'] + '/websockets/audio/' + agent.value['secretKey'] + '/' + device.value['udId'],
    onReady() {
      isConnectAudio.value = true;
    }
  });
  audioPlayer.ws.onError(function () {
    destroyAudio()
  })
};
const playAudio = () => {
  if (audioPlayer) {
    ElMessage.warning({
      message: '远程音频已开启，请勿重复操作！',
    });
    return;
  }
  initAudioPlayer();
  audioPlayer.onPlay();
  ElMessage.success({
    message: '远程音频传输已连接！',
  });
};
const destroyAudio = () => {
  audioPlayer.onDestroy();
  audioPlayer = null;
  isConnectAudio.value = false;
  ElMessage.info({
    message: '远程音频传输已断开！',
  });
};
const resetAudioPlayer = () => {
  audioPlayer.jmuxer.reset();
  audioPlayer.onPlay();
  ElMessage.success({
    message: '远程音频同步成功！',
  });
}

onMounted(() => {
  if (store.state.project.id) {
    project.value = store.state.project;
  }
  getDeviceById(route.params.deviceId);
  store.commit('autoChangeCollapse');
});
</script>

<template>
  <el-dialog
      title="控件元素快照"
      v-model="dialogImgElement"
      width="28%"
  >
    <el-card>
      <el-image
          z-index="5000"
          fit="contain"
          style="width: 100%; height: 100px"
          :src="imgElementUrl"
          :preview-src-list="[imgElementUrl]"
      ></el-image>
    </el-card>
    <el-form
        ref="updateImgEle"
        :model="element"
        size="small"
        style="margin-top: 20px"
    >
      <el-form-item
          prop="eleName"
          label="控件元素名称"
          :rules="{
            required: true,
            message: '控件元素名称不能为空',
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="element.eleName"
            placeholder="请输入控件元素名称"
        ></el-input>
      </el-form-item>
      <div style="text-align: center">
        <el-button size="small" type="primary" @click="saveEle"
        >保存为图片元素
        </el-button
        >
      </div>
    </el-form>
  </el-dialog>
  <el-dialog v-model="dialogElement" title="控件元素信息" width="600px">
    <element-update v-if="dialogElement" :project-id="project['id']"
                    :element-id="0" @flush="dialogElement = false"/>
  </el-dialog>
  <el-page-header
      @back="router.go(-1)"
      content="远程控制"
      style="margin-bottom: 20px"
  >
  </el-page-header>
  <el-card shadow="never">
    <el-row
        :gutter="24"
        @mouseup="lineMouseup"
        @mouseleave="lineMouseleave"
        @mousemove="lineMousemove"
    >
      <el-col
          :span="tabPosition == 'left' ? 12 : 24"
          :style="{
            flexBasis: tabPosition == 'left' ? layoutSplitInfo.left + '%' : '',
             maxWidth: tabPosition == 'left' ? layoutSplitInfo.left + '%' : '',
             transition: !isSplitPressing ? 'flex-basis 0.3s,max-width 0.3s' : ''
          }"
      >
        <el-card v-loading="loading"
                 element-loading-text="准备图像中..."
                 element-loading-background="rgba(255, 255, 255, 1)"
                 style="font-size: 14px"
                 :body-style="{ padding: '10px', background: '#ccc', position: 'relative',minHeight: '340px' }"
        >
          <template #header>
            <div style="position: relative; display: flex;align-items: center;">
              <el-icon :size="14" style="vertical-align: middle;">
                <Cellphone/>
              </el-icon>
              <RenderDeviceName style="color: #e6a23c; margin-left: 5px" :device="device"/>
              <el-popover placement="bottom-end" width="270" trigger="hover">
                <el-form
                    label-position="left"
                    class="demo-table-expand"
                    label-width="90px"
                    style="margin-left: 10px; word-break: break-all"
                >
                  <el-form-item label="设备名称">
                    <span>{{ device.name }}</span>
                  </el-form-item>
                  <el-form-item label="设备型号">
                    <span>{{ device['model'] }}</span>
                  </el-form-item>
                  <el-form-item label="设备序列号">
                    <span>{{ device['udId'] }}</span>
                  </el-form-item>
                  <el-form-item label="设备系统">
                    <img
                        height="25"
                        style="position: absolute; top: 7px; bottom: 7px; left: 7px"
                        :src="getImg(device['platform']===1?'ANDROID':'IOS')"
                    />
                  </el-form-item>
                  <el-form-item label="系统版本">
                    <span>{{ device['version'] }}</span>
                  </el-form-item>
                  <el-form-item label="屏幕分辨率">
                    <span>{{ device['size'] }}</span>
                  </el-form-item>
                  <el-form-item label="CPU类型">
                    <span>{{ device['cpu'] }}</span>
                  </el-form-item>
                  <el-form-item label="设备制造商">
                    <img
                        height="25"
                        style="position: absolute; top: 7px; bottom: 7px; left: 7px"
                        :src="getImg(device['manufacturer'])"
                    />
                  </el-form-item>
                </el-form>
                <template #reference>
                  <div style="position: absolute;right:0px;color: #909399;">
                    <el-icon :size="15" style="vertical-align: middle;">
                      <InfoFilled/>
                    </el-icon>
                  </div>
                </template>
              </el-popover>
            </div>
          </template>
          <div style="margin-right: 40px; text-align: center">
            <canvas
                id="canvas"
                @mouseup="mouseup"
                @mousemove="mousemove"
                @mousedown="mousedown"
                @mouseleave="mouseleave"
                style="display: inline-block"
                :style="canvasRectInfo"
            />
            <audio id="audio-player" hidden></audio>
            <el-button-group id="pressKey">
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  @click="pressKey(82)"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <Menu/>
                </el-icon>
              </el-button>
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  @click="pressKey(187)"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <CopyDocument/>
                </el-icon>
              </el-button>
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  @click="pressKey(3)"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <House/>
                </el-icon>
              </el-button>
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  @click="pressKey(4)"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <Back/>
                </el-icon>
              </el-button>
            </el-button-group>
          </div>
          <div style="position: absolute; right: 5px; top: 10px">
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="投屏帧数"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
                :offset="15"
            >
              <div>
                <el-dropdown
                    :hide-on-click="false"
                    trigger="click"
                    placement="right"
                    style="margin-top: 4px"
                >
                  <el-button
                      size="small"
                      type="info"
                      circle
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <View/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-radio-group
                          v-loading="loading"
                          v-model="pic"
                          size="mini"
                          @change="changePic"
                      >
                        <el-radio-button label="低"></el-radio-button>
                        <el-radio-button label="中"></el-radio-button>
                        <el-radio-button label="高"></el-radio-button>
                      </el-radio-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="手动修复"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
                :offset="15"
            >
              <div>
                <el-dropdown
                    :hide-on-click="false"
                    trigger="click"
                    placement="right"
                    style="margin-top: 4px"
                >
                  <el-button
                      size="small"
                      type="info"
                      circle
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <Place/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider" v-loading="loading"
                                      element-loading-background="rgba(255, 255, 255, 1)">
                      <el-button-group>
                        <el-tooltip
                            effect="dark"
                            content="修复黑屏"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="changePic('fixed')"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <Cellphone/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            content="修复触控"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="fixTouch"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <Pointer/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                      </el-button-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="远程音频传输"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
                :offset="15"
            >
              <div>
                <el-dropdown
                    :hide-on-click="false"
                    trigger="click"
                    placement="right"
                    style="margin-top: 4px"
                >
                  <el-button
                      size="small"
                      type="info"
                      circle
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <Service/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-button-group>
                        <el-button
                            size="small"
                            type="success"
                            circle
                            @click="playAudio"
                            :disabled="isConnectAudio"
                        >
                          <el-icon :size="14" style="vertical-align: middle;">
                            <Bell/>
                          </el-icon>
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            circle
                            @click="destroyAudio"
                            :disabled="!isConnectAudio"
                        >
                          <el-icon :size="14" style="vertical-align: middle;">
                            <MuteNotification/>
                          </el-icon>
                        </el-button>
                        <!-- <el-button
                            size="small"
                            type="info"
                            @click="resetAudioPlayer"
                        >
                          <el-icon :size="12" style="vertical-align: middle;">
                            <Refresh/>
                          </el-icon>
                        </el-button> -->
                      </el-button-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="电池模拟"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
                :offset="15"
            >
              <div>
                <el-dropdown
                    :hide-on-click="false"
                    trigger="click"
                    placement="right"
                    style="margin-top: 4px"
                >
                  <el-button
                      size="small"
                      type="info"
                      circle
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <Connection/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-button-group>
                        <el-tooltip
                            effect="dark"
                            content="模拟断电"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="batteryDisconnect"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <VideoPause/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            content="重置"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="batteryReset"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <Refresh/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                      </el-button-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                effect="dark"
                content="物理查找"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
            >
              <div style="margin-top: 4px">
                <el-button
                    size="small"
                    type="info"
                    circle
                    @click="searchDevice"
                >
                  <el-icon :size="12" style="vertical-align: middle;">
                    <Search/>
                  </el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="亮度/音量"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
                :offset="15"
            >
              <div>
                <el-dropdown
                    :hide-on-click="false"
                    trigger="click"
                    placement="right"
                    style="margin-top: 4px"
                >
                  <el-button
                      size="small"
                      type="primary"
                      circle
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <Operation/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <div style="text-align: center">
                        <el-icon :size="14" style="color: #909399;vertical-align: middle;">
                          <Sunny/>
                        </el-icon>
                        <el-divider direction="vertical"></el-divider>
                        <el-button-group>
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="pressKey(220)"
                          >
                            <el-icon :size="12" style="vertical-align: middle;">
                              <CaretLeft/>
                            </el-icon>
                          </el-button>
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="pressKey(221)"
                          >
                            <el-icon :size="12" style="vertical-align: middle;">
                              <CaretRight/>
                            </el-icon>
                          </el-button>
                        </el-button-group>
                      </div>
                      <el-divider></el-divider>
                      <el-icon :size="14" style="color: #909399;vertical-align: middle;">
                        <Phone/>
                      </el-icon>
                      <el-divider direction="vertical"></el-divider>
                      <el-button-group>
                        <el-button
                            size="small"
                            type="info"
                            circle
                            @click="pressKey(24)"
                        >
                          <el-icon :size="12" style="vertical-align: middle;">
                            <Plus/>
                          </el-icon>
                        </el-button>
                        <el-button
                            size="small"
                            type="info"
                            circle
                            @click="pressKey(164)"
                        >
                          <el-icon :size="12" style="vertical-align: middle;">
                            <MuteNotification/>
                          </el-icon>
                        </el-button>
                        <el-button
                            size="small"
                            type="info"
                            circle
                            @click="pressKey(25)"
                        >
                          <el-icon :size="12" style="vertical-align: middle;">
                            <Minus/>
                          </el-icon>
                        </el-button>
                      </el-button-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                effect="dark"
                content="拨号"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
            >
              <div style="margin-top: 4px">
                <el-button
                    size="small"
                    type="primary"
                    circle
                    @click="pressKey(5)"
                >
                  <el-icon :size="12" style="vertical-align: middle;">
                    <PhoneFilled/>
                  </el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip
                effect="dark"
                content="拍照"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
            >
              <div style="margin-top: 4px">
                <el-button
                    size="small"
                    type="primary"
                    circle
                    @click="pressKey(27)"
                >
                  <el-icon :size="12" style="vertical-align: middle;">
                    <Camera/>
                  </el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip
                effect="dark"
                content="浏览器"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
            >
              <div style="margin-top: 4px">
                <el-button
                    size="small"
                    type="primary"
                    circle
                    @click="pressKey(64)"
                >
                  <el-icon :size="12" style="vertical-align: middle;">
                    <Position/>
                  </el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip
                effect="dark"
                content="锁定/解锁屏幕"
                :placement="tabPosition == 'left' ? 'right' : 'left'"
            >
              <div style="margin-top: 4px">
                <el-button
                    size="small"
                    type="primary"
                    circle
                    @click="pressKey(26)"
                >
                  <el-icon :size="12" style="vertical-align: middle;">
                    <SwitchButton/>
                  </el-icon>
                </el-button>
              </div>
            </el-tooltip>
          </div>
        </el-card>
      </el-col>

      <div
          :class="{ line: tabPosition == 'left', lineVertical: tabPosition == 'top' }"
          @mousedown="lineMousedown"
      />

      <el-col
          :span="tabPosition == 'left' ? 12 : 24"
          :style="{
            flexBasis: tabPosition == 'left' ?  100 - Number(layoutSplitInfo.left) + '%' : '',
             maxWidth: tabPosition == 'left' ?  100 - Number(layoutSplitInfo.left) + '%' : ''
          }"
      >
        <el-tabs
            @tab-click="switchTabs"
            stretch
            class="remote-tab"
            v-model="activeTab"
            :tab-position="tabPosition"
        >
          <el-tab-pane label="远控面板" name="main">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <strong>输入文本</strong>
                  </template>
                  <el-form size="small" :model="text">
                    <el-form-item
                    >
                      <el-input
                          clearable
                          v-model="text.content"
                          size="small"
                          placeholder="请输入要发送的文本，支持简体中文"
                      ></el-input>
                    </el-form-item>
                  </el-form>
                  <div style="text-align: center;">
                    <el-button
                        size="mini"
                        type="primary"
                        @click="sendText(text.content)"
                    >发送
                    </el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <strong>远程连接ADB</strong>
                  </template>
                  <div v-if="remoteAdbUrl.length>0" style="margin-top: 8px;margin-bottom: 8px">
                    <el-card :body-style="{backgroundColor:'#303133',cursor:'pointer'}"
                             @click="copy('adb connect '+remoteAdbUrl)">
                      <strong style="color: #F2F6FC">adb connect {{ remoteAdbUrl }}</strong>
                    </el-card>
                  </div>
                  <div v-else v-loading="remoteAdbUrl.length===0"
                       element-loading-spinner="el-icon-lock"
                       element-loading-background="rgba(255, 255, 255, 1)"
                       element-loading-text="所在Agent未开启该功能！"
                       style="margin-top: 8px;margin-bottom: 8px">
                    <el-card>
                      <strong>所在Agent未开启该功能！</strong>
                    </el-card>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <strong>录制屏幕（即将开放）</strong>
                  </template>
                  <div style="text-align: center">
                    <el-button size="mini" type="success" disabled>开始</el-button>
                    <el-button size="mini" type="info" disabled>暂停</el-button>
                    <el-button size="mini" type="danger" disabled>结束</el-button>
                    <div style="margin-top: 20px">
                      <el-button size="mini" type="primary" disabled>生成并下载录像</el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12" style="margin-top: 15px">
                <el-card>
                  <template #header>
                    <strong>扫描二维码</strong>
                  </template>
                  <el-alert title="OPPO、vivo部分机型上传二维码后不出现在相册，需要重启后生效" type="info" show-icon :closable="false">
                  </el-alert>
                  <div style="text-align: center;margin-top: 20px">
                    <el-upload
                        drag
                        action=""
                        :with-credentials="true"
                        :limit="1"
                        :before-upload="beforeAvatarUpload"
                        :on-exceed="limitOut"
                        :http-request="uploadScan"
                        list-type="picture"
                    >
                      <i class="el-icon-upload"></i>
                      <div class="el-upload__text">将二维码图片拖到此处，或<em>点击上传</em></div>
                      <template #tip>
                        <div class="el-upload__tip">只能上传jpg/png文件</div>
                      </template>
                    </el-upload>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12" style="margin-top: 15px">
                <el-card>
                  <template #header>
                    <strong>文件互传（即将开放）</strong>
                  </template>
                  <div style="text-align: center" v-loading="true"
                       element-loading-spinner="el-icon-lock"
                       element-loading-background="rgba(255, 255, 255, 1)"
                       element-loading-text="该功能即将开放">
                    <el-upload
                        v-loading="uploadLoading"
                        drag
                        action=""
                        :with-credentials="true"
                        :limit="1"
                        :before-upload="beforeAvatarUpload2"
                        :on-exceed="limitOut"
                        :http-request="uploadPackage"
                    >
                      <i class="el-icon-upload"></i>
                      <div class="el-upload__text">将APK文件拖到此处，或<em>点击上传</em></div>
                      <template #tip>
                        <div class="el-upload__tip">只能上传apk文件</div>
                      </template>
                    </el-upload>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="应用程序" name="apps">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card shadow="hover">
                  <template #header>
                    <strong>上传安装</strong>
                  </template>
                  <div style="text-align: center">
                    <el-upload
                        v-loading="uploadLoading"
                        drag
                        action=""
                        :with-credentials="true"
                        :limit="1"
                        :before-upload="beforeAvatarUpload2"
                        :on-exceed="limitOut"
                        :http-request="uploadPackage"
                    >
                      <i class="el-icon-upload"></i>
                      <div class="el-upload__text">将APK文件拖到此处，或<em>点击上传</em></div>
                      <template #tip>
                        <div class="el-upload__tip">只能上传apk文件</div>
                      </template>
                    </el-upload>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="hover" class="url-install-box"
                         :body-style="{position: 'absolute',top: '50%', width: '100%',paddingTop: '56px',paddingBottom: '0',boxSizing: 'border-box',transform: 'translateY(-50%)'}">
                  <template #header>
                    <strong>URL安装</strong>
                  </template>
                  <el-input
                      clearable
                      v-model="uploadUrl"
                      size="small"
                      placeholder="请输入apk下载链接或本地路径"
                  ></el-input>
                  <div style="text-align: center;margin-top: 20px">
                    <el-button
                        size="mini"
                        type="primary"
                        :disabled="uploadUrl.length===0"
                        @click="install(uploadUrl)"
                    >发送
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-card shadow="hover" style="margin-top:15px">
              <el-table :data="currAppListPageData" border>
                <el-table-column width="90" header-align="center">
                  <template #header>
                    <el-button size="mini" @click="refreshAppList">刷新</el-button>
                  </template>
                  <template #default="scope">
                    <div style="display: flex;align-items: center;justify-content: center;">
                      <el-avatar shape="square" :size="40"
                                 :src="'data:image/png;base64,'+scope.row.appIcon"></el-avatar>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column width="150" show-overflow-tooltip header-align="center" prop="appName" label="应用名">
                </el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="packageName"
                                 label="包名">
                  <template #default="scope">
                    <div style="cursor: pointer" @click="copy(scope.row.packageName)">{{ scope.row.packageName }}</div>
                  </template>
                </el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="versionName" label="版本号"
                                 width="120"></el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="versionCode" label="子版本号"
                                 width="120"></el-table-column>
                <el-table-column align="center" width="200">
                  <template #header>
                    <el-input v-model="filterAppText" size="mini" placeholder="输入应用名或包名搜索"/>
                  </template>
                  <template #default="scope">
                    <el-button size="mini" @click="openApp(scope.row.packageName)" type="primary">打开
                    </el-button>
                    <el-button size="mini" @click="uninstallApp(scope.row.packageName)" type="danger">卸载</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <Pageable
                  :isPageSet="false"
                  :total="filterTableData.length"
                  :current-page="currAppListPageIndex + 1"
                  :page-size="10"
                  @change="changeAppListPage"
              ></Pageable>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="快速截图" name="screenCap">
            <el-button type="primary" size="small" @click="quickCap">
              <el-icon :size="12" style="vertical-align: middle;">
                <Camera/>
              </el-icon>
              截图
            </el-button>
            <el-button type="danger" size="small" @click="removeScreen">
              <el-icon :size="12" style="vertical-align: middle;">
                <Delete/>
              </el-icon>
              清空
            </el-button>
            <el-card style="height: 100%;margin-top: 10px" v-if="screenUrls.length===0">
              <el-empty description="暂无截图"></el-empty>
            </el-card>
            <el-row :gutter="20" v-else>
              <el-col :xs="8"
                      :sm="8"
                      :md="8"
                      :lg="4"
                      :xl="4" v-for="u in screenUrls" style="margin-top: 10px">
                <el-card shadow="hover" :body-style="{padding:'10px'}">
                  <el-image :src="u" :preview-src-list="screenUrls" hide-on-click-modal></el-image>
                  <div style="text-align: center;margin-top: 5px">
                    <el-button type="primary" plain size="mini" @click="downloadImg(u)">
                      <el-icon :size="12" style="vertical-align: middle;">
                        <Download/>
                      </el-icon>
                      保存图片
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Terminal" name="terminal">
            <el-alert
                title="注意事项"
                type="warning"
                description="该功能仍处于Beta测试中，暂时屏蔽reboot、rm、su等风险指令"
                show-icon
                :closable="false"
                style="margin-bottom: 10px"
            />
            <el-tabs stretch type="border-card">
              <el-tab-pane label="Shell">
                <el-card
                    style="border: 0px"
                    :body-style="{color:'#FFFFFF',backgroundColor:'#303133',lineHeight:'1.5'}">
                  <el-scrollbar noresize ref="terScroll" :style="'height:'+terminalHeight+'px;min-height:450px'">
                    <div v-html="c" v-for="c in cmdOutPut" style="white-space: pre-wrap">
                    </div>
                  </el-scrollbar>
                  <div style="display: flex;margin-top: 10px">
                    <el-input @keyup.enter="sendCmd" size="mini" v-model="cmdInput" placeholder="输入指令后，点击Send或回车发送">
                      <template #prepend>{{ cmdUser + ':/ $' }}</template>
                    </el-input>
                    <el-button size="mini" @click="sendCmd" :disabled="cmdInput.length===0||!cmdIsDone"
                               style="margin-left: 5px" type="primary">Send
                    </el-button>
                    <el-button size="mini" @click="stopCmd" :disabled="cmdIsDone"
                               style="margin-left: 5px" type="danger">Stop
                    </el-button>
                    <el-button size="mini" @click="clearCmd"
                               style="margin-left: 5px" type="warning">Clear
                    </el-button>
                  </div>
                </el-card>
              </el-tab-pane>
              <el-tab-pane label="Logcat">
                <el-card
                    style="border: 0px"
                    :body-style="{color:'#FFFFFF',backgroundColor:'#303133',lineHeight:'1.5'}">
                  <div style="display: flex;margin-bottom: 10px">
                    <el-select size="mini" v-model="logcatFilter.level">
                      <el-option label="VERBOSE" value="V"></el-option>
                      <el-option label="DEBUG" value="D"></el-option>
                      <el-option label="INFO" value="I"></el-option>
                      <el-option label="WARN" value="W"></el-option>
                      <el-option label="ERROR" value="E"></el-option>
                      <el-option label="FATAL" value="F"></el-option>
                      <el-option label="SILENT" value="S"></el-option>
                    </el-select>
                    <el-input style="margin-left: 5px" size="mini" v-model="logcatFilter.filter"
                              placeholder="请输入输入过滤文本">
                      <template #prepend>| grep</template>
                    </el-input>
                    <el-button size="mini" @click="sendLogcat"
                               style="margin-left: 5px" type="primary">Search
                    </el-button>
                    <el-button size="mini" @click="stopLogcat"
                               style="margin-left: 5px" type="danger">Stop
                    </el-button>
                    <el-button size="mini" @click="clearLogcat"
                               style="margin-left: 5px" type="warning">Clear
                    </el-button>
                  </div>
                  <el-scrollbar noresize ref="logcatScroll" :style="'height:'+terminalHeight+'px;min-height:450px'">
                    <div v-html="l" v-for="l in logcatOutPut" style="white-space: pre-wrap">
                    </div>
                  </el-scrollbar>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <el-tab-pane label="UI自动化" name="auto">
            <div v-if="testCase['id']">
              <el-collapse accordion style="margin-bottom: 20px">
                <el-collapse-item>
                  <template #title>
                    <div style="display: flex; align-items: center;width: 100%;justify-content: space-between;">
                      <strong style="font-size: 15px;color: #909399;margin-left: 10px">用例详情</strong>
                      <el-button style="margin-right: 10px" type="danger" size="mini" @click="removeCase">取消关联
                      </el-button>
                    </div>
                  </template>
                  <el-descriptions :column="2" size="medium" border>
                    <el-descriptions-item width="100px" label="用例Id">{{ testCase['id'] }}</el-descriptions-item>
                    <el-descriptions-item width="100px" label="用例名称">{{ testCase.name }}</el-descriptions-item>
                    <el-descriptions-item label="所属项目">
                      <div style=" display: flex;align-items: center;">
                        <el-avatar
                            style="margin-right: 10px"
                            :size="27"
                            :src="project['projectImg'].length>0?project['projectImg']:defaultLogo"
                            shape="square"
                        ></el-avatar
                        >
                        {{ project['projectName'] }}
                      </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="所属平台">
                      <div style=" display: flex;align-items: center;">
                        <el-avatar
                            style="margin-right: 10px"
                            :size="27"
                            :src="getImg(testCase['platform']===1?'ANDROID':'IOS')"
                            shape="square"
                        ></el-avatar
                        >
                        {{ testCase['platform'] === 1 ? '安卓' : 'iOS' }}
                      </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="模块">{{ testCase['module'] }}</el-descriptions-item>
                    <el-descriptions-item label="版本名称">{{ testCase['version'] }}</el-descriptions-item>
                    <el-descriptions-item label="设计人">{{ testCase['designer'] }}</el-descriptions-item>
                    <el-descriptions-item label="最后修改日期">{{ testCase['editTime'] }}</el-descriptions-item>
                    <el-descriptions-item label="用例描述">{{ testCase['des'] }}</el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>
              <el-tabs type="border-card" stretch v-model="activeTab2">
                <el-tab-pane label="步骤列表" name="step">
                  <step-list :is-show-run="true" :platform="1" :is-driver-finish="isDriverFinish"
                             :case-id="testCase['id']"
                             :project-id="project['id']"
                             :debug-loading="debugLoading"
                             @runStep="runStep"/>
                </el-tab-pane>
                <el-tab-pane label="运行日志" name="log">
                  <step-log :is-read-only="false" :debug-loading="debugLoading" :step-log="stepLog"
                            @clearLog="clearLog" @stopStep="stopStep"/>
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-else>
              <span style="color: #909399;margin-right: 10px">关联项目</span>
              <el-select size="mini" v-model="project" value-key="id" placeholder="请选择关联项目">
                <el-option
                    v-for="item in store.state.projectList"
                    :key="item.id"
                    :value="item"
                    :label="item['projectName']"
                >
                  <div style=" display: flex;align-items: center;">
                    <el-avatar
                        style="margin-right: 10px"
                        :size="32"
                        :src="item['projectImg'].length>0?item['projectImg']:defaultLogo"
                        shape="square"
                    ></el-avatar
                    >
                    {{ item['projectName'] }}
                  </div>
                </el-option>
              </el-select>
              <el-button v-if="project!==null" size="mini" type="primary" round style="position: absolute;right: 20px"
                         @click="caseList.open()">
                新增用例
              </el-button>
              <test-case-list ref="caseList" v-if="project!==null"
                              :project-id="project['id']"
                              :platform="1"
                              :is-read-only="true"
                              @select-case="selectCase"></test-case-list>
              <el-card style="height: 100%;margin-top:20px">
                <el-result icon="info" title="提示" subTitle="该功能需要先从上方关联测试用例">
                </el-result>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane label="控件元素" name="ele">
            <div v-show="isShowImg">
              <div style="margin-bottom: 15px; display: flex;align-items: center;justify-content: space-between;">
                <el-button
                    type="primary"
                    size="mini"
                    :loading="elementLoading"
                    @click="getElement"
                    :disabled="isDriverFinish === false"
                >
                  <el-icon :size="12" style="vertical-align: middle;">
                    <Search/>
                  </el-icon>
                  重新获取控件元素
                </el-button
                >
                <span style="margin-right:10px;color: #909399;font-size: 14px; cursor: pointer"
                      @click="copy(activity)"
                      v-if="activity.length > 0">当前Activity： {{ activity }}</span>
              </div>
              <el-row
                  :gutter="10"
              >
                <el-col :span="7">
                  <el-card shadow="hover">
                    <div
                        :style="
                      'width: 100%;background-image: url(' +
                      imgUrl +
                      ');background-size: 100% 100%;'
                    "
                    >
                      <canvas id="debugPic" @mousedown="touchstart"></canvas>
                    </div>
                  </el-card>
                  <el-card
                      :body-style="{ padding: '12px' }"
                      shadow="hover"
                      v-if="webViewData.length > 0"
                      style="margin-top: 10px"
                  >
                    <el-table :data="webViewData" border>
                      <el-table-column
                          label="WebView列表"
                          align="center"
                          :show-overflow-tooltip="true"
                      >
                        <template #default="scope">
                        <span
                            style="cursor: pointer"
                            @click="copy(scope.row)"
                        >
                          {{ scope.row }}</span
                        >
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-card>
                </el-col>
                <el-col :span="9">
                  <el-card
                      shadow="hover"
                      v-if="isShowTree"
                  >
                    <el-input
                        style="margin-bottom: 10px"
                        size="mini"
                        placeholder="输入class或resource-id进行过滤"
                        v-model="filterText"
                    ></el-input>
                    <div style="height: 660px">
                      <el-scrollbar
                          class="element-tree-scrollbar"
                          style="height: 100%"
                      >
                        <el-tree
                            :indent="13"
                            :filter-node-method="filterNode"
                            :default-expanded-keys="currentId"
                            node-key="id"
                            style="margin-top: 10px; margin-bottom: 20px"
                            :highlight-current="true"
                            ref="tree"
                            :accordion="true"
                            :data="elementData"
                            @node-click="handleNodeClick"
                        >
                          <template #default="{ node, data }">
                          <span style="font-size: 14px" v-if="data.detail['resource-id']">
                            {{ node.label.substring(0, node.label.indexOf('>')) + ' ' }}
                            <span style="color: #F55781">resource-id</span>={{
                              '"' + data.detail['resource-id'] + '">'
                            }}
                          </span>
                            <span style="font-size: 14px" v-else>{{ node.label }}</span>
                          </template>
                        </el-tree>
                      </el-scrollbar>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card
                      shadow="hover"
                      v-if="isShowTree"
                  >
                    <div style="text-align: center; margin-bottom: 10px" v-if="project && project['id']">
                      <el-button
                          :disabled="elementDetail === null"
                          plain
                          size="small"
                          type="primary"
                          round
                          @click="dialogElement = true"
                      >添加控件
                      </el-button
                      >
                      <el-button
                          v-if="
                        elementDetail && elementDetail['xpath'] && isDriverFinish
                      "
                          :loading="elementScreenLoading"
                          style="margin-left: 5px"
                          plain
                          size="small"
                          round
                          @click="getEleScreen(elementDetail['xpath'])"
                      >控件快照
                      </el-button
                      >
                    </div>
                    <el-alert style="margin-bottom: 10px" v-else title="关联项目后即可保存控件" type="info" show-icon
                              close-text="Get!"/>
                    <div style="height: 655px">
                      <el-scrollbar
                          style="height: 100%"
                          class="element-tree-scrollbar"
                      >
                        <el-form
                            label-position="left"
                            class="element-table"
                            label-width="100px"
                            v-if="elementDetail !== null"
                        >
                          <el-form-item
                              label="class"
                              style="cursor: pointer"
                              @click="copy(elementDetail['class'])"
                          >
                            <span>{{ elementDetail['class'] }}</span>
                          </el-form-item>
                          <el-form-item
                              label="resource-id"
                              style="cursor: pointer"
                              v-if="elementDetail['resource-id']"
                              @click="copy(elementDetail['resource-id'])"
                          >
                            <span>{{ elementDetail['resource-id'] }}</span>
                          </el-form-item>
                          <el-form-item label="xpath推荐">
                            <el-table stripe empty-text="暂无xpath推荐语法" border :data="findBestXpath(elementDetail)"
                                      :show-header="false">
                              <el-table-column>
                                <template #default="scope">
                                  <div style="cursor: pointer" @click="copy(scope.row)">{{ scope.row }}</div>
                                </template>
                              </el-table-column>
                            </el-table>
                          </el-form-item>
                          <el-form-item label="绝对路径" style="cursor: pointer"
                                        @click="copy(elementDetail['xpath'])">
                            <span>{{ elementDetail['xpath'] }}</span>
                          </el-form-item>
                          <el-form-item
                              label="text"
                              style="cursor: pointer"
                              @click="copy(elementDetail['text'])"
                          >
                            <span>{{ elementDetail['text'] }}</span>
                          </el-form-item>
                          <el-form-item
                              label="content-desc"
                              style="cursor: pointer"
                              v-if="elementDetail['content-desc']"
                              @click="copy(elementDetail['content-desc'])"
                          >
                            <span>{{ elementDetail['content-desc'] }}</span>
                          </el-form-item>
                          <el-form-item
                              label="package"
                              style="cursor: pointer"
                              @click="copy(elementDetail['package'])"
                          >
                            <span>{{ elementDetail['package'] }}</span>
                          </el-form-item>
                          <el-form-item label="中心坐标" style="cursor: pointer"
                                        @click="copy(computedCenter(elementDetail['bStart'], elementDetail['bEnd']))">
                            <span>{{ computedCenter(elementDetail['bStart'], elementDetail['bEnd']) }}</span>
                          </el-form-item>
                          <el-form-item label="index">
                            <span>{{ elementDetail['index'] }}</span>
                          </el-form-item>
                          <el-form-item label="是否可勾选">
                            <el-switch
                                :value="JSON.parse(elementDetail['checkable'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否勾选">
                            <el-switch
                                :value="JSON.parse(elementDetail['checked'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否可点击">
                            <el-switch
                                :value="JSON.parse(elementDetail['clickable'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否被选">
                            <el-switch
                                :value="JSON.parse(elementDetail['selected'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否显示">
                            <el-switch
                                :value="JSON.parse(elementDetail['displayed'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否可用">
                            <el-switch
                                :value="JSON.parse(elementDetail['enabled'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否可聚焦">
                            <el-switch
                                :value="JSON.parse(elementDetail['focusable'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否聚焦">
                            <el-switch
                                :value="JSON.parse(elementDetail['focused'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否支持长按">
                            <el-switch
                                :value="JSON.parse(elementDetail['long-clickable'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否支持滚动">
                            <el-switch
                                :value="JSON.parse(elementDetail['scrollable'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="Bounds">
                            <span>{{ elementDetail['bounds'] }}</span>
                          </el-form-item>
                        </el-form>
                      </el-scrollbar>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            <el-card style="height: 100%" v-show="!isShowImg">
              <el-result icon="info" title="提示" subTitle="请先获取控件元素，该功能需要初始化Driver">
                <template #extra>
                  <el-button
                      type="primary"
                      size="mini"
                      :loading="elementLoading"
                      @click="getElement"
                      :disabled="isDriverFinish === false"
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <Search/>
                    </el-icon>
                    获取控件元素
                  </el-button
                  >
                </template>
              </el-result>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="网页调试" name="webview">
            <div v-if="isWebView">
              <div v-if="webViewListDetail.length==0">
                <el-result icon="info" title="提示" subTitle="暂无webView进程">
                  <template #extra>
                    <el-button
                        type="primary"
                        size="mini"
                        :loading="webViewLoading"
                        @click="getWebViewForward"
                    >
                      <el-icon :size="12" style="vertical-align: middle;">
                        <Search/>
                      </el-icon>
                      获取webView进程
                    </el-button
                    >
                  </template>
                </el-result>
              </div>
              <div v-else>
                <el-button @click="getWebViewForward" :loading="webViewLoading" type="primary" size="mini">
                  重新获取webView进程
                </el-button>
                <el-card style="margin-top: 15px" v-for="web in webViewListDetail" class="device-card"
                         :body-style="{ padding: '0px 10px 10px 10px' }">
                  <template #header>
                    <div>
                      <div style="display: flex;align-items: center;">
                        <img :src="getImg('chrome')" width="20"/> <strong style="margin-left: 10px">{{
                          web['package']
                        }}
                        ({{ web['version'] }})</strong>
                      </div>
                    </div>
                  </template>
                  <el-card :body-style="{ padding: '15px' }" v-for="w in web.children"
                           style="margin-top: 10px; word-wrap: break-word;overflow: hidden;">
                    <div style="display: flex;align-items: center;justify-content: space-between">
                      <div>
                        <div style="display: flex;align-items: center;">
                          <img :src="w.favicon" v-if="w.favicon" width="15" style="margin-right: 5px"/>
                          <strong>{{ w.title.length > 0 ? w.title : '无标题' }}</strong>
                        </div>
                        <div style="color: #909399">{{
                            w.url.length > 50 ? w.url.substring(0, 50) + '...' : w.url
                          }}
                        </div>
                      </div>
                      <el-button type="primary" size="mini"
                                 @click="tabWebView(web.port,w.id,(w.title.length > 0 ? w.title : '无标题'))">马上调试
                      </el-button>
                    </div>
                  </el-card>
                </el-card>
              </div>
            </div>
            <div v-else>
              <div style="display: flex;align-items: center;">
                <el-page-header icon="el-icon-arrow-left" @back="switchIsWebView">
                  <template #title>
                    <span style="color: #606266">返回</span>
                  </template>
                  <template #content>
                    当前页面：<strong>{{ title }}</strong>
                  </template>
                </el-page-header>
              </div>
              <el-alert type="info" show-icon style="margin-top: 15px" close-text="Get!">
                <template #title>
                  <div style="display: flex;align-items: center;">
                    <span>如果您的浏览器不兼容该功能，请您及时反馈到</span>
                    <el-link style="font-size: 13px;margin-left: 5px" type="primary" target="_blank"
                             href="https://github.com/SonicCloudOrg/sonic-agent/issues/47">
                      这里
                    </el-link>
                  </div>
                </template>
              </el-alert>
              <iframe v-if="!isWebView"
                      :style="'border:1px solid #C0C4CC;;width: 100%;height: '+iFrameHeight+'px;margin-top:15px'"
                      :src="iframeUrl">
              </iframe>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-card>
</template>
<style scoped lang="less">
.line {
  width: 2px;
  height: inherit;
  background: #ccc;
  text-align: center;
  border-radius: 1px;
  margin-right: -2px;
  position: relative;
  z-index: 9;
  cursor: e-resize;

  &::after {
    content: '';
    position: absolute;
    top: 48%;
    left: -14px;
    display: block;
    width: 30px;
    height: 30px;
    background: url("@/assets/img/drag.png") no-repeat center;
    transform: rotate(90deg);
    background-size: 100% 100%;
  }
}

.lineVertical {
  width: 100%;
  height: 2px;
  background: #ccc;
  text-align: center;
  position: relative;
  cursor: n-resize;
  margin: 1em calc(var(--el-card-padding) - 4px);

  &::after {
    content: '';
    position: absolute;
    left: 48%;
    top: -14px;
    display: block;
    width: 30px;
    height: 30px;
    background: url("@/assets/img/drag.png") no-repeat center;
    background-size: 100% 100%;
  }
}

#debugPic {
  width: 100%;
  height: auto;
}

.url-install-box {
  position: relative;
  height: 100%;
}
</style>
