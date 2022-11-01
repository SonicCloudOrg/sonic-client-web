<script setup>
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
import {useRoute, useRouter} from 'vue-router';
import {computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useStore} from 'vuex';
import axios from '@/http/axios';
import {ElMessage} from 'element-plus';
import useClipboard from 'vue-clipboard3';
import ColorImg from '@/components/ColorImg.vue';
import StepList from '@/components/StepList.vue';
import TestCaseList from '@/components/TestCaseList.vue';
import StepLog from '@/components/StepLog.vue';
import ElementUpdate from '@/components/ElementUpdate.vue';
import Pageable from '@/components/Pageable.vue';
import defaultLogo from '@/assets/logo.png';
import {
  Headset,
  MoreFilled,
  FullScreen,
  Edit,
  HelpFilled,
  HomeFilled,
  Coin,
  List,
  Picture,
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
  Share,
  Back,
  View,
  InfoFilled,
  Bell,
  Service,
  VideoCamera,
  Postcard
} from '@element-plus/icons';

import {useI18n} from 'vue-i18n'

const {t: $t} = useI18n()

import RenderDeviceName from '../../components/RenderDeviceName.vue';
import AudioProcessor from '@/lib/audio-processor';
import wifiLogo from '@/assets/img/wifi.png';
import Scrcpy from './Scrcpy';

const {toClipboard} = useClipboard();
const route = useRoute();
const store = useStore();
const router = useRouter();
const isShowPocoImg = ref(false);
const wifiList = ref([]);
const currentWifi = ref('');
const isConnectWifi = ref(false);
const selectPocoType = ref("");
const pocoPort = ref("");
const pocoLoading = ref(false)
const pocoData = ref([])
const proxyWebPort = ref(0);
const proxyConnPort = ref(0);
const filterAppText = ref('');
const iFrameHeight = ref(0);
const terminalHeight = ref(0);
const caseList = ref(null);
const loading = ref(false);
const driverLoading = ref(false)
const remoteAdbLoading = ref(true)
const appList = ref([]);
const device = ref({});
const agent = ref({});
const screenUrls = ref([]);
const uploadUrl = ref('');
const text = ref({content: ''});
const pocoTypeList = ref([
  {
    name: 'Unity3d',
    value: 'UNITY_3D',
    img: 'Unity'
  },
  {
    name: 'Egret',
    value: 'EGRET',
    img: 'Egret'
  },
  {
    name: 'UE4',
    value: 'UE4',
    img: 'UE4'
  },
  {
    name: 'Cocos2dx-js',
    value: 'COCOS_2DX_JS',
    img: 'Cocos2dx'
  },
  {
    name: 'Cocos2dx-lua',
    value: 'COCOS_2DX_LUA',
    img: 'Cocos2dx'
  },
  {
    name: 'Cocos2dx-c++',
    value: 'COCOS_2DX_C_PLUS_1',
    img: 'Cocos2dx'
  },
  {
    name: 'Cocos-creator',
    value: 'COCOS_CREATOR',
    img: 'Cocos2dx'
  },
])
let imgWidth = 0;
let imgHeight = 0;
// 旋转状态 // 0 90 180 270
let directionStatus = {
  value: -1,
};
let moveX = 0;
let moveY = 0;
let isFixTouch = false;
let isPress = false;
let loop = null;
let time = 0;
let isLongPress = false;
let mouseMoveTime = 0;
let touchWrapper = null;
const pic = ref('高');
const _screenMode = window.localStorage.getItem('screenMode');
const screenMode = ref(_screenMode || 'Scrcpy'); // Scrcpy,Minicap
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
const pocoDetail = ref(null);
const tree = ref(null);
const pocoTree = ref(null)
const currentId = ref([]);
const filterText = ref('');
const project = ref(null);
const testCase = ref({});
const activeTab = ref('main');
const activeTab2 = ref('step');
const stepLog = ref([]);
const currentPocoId = ref([])
const debugLoading = ref(false);
const dialogElement = ref(false);
const dialogImgElement = ref(false);
const imgElementUrl = ref(null);
const updateImgEle = ref(null);
const webViewListDetail = ref([]);
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
const remoteAdbUrl = ref('');
const logcatFilter = ref({
  level: 'E',
  filter: '',
});
let oldBlob = undefined;
const element = ref({
  id: null,
  moduleId: 0,
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
  if (e.props.name === 'proxy') {
    getWifiList();
  }
  if (e.props.name === 'apps') {
    if (appList.value.length === 0) {
      refreshAppList();
    }
  }
  if (e.props.name === 'terminal') {
    terminalHeight.value = document.getElementById('pressKey').offsetTop - 150;
  }
  if (e.props.name === 'webview') {
    if (webViewListDetail.value.length === 0) {
      getWebViewForward();
    }
  }
};
const img = import.meta.globEager('../../assets/img/*');
let websocket = null;
let screenWebsocket = null;
let __Scrcpy = null; // 实例
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
  iframeUrl.value = '/chrome/devtools/inspector.html?ws=' + agent.value['host']
      + ':' + agent.value['port'] + '/websockets/webView/'
      + agent.value['secretKey'] + '/' + port + '/' + id;
  nextTick(() => {
    iFrameHeight.value = document.body.clientHeight - 150;
  });
};
const saveEle = () => {
  updateImgEle['value'].validate((valid) => {
    if (valid) {
      element.value.eleType = 'image';
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
};
const changeAppListPage = (pageNum) => {
  currAppListPageIndex.value = pageNum - 1;
  currAppListPageData.value = appListPageData.value[currAppListPageIndex.value];
};
const filterTableData = computed(() => {
  const list = appList.value.filter(
      (data) =>
          !filterAppText.value ||
          data.appName.toLowerCase().includes(filterAppText.value.toLowerCase()) ||
          data.packageName.toLowerCase().includes(filterAppText.value.toLowerCase()),
  );
  transformPageable(list);
  return list;
});
const fixTouch = () => {
  ElMessage.success({
    message: $t('androidRemoteTS.repairedSuccess'),
  });
  isFixTouch = !isFixTouch;
};
const fixOri = () => {
  ElMessage.success({
    message: $t('androidRemoteTS.repairedSuccess'),
  });
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    directionStatus.value = 90
  } else {
    directionStatus.value = 0
  }
}
const switchIsWebView = () => {
  isWebView.value = true;
};
const selectCase = (val) => {
  ElMessage.success({
    message: $t('androidRemoteTS.associationSuccess'),
  });
  testCase.value = val;
};
const removeCase = () => {
  testCase.value = {};
};
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  if (name === 'LENOVO') {
    name = 'Lenovo'
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
  let result = [];
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
};
const downloadImg = (url) => {
  let time = new Date().getTime();
  let link = document.createElement('a');
  fetch(url).then(res => res.blob()).then(blob => {
    link.href = URL.createObjectURL(blob);
    link.download = time + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: $t('androidRemoteTS.copySuccess'),
    });
  } catch (e) {
    ElMessage.error({
      message: $t('androidRemoteTS.copyFail'),
    });
  }
};
const toAddElement = (eleType, eleValue) => {
  if (project) {
    element.value.eleType = eleType
    element.value.eleValue = eleValue
    dialogElement.value = true
  }

}
const removeScreen = () => {
  screenUrls.value = [];
};
const getVideoScreenshot = () => {
  const canvas = document.createElement("canvas");
  const canvasCtx = canvas.getContext("2d");
  const video = document.getElementById('scrcpy-video');
  // 默认生成图片大小
  let w, h;
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    if (screenMode.value == 'Scrcpy') {
      w = imgWidth;
      h = imgHeight
    } else {
      w = 369;
      h = 800;
    }
  } else {
    if (screenMode.value == 'Scrcpy') {
      w = imgHeight;
      h = imgWidth
    } else {
      w = 800;
      h = 369;
    }
  }
  canvas.width = w;
  canvas.height = h;
  canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, w, h);
  return canvas.toDataURL('image/png', 1);
}
const quickCap = () => {
  let imageUrl;
  if (oldBlob) {
    const blob = new Blob([oldBlob], {type: 'image/jpeg'});
    const URL = window.URL || window.webkitURL;
    imageUrl = URL.createObjectURL(blob);
  } else {
    imageUrl = getVideoScreenshot()
  }
  const img = new Image();
  screenUrls.value.push(imageUrl);
  img.src = imageUrl;
};
const setPocoImgData = () => {
  let imageUrl;
  if (oldBlob) {
    const blob = new Blob([oldBlob], {type: 'image/jpeg'});
    const URL = window.URL || window.webkitURL;
    imageUrl = URL.createObjectURL(blob);
  } else {
    imageUrl = getVideoScreenshot()
  }
  const img = new Image();
  img.src = imageUrl;
  imgUrl.value = imageUrl;
  const canvasPoco = document.getElementById('debugPocoPic');
  img.onload = function () {
    canvasPoco.width = img.width;
    canvasPoco.height = img.height;
  };
  isShowPocoImg.value = true;
};
const setImgData = () => {
  let imageUrl;
  if (oldBlob) {
    const blob = new Blob([oldBlob], {type: 'image/jpeg'});
    const URL = window.URL || window.webkitURL;
    imageUrl = URL.createObjectURL(blob);
  } else {
    imageUrl = getVideoScreenshot()
  }
  const img = new Image();
  img.src = imageUrl;
  imgUrl.value = imageUrl;
  const canvas = document.getElementById('debugPic');
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
  };
  isShowImg.value = true;
};
const openSocket = (host, port, key, udId) => {
  if ('WebSocket' in window) {
    //
    websocket = new WebSocket(
        'ws://' + host + ':' + port + '/websockets/android/' + key + '/' + udId + '/' + localStorage.getItem('SonicToken'),
    );
    //
    __Scrcpy = new Scrcpy({
      socketURL: 'ws://' + host + ':' + port + '/websockets/android/screen/' + key + '/' + udId + '/' + localStorage.getItem('SonicToken'),
      node: 'scrcpy-video',
      onmessage: screenWebsocketOnmessage,
      excuteMode: screenMode.value
    });
    screenWebsocket = __Scrcpy.websocket;
    changeScreenMode(screenMode.value, 1)
    //
    terminalWebsocket = new WebSocket(
        'ws://' + host + ':' + port + '/websockets/android/terminal/' + key + '/' + udId + '/' + localStorage.getItem('SonicToken'),
    );
  } else {
    console.error($t('androidRemoteTS.noWebSocket'));
  }
  websocket.onmessage = websocketOnmessage;
  websocket.onclose = (e) => {
  };
  terminalWebsocket.onmessage = terminalWebsocketOnmessage;
  terminalWebsocket.onclose = (e) => {
  };
  driverLoading.value = true
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
const getWifiList = () => {
  terminalWebsocket.send(
      JSON.stringify({
        type: 'wifiList',
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
    case 'wifiListDetail': {
      isConnectWifi.value = JSON.parse(message.data).detail.isConnectWifi;
      currentWifi.value = JSON.parse(message.data).detail.connectedWifi.SSID;
      break;
    }
    case 'appListDetail': {
      appList.value.push(JSON.parse(message.data).detail);
      break;
    }
    case 'logcat':
      logcatOutPut.value.push($t('androidRemoteTS.connection'));
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
      cmdOutPut.value.push($t('androidRemoteTS.connection'));
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
        message: $t('androidRemoteTS.systemException'),
      });
      close();
      break;
  }
};
const screenWebsocketOnmessage = (message) => {
  // console.log('screenWebsocketOnmessage', message.data);
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
      case 'rotation': {
        if (directionStatus.value !== -1) {
          loading.value = true;
          ElMessage.success({
            message: $t("androidRemoteTS.messageOne"),
          });
        }
        directionStatus.value = JSON.parse(message.data).value; // TODO
        // 旋转需要重置一下jmuxer
        if (screenMode.value == 'Scrcpy') {
          // 重置播放器
          __Scrcpy.jmuxer && __Scrcpy.jmuxer.reset()
        }
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
      case 'picFinish': {
        loading.value = false;
        break;
      }
      case 'error':
        ElMessage.error({
          message: $t('androidRemoteTS.systemException'),
        });
        close();
        break;
    }
  }
};
const websocketOnmessage = (message) => {
  switch (JSON.parse(message.data)['msg']) {
    case 'poco': {
      pocoLoading.value = false;
      let result = JSON.parse(message.data).result
      if (result) {
        ElMessage.success({
          message: $t('androidRemoteTS.getPocoSuccess'),
        });
        pocoData.value = []
        pocoData.value.push(JSON.parse(result).result)
        setPocoTreeId(pocoData.value, treeId)
        currentPocoId.value = [1];
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.getPocoFail'),
        });
      }
      break
    }
    case 'proxyResult': {
      proxyWebPort.value = JSON.parse(message.data).webPort;
      proxyConnPort.value = JSON.parse(message.data).port;
      nextTick(() => {
        iFrameHeight.value = document.body.clientHeight - 150;
      });
      break;
    }
    case 'pullResult': {
      pullLoading.value = false
      if (JSON.parse(message.data).status === 'success') {
        ElMessage.success({
          message: $t('androidRemoteTS.pullFile.success'),
        });
        pullResult.value = JSON.parse(message.data).url
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.pullFile.fail'),
        });
      }
      break;
    }
    case 'pushResult': {
      pushLoading.value = false
      if (JSON.parse(message.data).status === 'success') {
        ElMessage.success({
          message: $t('androidRemoteTS.pushFile.success'),
        });
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.pushFile.fail'),
        });
      }
      break;
    }
    case 'sas': {
      remoteAdbLoading.value = false
      if (JSON.parse(message.data).isEnable && JSON.parse(message.data).port > 0) {
        remoteAdbUrl.value = agent.value['host'] + ':' + JSON.parse(message.data).port;
      }
      break;
    }
    case 'tree': {
      ElMessage.success({
        message: $t('androidRemoteTS.getEle.success'),
      });
      let result = JSON.parse(message.data);
      currentId.value = [1];
      elementData.value = result.detail;
      isShowTree.value = true;
      elementLoading.value = false;
      webViewData.value = result['webView'];
      activity.value = result['activity'];
      break;
    }
    case 'treeFail': {
      ElMessage.error({
        message: $t('androidRemoteTS.getEle.fail'),
      });
      elementLoading.value = false;
      break;
    }
    case 'installFinish': {
      if (JSON.parse(message.data).status === 'success') {
        ElMessage.success({
          message: $t('androidRemoteTS.install.success'),
        });
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.install.fail'),
        });
      }
      break;
    }
    case 'uninstallFinish': {
      if (JSON.parse(message.data).detail === 'success') {
        ElMessage.success({
          message: $t('androidRemoteTS.uninstall.success'),
        });
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.uninstall.fail'),
        });
      }
      break;
    }
    case 'openDriver': {
      ElMessage({
        type: JSON.parse(message.data).status,
        message: JSON.parse(message.data).detail,
      });
      driverLoading.value = false
      if (JSON.parse(message.data).status === 'success') {
        isDriverFinish.value = true;
      }
      break;
    }
    case 'step': {
      setStepLog(JSON.parse(message.data));
      break;
    }
    case 'status': {
      debugLoading.value = false;
      ElMessage.info({
        message: $t('androidRemoteTS.runOver'),
      });
      break;
    }
    case 'forwardView': {
      webViewLoading.value = false;
      ElMessage.success({
        message: $t('androidRemoteTS.getSuccess'),
      });
      webViewListDetail.value = JSON.parse(message.data)['detail'];
      break;
    }
    case 'eleScreen': {
      if (JSON.parse(message.data).img) {
        ElMessage.success({
          message: $t('androidRemoteTS.getPsSuccess'),
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
        message: $t('androidRemoteTS.systemException'),
      });
      close();
      router.go(-1);
      break;
    }
  }
};
const openDriver = () => {
  driverLoading.value = true
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'openDriver'
      }),
  );
}
const getCurLocation = () => {
  let x, y;
  let _x, _y;
  const canvas = touchWrapper;
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
  return ({
    x, y,
  });
};
const getCurLocationForAdb = () => {
  let x, y;
  let _x, _y;
  const canvas = touchWrapper;
  const rect = canvas.getBoundingClientRect();
  if (directionStatus.value != 0 && directionStatus.value != 180) { // 左右旋转
    _x = parseInt(
        (event.clientY - rect.top) *
        (imgWidth / canvas.clientHeight),
    );
    y = (directionStatus.value == 90) ? _x : imgWidth - _x;
    //
    _y = parseInt(
        (event.clientX - rect.left) *
        (imgHeight / canvas.clientWidth),
    );
    x = (directionStatus.value == 270) ? imgHeight - _y : _y;
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
  return ({
    x, y,
  });
};
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
    const {x, y} = getCurLocationForAdb();
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
    const {x, y} = getCurLocationForAdb();
    moveX = x;
    moveY = y;
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
      if (mouseMoveTime < 1) {
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
  let x;
  let y;
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    x = parseInt(
        (event.clientX - rect.left) * (imgWidth / debugPic.clientWidth),
    );
    y = parseInt(
        (event.clientY - rect.top) * (imgHeight / debugPic.clientHeight),
    );
  } else {
    x = parseInt(
        (event.clientX - rect.left) * (imgHeight / debugPic.clientWidth),
    );
    y = parseInt(
        (event.clientY - rect.top) * (imgWidth / debugPic.clientHeight),
    );
  }
  await nextTick(() => {
    tree['value'].setCurrentKey(
        findMinSize(findElementByPoint(elementData.value, x, y)),
    );
  });
  await handleNodeClick(tree['value'].getCurrentNode());
};
const touchstartpoco = async (event) => {
  const debugPic = document.getElementById('debugPocoPic');
  const rect = debugPic.getBoundingClientRect();
  let x;
  let y;
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    x = parseInt(
        (event.clientX - rect.left) * (imgWidth / debugPic.clientWidth),
    );
    y = parseInt(
        (event.clientY - rect.top) * (imgHeight / debugPic.clientHeight),
    );
  } else {
    x = parseInt(
        (event.clientX - rect.left) * (imgHeight / debugPic.clientWidth),
    );
    y = parseInt(
        (event.clientY - rect.top) * (imgWidth / debugPic.clientHeight),
    );
  }
  await nextTick(() => {
    pocoTree['value'].setCurrentKey(
        findPocoMinSize(findPocoByPoint(pocoData.value, x, y)),
    );
  });
  await handlePocoClick(pocoTree['value'].getCurrentNode());
};
const findPocoMinSize = (data) => {
  if (data.length === 0) {
    return null;
  }
  let result = data[0];
  for (let i in data) {
    if (data[i].size === result.size) {
      result = data[i];
    }
    if (data[i].size < result.size) {
      result = data[i];
    }
  }
  currentPocoId.value = [result.ele.id];
  return result.ele.id;
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
const findPocoByPoint = (ele, x, y) => {
  let result = [];
  for (let i in ele) {
    let eleStartX;
    let eleStartY;
    let eleEndX;
    let eleEndY;
    if (directionStatus.value === 0 || directionStatus.value === 180) {
      eleStartX = ele[i].payload.pos[0] * imgWidth - (ele[i].payload.size[0] * imgWidth / 2)
      eleStartY = ele[i].payload.pos[1] * imgHeight - (ele[i].payload.size[1] * imgHeight / 2)
      eleEndX = ele[i].payload.pos[0] * imgWidth + (ele[i].payload.size[0] * imgWidth / 2)
      eleEndY = ele[i].payload.pos[1] * imgHeight + (ele[i].payload.size[1] * imgHeight / 2)
    } else {
      eleStartX = ele[i].payload.pos[0] * imgHeight - (ele[i].payload.size[0] * imgHeight / 2)
      eleStartY = ele[i].payload.pos[1] * imgWidth - (ele[i].payload.size[1] * imgWidth / 2)
      eleEndX = ele[i].payload.pos[0] * imgHeight + (ele[i].payload.size[0] * imgHeight / 2)
      eleEndY = ele[i].payload.pos[1] * imgWidth + (ele[i].payload.size[1] * imgWidth / 2)
    }
    if (x >= eleStartX && x <= eleEndX && y >= eleStartY && y <= eleEndY) {
      result.push({
        ele: ele[i],
        size: (eleEndX - eleStartX) * (eleEndY - eleStartY)
      });
    }
    if (ele[i].children) {
      let childrenResult = findPocoByPoint(ele[i].children, x, y);
      if (childrenResult.length > 0) {
        result.push.apply(result, childrenResult);
      }
    }
  }
  return result;
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
const handlePocoClick = (data) => {
  if (data !== null) {
    pocoDetail.value = data.payload;
    printPoco(data.payload);
  }
};
const printPoco = (data) => {
  const canvas = document.getElementById('debugPocoPic'),
      g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  const eleStartX = data.pos[0] * imgWidth - (data.size[0] * imgWidth) / 2;
  const eleStartY = data.pos[1] * imgHeight - (data.size[1] * imgHeight) / 2;
  let a = Math.round(Math.random() * 255);
  let b = Math.round(Math.random() * 255);
  let c = Math.round(Math.random() * 255);
  g.fillStyle = 'rgba(' + a + ', ' + b + ', ' + c + ', 0.6)';
  g.fillRect(
      eleStartX * (canvas.width / imgWidth),
      eleStartY * (canvas.height / imgHeight),
      data.size[0] * imgWidth * (canvas.width / imgWidth),
      data.size[1] * imgHeight * (canvas.height / imgHeight),
  );
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
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    g.fillRect(
        eleStartX * (canvas.width / imgWidth),
        eleStartY * (canvas.height / imgHeight),
        (eleEndX - eleStartX) * (canvas.width / imgWidth),
        (eleEndY - eleStartY) * (canvas.height / imgHeight),
    );
  } else {
    g.fillRect(
        eleStartX * (canvas.width / imgHeight),
        eleStartY * (canvas.height / imgWidth),
        (eleEndX - eleStartX) * (canvas.width / imgHeight),
        (eleEndY - eleStartY) * (canvas.height / imgWidth),
    );
  }
};
const searchDevice = () => {
  websocket.send(
      JSON.stringify({
        type: 'find',
      }),
  );
};
const startProxy = () => {
  websocket.send(
      JSON.stringify({
        type: 'proxy',
      }),
  );
};
const installCert = () => {
  websocket.send(
      JSON.stringify({
        type: 'installCert',
      }),
  );
};
const openApp = (pkg) => {
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'openApp',
        pkg,
      }),
  );
};
const refreshAppList = () => {
  appList.value = [];
  ElMessage.success({
    message: $t('androidRemoteTS.loadIng'),
  });
  terminalWebsocket.send(
      JSON.stringify({
        type: 'appList',
      }),
  );
};
const clearProxy = () => {
  ElMessage.success({
    message: $t('androidRemoteTS.messageTwo'),
  });
  websocket.send(
      JSON.stringify({
        type: 'clearProxy',
      }),
  );
};
const uninstallApp = (pkg) => {
  ElMessage.success({
    message: $t('androidRemoteTS.startUninstall'),
  });
  websocket.send(
      JSON.stringify({
        type: 'uninstallApp',
        detail: pkg,
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
    case $t('androidRemoteTS.low'):
      pic = 'low';
      break;
    case $t('androidRemoteTS.middle'):
      pic = 'middle';
      break;
    case $t('androidRemoteTS.high'):
      pic = 'high';
      break;
    case 'fixed':
      pic = 'fixed';
      break;
  }
  screenWebsocket.send(
      JSON.stringify({
        type: 'pic',
        detail: pic,
      }),
  );
};
const changeScreenMode = (type, isInit) => {
  if (isInit !== 1) {
    loading.value = true;
    __Scrcpy.switchMode(type);
    screenMode.value = type;
    oldBlob = undefined;
  }
  if (type === 'Minicap') {
    touchWrapper = document.getElementById('canvas');
  } else {
    oldBlob = undefined // 清除记录
    touchWrapper = document.getElementById('scrcpy-video');
  }
  // 储存最后模式
  window.localStorage.setItem('screenMode', type);
};
const pullPath = ref("")
const pullLoading = ref(false)
const pullResult = ref("")
const pullFile = () => {
  pullResult.value = "";
  pullLoading.value = true
  websocket.send(
      JSON.stringify({
        type: 'pullFile',
        path: pullPath.value
      }),
  );
}
const fileLoading = ref(false);
const upLoadFilePath = ref("");
const pushPath = ref("")
const pushLoading = ref(false)
const pushFile = () => {
  pushLoading.value = true
  websocket.send(
      JSON.stringify({
        type: 'pushFile',
        file: upLoadFilePath.value,
        path: pushPath.value
      }),
  );
}
const uploadFile = (content) => {
  fileLoading.value = true;
  let formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'packageFiles');
  axios
      .post('/folder/upload', formData, {headers: {'Content-type': 'multipart/form-data'}})
      .then((resp) => {
        fileLoading.value = false;
        if (resp['code'] === 2000) {
          upLoadFilePath.value = resp['data'];
        }
      });
};
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    return true;
  } else {
    ElMessage.error({
      message: $t('androidRemoteTS.failErr'),
    });
    return false;
  }
};
let treeId = 1;
const setPocoTreeId = (data) => {
  for (let i in data) {
    data[i].id = treeId;
    treeId++;
    if (data[i].children) {
      setPocoTreeId(data[i].children, treeId)
    }
  }
}
const beforeAvatarUpload2 = (file) => {
  if (file.name.endsWith('.apk')) {
    return true;
  } else {
    ElMessage.error({
      message: $t('androidRemoteTS.failErr'),
    });
    return false;
  }
};
const limitOut = () => {
  ElMessage.error({
    message: $t('androidRemoteTS.addOne'),
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
      message: $t('androidRemoteTS.startInstall'),
    });
  }
};
const getElement = () => {
  elementLoading.value = true;
  setImgData();
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'tree',
      }),
  );
};
const switchPocoType = (e) => {
  switch (e) {
    case "UNITY_3D":
    case "UE4":
      pocoPort.value = "5001";
      break;
    case "COCOS_2DX_JS":
    case "COCOS_CREATOR":
    case "EGRET":
      pocoPort.value = "5003";
      break;
    case "COCOS_2DX_LUA":
      pocoPort.value = "15004";
      break;
    case "COCOS_2DX_C_PLUS_1":
      pocoPort.value = "18888";
      break;
  }
}
const getPoco = (engine) => {
  pocoLoading.value = true;
  setPocoImgData();
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: "poco",
        engine: engine,
        port: pocoPort.value
      }),
  );
}
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
  if (screenWebsocket !== null) {
    screenWebsocket.close();
    screenWebsocket = null;
    __Scrcpy && __Scrcpy.destroy();
    __Scrcpy = null;
  }
  if (terminalWebsocket !== null) {
    terminalWebsocket.close();
    terminalWebsocket = null;
  }
  if (audioPlayer !== null) {
    destroyAudio();
  }
  window.close()
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
          message: $t('androidRemoteTS.deviceFail'),
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
    },
  });
  audioPlayer.ws.onError(function () {
    destroyAudio();
  });
};
const playAudio = () => {
  if (audioPlayer) {
    ElMessage.warning({
      message: $t('androidRemoteTS.remoteAudio'),
    });
    return;
  }
  initAudioPlayer();
  audioPlayer.onPlay();
  ElMessage.success({
    message: $t('androidRemoteTS.audio'),
  });
};
const destroyAudio = () => {
  audioPlayer.onDestroy();
  audioPlayer = null;
  isConnectAudio.value = false;
  ElMessage.info({
    message: $t('androidRemoteTS.audioFail'),
  });
};
const resetAudioPlayer = () => {
  audioPlayer.jmuxer.reset();
  audioPlayer.onPlay();
  ElMessage.success({
    message: $t('androidRemoteTS.audioSuccess'),
  });
};
const getProjectList = () => {
  axios
      .get("/controller/projects/list").then((resp) => {
    store.commit("saveProjectList", resp.data);
  })
}
onMounted(() => {
  if (store.state.project.id) {
    project.value = store.state.project;
  } else {
    getProjectList()
  }
  getDeviceById(route.params.deviceId);
  store.commit('autoChangeCollapse');
});
</script>

<template>
  <el-dialog
      :title="$t('androidRemoteTS.code.elementsSnapshot')"
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
          :label="$t('androidRemoteTS.code.eleName')"
          :rules="{
            required: true,
            message: $t('androidRemoteTS.code.eleNullName'),
            trigger: 'blur',
          }"
      >
        <el-input
            v-model="element.eleName"
            :placeholder="$t('androidRemoteTS.code.inputName')"
        ></el-input>
      </el-form-item>
      <div style="text-align: center">
        <el-button size="small" type="primary" @click="saveEle"
        >{{ $t('androidRemoteTS.code.saveEle') }}
        </el-button
        >
      </div>
    </el-form>
  </el-dialog>
  <el-dialog v-model="dialogElement" :title="$t('elements.eleInfo')" width="600px">
    <element-update v-if="dialogElement" :project-id="project['id']"
                    :element-id="0" :element-obj="element" @flush="dialogElement = false"/>
  </el-dialog>
  <el-page-header
      @back="close"
      :content="$t('routes.remoteControl')"
      style="margin-top: 15px;margin-left: 20px"/>
  <div style="padding: 20px">
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
                 :element-loading-text="$t('androidRemoteTS.code.preparingImager')"
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
                  <el-form-item :label="$t('devices.detail.name')">
                    <span>{{ device.name }}</span>
                  </el-form-item>
                  <el-form-item :label="$t('devices.detail.model')">
                    <span>{{ device['model'] }}</span>
                  </el-form-item>
                  <el-form-item :label="$t('devices.detail.udId')">
                    <span>{{ device['udId'] }}</span>
                  </el-form-item>
                  <el-form-item :label="$t('devices.form.system')">
                    <img
                        height="25"
                        style="position: absolute; top: 7px; bottom: 7px; left: 7px"
                        :src="getImg(device['isHm']===1?'HarmonyOs':'ANDROID')"
                    />
                  </el-form-item>
                  <el-form-item :label="$t('androidRemoteTS.code.systemVersion')">
                    <span>{{ device['version'] }}</span>
                  </el-form-item>
                  <el-form-item :label="$t('devices.detail.size')">
                    <span>{{ device['size'] }}</span>
                  </el-form-item>
                  <el-form-item :label="$t('devices.detail.cpu')">
                    <span>{{ device['cpu'] }}</span>
                  </el-form-item>
                  <el-form-item :label="$t('devices.filter.manufacturer')">
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
            <video
                id="scrcpy-video"
                @mouseup="mouseup"
                @mousemove="mousemove"
                @mousedown="mousedown"
                @mouseleave="mouseleave"
                style="display: inline-block; min-height: 100%"
                :style="canvasRectInfo"
                autoplay
                muted
                v-show="screenMode == 'Scrcpy'"
            />
            <canvas
                id="canvas"
                @mouseup="mouseup"
                @mousemove="mousemove"
                @mousedown="mousedown"
                @mouseleave="mouseleave"
                style="display: inline-block"
                :style="canvasRectInfo"
                v-show="screenMode != 'Scrcpy'"
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
                :content="$t('androidRemoteTS.code.projectionMode')"
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
                      <VideoCamera/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-radio-group
                          v-loading="loading"
                          v-model="screenMode"
                          size="mini"
                          @change="changeScreenMode"
                      >
                        <el-radio-button label="Scrcpy"></el-radio-button>
                        <el-radio-button label="Minicap"></el-radio-button>
                      </el-radio-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                :enterable="false"
                effect="dark"
                :content="$t('androidRemoteTS.code.frameNumber')"
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
                        <el-radio-button :label="$t('androidRemoteTS.low')"></el-radio-button>
                        <el-radio-button :label="$t('androidRemoteTS.middle')"></el-radio-button>
                        <el-radio-button :label="$t('androidRemoteTS.high')"></el-radio-button>
                      </el-radio-group>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                :enterable="false"
                effect="dark"
                :content="$t('androidRemoteTS.code.manualRepair')"
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
                            :content="$t('androidRemoteTS.code.fixBlackScreen')"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              :disabled="screenMode !== 'Minicap'"
                              @click="changePic('fixed')"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <Cellphone/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            :content="$t('androidRemoteTS.code.fixTouch')"
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
                        <el-tooltip
                            effect="dark"
                            :content="$t('androidRemoteTS.code.fixScreen')"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="fixOri"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <Postcard/>
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
                :content="$t('androidRemoteTS.code.remoteAudioTran')"
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
                :content="$t('androidRemoteTS.code.batterySimulation')"
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
                            :content="$t('androidRemoteTS.code.simulatePowerOutage')"
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
                            :content="$t('androidRemoteTS.code.reset')"
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
                :content="$t('androidRemoteTS.code.physicalLookup')"
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
                :content="$t('androidRemoteTS.code.BV')"
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
                :content="$t('androidRemoteTS.code.dial')"
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
                :content="$t('androidRemoteTS.code.photograph')"
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
                :content="$t('androidRemoteTS.code.browser')"
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
                :content="$t('androidRemoteTS.code.LUS')"
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
          <el-tab-pane :label="$t('androidRemoteTS.code.remoteControlPanel')" name="main">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <strong>{{ $t('androidRemoteTS.code.inputText') }}</strong>
                  </template>
                  <el-form size="small" :model="text">
                    <el-form-item
                    >
                      <el-input
                          clearable
                          v-model="text.content"
                          size="small"
                          :placeholder="$t('androidRemoteTS.code.pleaseText')"
                      ></el-input>
                    </el-form-item>
                  </el-form>
                  <div style="text-align: center;">
                    <el-button
                        size="mini"
                        type="primary"
                        @click="sendText(text.content)"
                    >{{ $t('androidRemoteTS.code.send') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-tabs type="border-card" stretch>
                  <el-tab-pane :label="$t('androidRemoteTS.code.remoteADB')">
                    <div v-loading="remoteAdbLoading"
                         style="margin-top: 18px;margin-bottom: 18px">
                      <div v-if="remoteAdbUrl.length>0" style="margin-top: 20px;margin-bottom: 20px">
                        <el-card :body-style="{backgroundColor:'#303133',cursor:'pointer'}"
                                 @click="copy('adb connect '+remoteAdbUrl)">
                          <strong style="color: #F2F6FC">adb connect {{ remoteAdbUrl }}</strong>
                        </el-card>
                      </div>
                      <div v-else>
                        <el-card>
                          <strong>{{ $t('androidRemoteTS.code.noAgent') }}</strong>
                        </el-card>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-col>
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <strong>{{ $t('projectIndexTS.code.other') }}</strong>
                  </template>
                  <div style="text-align: center">
                    <div style="margin: 10px 0px">
                      <el-button size="mini" type="primary" :disabled="isDriverFinish" :loading="driverLoading"
                                 @click="openDriver">{{ $t('androidRemoteTS.code.UIAutomator2ServerInit') }}
                      </el-button>
                      <div style="margin-top: 8px">Status:
                        <span :style="isDriverFinish?'color:#67C23A':'color:#606266'">
                          {{ isDriverFinish ? "Connected" : "Diconnected" }}
                      </span>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12" style="margin-top: 15px">
                <el-card>
                  <template #header>
                    <strong>{{ $t('androidRemoteTS.code.scanQRCode') }}</strong>
                  </template>
                  <el-alert :title="$t('androidRemoteTS.code.errTitle')" type="info" show-icon :closable="false">
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
                      <div class="el-upload__text">{{ $t('androidRemoteTS.code.messageThree') }}
                        <em>{{ $t('devices.detail.uploadImg') }}</em></div>
                      <template #tip>
                        <div class="el-upload__tip">{{ $t('androidRemoteTS.code.messageFour') }}</div>
                      </template>
                    </el-upload>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12" style="margin-top: 15px">
                <el-card>
                  <template #header>
                    <strong>{{ $t('androidRemoteTS.code.fileTransfer') }}</strong>
                  </template>
                  <div style="text-align: center">
                    <el-tabs type="border-card" stretch>
                      <el-tab-pane :label="$t('androidRemoteTS.code.upFile')">
                        <el-upload
                            v-loading="fileLoading"
                            drag
                            action=""
                            :with-credentials="true"
                            :limit="1"
                            :on-exceed="limitOut"
                            :http-request="uploadFile"
                        >
                          <i class="el-icon-upload"></i>
                          <div class="el-upload__text">{{ $t('androidRemoteTS.code.messageFive') }}
                            <em>{{ $t('devices.detail.uploadImg') }}</em></div>
                        </el-upload>
                        <div style="display: flex;margin-top: 5px">
                          <el-input size="mini" v-model="pushPath"
                                    :placeholder="$t('androidRemoteTS.code.pleaseFilePath')"></el-input>
                          <el-button style="margin-left: 5px" size="mini" type="primary" :loading="pushLoading"
                                     :disabled="pushPath.length===0||upLoadFilePath.length===0"
                                     @click="pushFile">Push
                          </el-button>
                        </div>
                      </el-tab-pane>
                      <el-tab-pane :label="$t('androidRemoteTS.code.filePath')">
                        <el-input size="mini" :placeholder="$t('androidRemoteTS.code.pullFilePath')"
                                  v-model="pullPath"></el-input>
                        <el-button style="margin-top: 5px" size="mini" type="primary" :loading="pullLoading"
                                   :disabled="pullPath.length===0"
                                   @click="pullFile">Pull
                        </el-button>
                        <a :href="pullResult" download target="_blank" v-if="pullResult.length!==0">
                          <el-button style="margin-top: 5px;margin-left:10px" size="mini" type="success">
                            {{ $t('androidRemoteTS.code.installFile') }}
                          </el-button>
                        </a>
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane :label="$t('androidRemoteTS.code.app')" name="apps">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card shadow="hover">
                  <template #header>
                    <strong>{{ $t('androidRemoteTS.code.pushInstall') }}</strong>
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
                      <div class="el-upload__text">{{ $t('androidRemoteTS.code.apkFile') }}
                        <em>{{ $t('devices.detail.uploadImg') }}</em></div>
                      <template #tip>
                        <div class="el-upload__tip">{{ $t('androidRemoteTS.code.onlyAPKFile') }}</div>
                      </template>
                    </el-upload>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="hover" class="url-install-box"
                         :body-style="{position: 'absolute',top: '50%', width: '100%',paddingTop: '56px',paddingBottom: '0',boxSizing: 'border-box',transform: 'translateY(-50%)'}">
                  <template #header>
                    <strong>{{ $t('androidRemoteTS.code.URLInstall') }}</strong>
                  </template>
                  <el-input
                      clearable
                      v-model="uploadUrl"
                      size="small"
                      :placeholder="$t('androidRemoteTS.code.hint')"
                  ></el-input>
                  <div style="text-align: center;margin-top: 20px">
                    <el-button
                        size="mini"
                        type="primary"
                        :disabled="uploadUrl.length===0"
                        @click="install(uploadUrl)"
                    >{{ $t('androidRemoteTS.code.send') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-card shadow="hover" style="margin-top:15px">
              <el-table :data="currAppListPageData" border>
                <el-table-column width="90" header-align="center">
                  <template #header>
                    <el-button size="mini" @click="refreshAppList">{{
                        $t('androidRemoteTS.code.refresh')
                      }}
                    </el-button>
                  </template>
                  <template #default="scope">
                    <div style="display: flex;align-items: center;justify-content: center;">
                      <el-avatar shape="square" :size="40"
                                 :src="'data:image/png;base64,'+scope.row.appIcon"></el-avatar>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column width="150" show-overflow-tooltip header-align="center" prop="appName"
                                 :label="$t('androidRemoteTS.code.appName')">
                </el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="packageName"
                                 :label="$t('androidRemoteTS.code.packagesName')">
                  <template #default="scope">
                    <div style="cursor: pointer" @click="copy(scope.row.packageName)">{{
                        scope.row.packageName
                      }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="versionName"
                                 :label="$t('androidRemoteTS.code.version')"
                                 width="120"></el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="versionCode"
                                 :label="$t('androidRemoteTS.code.subversion')"
                                 width="120"></el-table-column>
                <el-table-column align="center" width="200">
                  <template #header>
                    <el-input v-model="filterAppText" size="mini"
                              :placeholder="$t('androidRemoteTS.code.nameSearch')"/>
                  </template>
                  <template #default="scope">
                    <el-button size="mini" @click="openApp(scope.row.packageName)" type="primary">
                      {{ $t('androidRemoteTS.code.open') }}
                    </el-button>
                    <el-button size="mini" @click="uninstallApp(scope.row.packageName)" type="danger">
                      {{ $t('androidRemoteTS.code.unInstall') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <Pageable
                  :isPageSet="false"
                  :total="filterTableData.length"
                  :current-page="currAppListPageIndex + 1"
                  :page-size="7"
                  @change="changeAppListPage"
              ></Pageable>
            </el-card>
          </el-tab-pane>
          <el-tab-pane :label="$t('androidRemoteTS.code.packet')" name="proxy">
            <el-button size="small" type="success" @click="startProxy">{{
                $t('androidRemoteTS.code.startPacket')
              }}
            </el-button>
            <el-button size="small" @click="installCert">{{
                $t('androidRemoteTS.code.downloadCertificate')
              }}
            </el-button>
            <el-button size="small" @click="clearProxy">{{ $t('androidRemoteTS.code.cancelGlobalProxy') }}</el-button>
            <strong v-if="proxyConnPort!==0"
                    style="color: #67c23a;float: right;margin-top: 5px">{{
                $t('androidRemoteTS.code.proxyConnection')
              }}：{{
                agent['host'] + ':' + proxyConnPort
              }}</strong>
            <span style="float: right;display: flex;
            			   align-items: center;">
                          <el-button size="mini" @click="getWifiList"
                                     style="margin-right: 6px">{{ $t('androidRemoteTS.code.refresh') }}</el-button>
                          <ColorImg
                              :src="wifiLogo"
                              :width="18"
                              :height="18"
                              :color="isConnectWifi?'#67C23A':'#F56C6C'"
                          />
                          <span style="margin-left:6px;color: #67C23A;font-size: 16px">{{
                              (currentWifi.length > 0 && isConnectWifi) ? currentWifi.replaceAll('"', '') : ' '
                            }}</span>
                        </span>
            <iframe v-if="proxyWebPort!==0" allow="clipboard-read;clipboard-write"
                    :style="'border:1px solid #C0C4CC;;width: 100%;height: '+iFrameHeight+'px;margin-top:15px'"
                    :src="'http://'+agent['host']+':'+proxyWebPort"></iframe>
            <el-card v-else style="margin-top:20px">
              <template #header><strong>{{ $t('androidRemoteTS.code.useTeaching') }}</strong></template>
              <div style="height: 300px">
                <el-steps direction="vertical" :active="3">
                  <el-step :title="$t('androidRemoteTS.code.connectWifi')" status="process"
                           :description="$t('androidRemoteTS.code.connectWifiText')"/>
                  <el-step :title="$t('androidRemoteTS.code.installCertificate')" status="process"
                           :description="$t('androidRemoteTS.code.installCertificateText')"/>
                  <el-step :title="$t('androidRemoteTS.code.startCapturing')" status="process"
                           :description="$t('androidRemoteTS.code.startCapturingText')"/>
                </el-steps>
              </div>
            </el-card>
          </el-tab-pane>
          <el-tab-pane :label="$t('androidRemoteTS.code.screenshotQuick')" name="screenCap">
            <el-button type="primary" size="small" @click="quickCap">
              <el-icon :size="12" style="vertical-align: middle;">
                <Camera/>
              </el-icon>
              {{ $t('androidRemoteTS.code.screenshot') }}
            </el-button>
            <el-button type="danger" size="small" @click="removeScreen">
              <el-icon :size="12" style="vertical-align: middle;">
                <Delete/>
              </el-icon>
              {{ $t('androidRemoteTS.code.clean') }}
            </el-button>
            <el-card style="height: 100%;margin-top: 10px" v-if="screenUrls.length===0">
              <el-empty :description="$t('androidRemoteTS.code.noScreenshots')"></el-empty>
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
                      {{ $t('androidRemoteTS.code.savePicture') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Terminal" name="terminal">
            <el-alert
                :title="$t('androidRemoteTS.code.precautions')"
                type="warning"
                :description="$t('androidRemoteTS.code.precautionsText')"
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
                    <el-input @keyup.enter="sendCmd" size="mini" v-model="cmdInput"
                              :placeholder="$t('androidRemoteTS.code.inputSend')">
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
                              :placeholder="$t('androidRemoteTS.code.enterInput')">
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
          <el-tab-pane :label="$t('androidRemoteTS.code.UIAutomation.UIAutomationName')" name="auto">
            <div v-if="testCase['id']">
              <el-collapse accordion style="margin-bottom: 20px">
                <el-collapse-item>
                  <template #title>
                    <div style="display: flex; align-items: center;width: 100%;justify-content: space-between;">
                      <strong style="font-size: 15px;color: #909399;margin-left: 10px">{{
                          $t('androidRemoteTS.code.UIAutomation.testInfo')
                        }}</strong>
                      <el-button style="margin-right: 10px" type="danger" size="mini" @click="removeCase">
                        {{ $t('androidRemoteTS.code.UIAutomation.clean') }}
                      </el-button>
                    </div>
                  </template>
                  <el-descriptions :column="2" size="medium" border>
                    <el-descriptions-item width="100px" :label="$t('projectIndexTS.page.caseId')">{{
                        testCase['id']
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item width="100px" :label="$t('projectIndexTS.page.caseName')">{{
                        testCase.name
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('androidRemoteTS.code.UIAutomation.fatherPlayed')">
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
                    <el-descriptions-item :label="$t('stepListViewTS.platformToBe')">
                      <div style=" display: flex;align-items: center;">
                        <el-avatar
                            style="margin-right: 10px"
                            :size="27"
                            :src="getImg(testCase['platform']===1?'ANDROID':'IOS')"
                            shape="square"
                        ></el-avatar
                        >
                        {{ testCase['platform'] === 1 ? $t('publicStepTS.android') : 'iOS' }}
                      </div>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.module')">
                      {{ testCase['modulesDTO'] !== null ? testCase['modulesDTO'].name : "" }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.versionName')">{{
                        testCase['version']
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.designer')">{{
                        testCase['designer']
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.last')">{{
                        testCase['editTime']
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.testMessage')">{{
                        testCase['des']
                      }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>
              <el-tabs type="border-card" stretch v-model="activeTab2">
                <el-tab-pane :label="$t('publicStepTS.list')" name="step">
                  <step-list :is-show-run="true" :platform="1" :is-driver-finish="isDriverFinish"
                             :case-id="testCase['id']"
                             :project-id="project['id']"
                             :debug-loading="debugLoading"
                             @runStep="runStep"/>
                </el-tab-pane>
                <el-tab-pane :label="$t('resultDetailTS.page.runLog')" name="log">
                  <step-log :is-read-only="false" :debug-loading="debugLoading" :step-log="stepLog"
                            @clearLog="clearLog" @stopStep="stopStep"/>
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-else>
                <span style="color: #909399;margin-right: 10px">{{
                    $t('androidRemoteTS.code.associatedProject')
                  }}</span>
              <el-select size="mini" v-model="project" value-key="id"
                         :placeholder="$t('androidRemoteTS.code.chooseProject')">
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
                {{ $t('androidRemoteTS.code.addCase') }}
              </el-button>
              <test-case-list ref="caseList" v-if="project!==null"
                              :project-id="project['id']"
                              :platform="1"
                              :is-read-only="true"
                              @select-case="selectCase"></test-case-list>
              <el-card style="height: 100%;margin-top:20px">
                <el-result icon="info" :title="$t('androidRemoteTS.code.hintText')"
                           :subTitle="$t('androidRemoteTS.code.hintMessage')">
                </el-result>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('routes.controlElement')" name="ele">
            <el-tabs stretch type="border-card">
              <el-tab-pane :label="$t('androidRemoteTS.code.nativeControls')">
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
                      {{ $t('androidRemoteTS.code.retrieveControlEle') }}
                    </el-button
                    >
                    <span style="margin-right:10px;color: #909399;font-size: 14px; cursor: pointer"
                          @click="copy(activity)"
                          v-if="activity.length > 0">{{ $t('androidRemoteTS.code.activity') }}： {{ activity }}</span>
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
                              :label="$t('androidRemoteTS.code.webViewList')"
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
                            :placeholder="$t('androidRemoteTS.code.classFilter')"
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
                        <div style="height: 695px">
                          <div style="text-align: center; margin-bottom: 10px" v-if="project && project['id']">
                            <el-button
                                :disabled="elementDetail === null"
                                plain
                                size="small"
                                type="primary"
                                round
                                @click="toAddElement('','')"
                            >{{ $t('androidRemoteTS.code.addControls') }}
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
                            >{{ $t('androidRemoteTS.code.controlSnapshot') }}
                            </el-button
                            >
                          </div>
                          <el-alert style="margin-bottom: 10px" v-else
                                    :title="$t('androidRemoteTS.code.titleMessage')"
                                    type="info" show-icon
                                    close-text="Get!"/>
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
                              >
                                <span @click="copy(elementDetail['resource-id'])">{{
                                    elementDetail['resource-id']
                                  }}</span>
                                <el-icon color="green" size="16" v-if="project && project['id']"
                                         style="vertical-align: middle;margin-left: 10px"
                                         @click="toAddElement('id', elementDetail['resource-id'])">
                                  <Pointer/>
                                </el-icon>

                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.xpath')">
                                <el-table stripe :empty-text="$t('androidRemoteTS.code.xpathNull')" border
                                          :data="findBestXpath(elementDetail)"
                                          :show-header="false">
                                  <el-table-column>
                                    <template #default="scope">
                                      <span style="cursor: pointer" @click="copy(scope.row)">{{ scope.row }}</span>
                                      <el-icon color="green" size="16" v-if="project && project['id']"
                                               style="vertical-align: middle;margin-left: 10px"
                                               @click="toAddElement('xpath', scope.row)">
                                        <Pointer/>
                                      </el-icon>
                                    </template>
                                  </el-table-column>
                                </el-table>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.absolutePath')" style="cursor: pointer">
                                <span @click="copy(elementDetail['xpath'])">{{ elementDetail['xpath'] }}</span>
                                <el-icon color="green" size="16" v-if="project && project['id']"
                                         style="vertical-align: middle;margin-left: 10px"
                                         @click="toAddElement('xpath', elementDetail['xpath'])">
                                  <Pointer/>
                                </el-icon>

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
                              <el-form-item :label="$t('androidRemoteTS.code.centerXY')" style="cursor: pointer">
                                <span @click="copy(computedCenter(elementDetail['bStart'], elementDetail['bEnd']))">{{
                                    computedCenter(elementDetail['bStart'], elementDetail['bEnd'])
                                  }}</span>
                                <el-icon color="green" size="16" v-if="project && project['id']"
                                         style="vertical-align: middle;margin-left: 10px"
                                         @click="toAddElement('point', computedCenter(elementDetail['bStart'], elementDetail['bEnd']))">
                                  <Pointer/>
                                </el-icon>

                              </el-form-item>
                              <el-form-item label="index">
                                <span>{{ elementDetail['index'] }}</span>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.one')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['checkable'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.two')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['checked'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.three')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['clickable'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.four')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['selected'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.five')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['displayed'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.six')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['enabled'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.seven')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['focusable'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.eight')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['focused'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.nine')">
                                <el-switch
                                    :value="JSON.parse(elementDetail['long-clickable'])"
                                    disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item :label="$t('androidRemoteTS.code.label.ten')">
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
                  <el-result icon="info" :title="$t('androidRemoteTS.code.hintText')"
                             :subTitle="$t('androidRemoteTS.code.subTitleText')">
                    <template #extra>
                      <el-button size="mini" type="primary" :disabled="isDriverFinish" :loading="driverLoading"
                                 @click="openDriver">{{ $t('androidRemoteTS.code.UIAutomator2ServerInit') }}
                      </el-button>
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
                        {{ $t('androidRemoteTS.code.getEle') }}
                      </el-button
                      >
                    </template>
                  </el-result>
                </el-card>
              </el-tab-pane>
              <el-tab-pane :label="$t('androidRemoteTS.code.poco')">
                <div style="margin-bottom: 10px;display: flex">
                  <el-select v-model="selectPocoType" size="mini" @change="switchPocoType">
                    <el-option
                        v-for="item in pocoTypeList"
                        :key="item.name"
                        :value="item.value"
                        :label="item.name"
                    >
                      <div style="display: flex;align-items: center">
                        <el-avatar
                            style="margin-right: 10px"
                            :size="28"
                            :src="getImg(item.img)"
                            shape="square"
                        ></el-avatar
                        >
                        {{ item.name }}
                      </div>
                    </el-option>
                  </el-select>
                  <el-input placeholder="Default connect port" style="margin-left: 10px;width: 200px"
                            v-model="pocoPort"
                            size="mini"></el-input>
                  <el-button style="margin-left: 10px" type="primary" :loading="pocoLoading" size="mini"
                             :disabled="selectPocoType.length===0"
                             @click="getPoco(selectPocoType)">{{ $t('androidRemoteTS.code.getPoco') }}
                  </el-button>
                  <el-link style="position: absolute;right:20px;" type="primary"
                           href="https://poco.readthedocs.io/en/latest/source/doc/integration.html" target="_blank">
                    {{ $t('androidRemoteTS.code.pocoSDK') }}
                  </el-link>
                </div>
                <el-row
                    :gutter="10"
                    v-show="isShowPocoImg"
                >
                  <el-col :span="8">
                    <el-card shadow="hover">
                      <div
                          :style="
                             'width: 100%;background-image: url(' +
                          imgUrl +
                        ');background-size: 100% 100%;'
                                        "
                      >
                        <canvas id="debugPocoPic" @mousedown="touchstartpoco"></canvas>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card
                        shadow="hover"
                    >
                      <div style="height: 660px">
                        <el-scrollbar
                            class="element-tree-scrollbar"
                            style="height: 100%"
                        >
                          <el-tree
                              :indent="13"
                              :default-expanded-keys="currentPocoId"
                              node-key="id"
                              style="margin-top: 10px; margin-bottom: 20px"
                              :highlight-current="true"
                              ref="pocoTree"
                              :accordion="true"
                              :data="pocoData"
                              @node-click="handlePocoClick"
                          >
                            <template #default="{ node, data }">
                              <div style="margin-right: 5px" v-if="data.payload">
                                <el-icon v-if="data.payload.type==='Root'||data.payload.type==='Scene'" :size="15"
                                         style="margin-top: 3px;color:#67C23A">
                                  <Operation/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Node'" :size="15"
                                         style="margin-top: 3px;color:#67C23A">
                                  <Share/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Button'" :size="15"
                                         style="margin-top: 3px;color:#409EFF">
                                  <HelpFilled/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Layer'" :size="15"
                                         style="margin-top: 3px;color:#409EFF">
                                  <Coin/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Image'||data.payload.type==='Sprite'" :size="15"
                                         style="margin-top: 3px;color:#67C23A">
                                  <Picture/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Camera'" :size="15"
                                         style="margin-top: 3px;color:#409EFF">
                                  <VideoCamera/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Canvas'" :size="15"
                                         style="margin-top: 3px;color:#409EFF">
                                  <FullScreen/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Widget'" :size="15"
                                         style="margin-top: 3px;color:#409EFF">
                                  <Menu/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Text'||data.payload.type.indexOf('Label')!==-1"
                                         :size="15"
                                         style="margin-top: 3px;color:#E6A23C">
                                  <List/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='ProgressBar'" :size="15"
                                         style="margin-top: 3px;color:#E6A23C">
                                  <MoreFilled/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='GameObject'" :size="15"
                                         style="margin-top: 3px;color:#F56C6C">
                                  <HomeFilled/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='Game'" :size="15"
                                         style="margin-top: 3px;color:#F56C6C">
                                  <Headset/>
                                </el-icon>
                                <el-icon v-if="data.payload.type==='TextField'" :size="15"
                                         style="margin-top: 3px;color:#F56C6C">
                                  <Edit/>
                                </el-icon>
                              </div>
                              <span style="font-size: 14px">{{ data.name }}</span>
                            </template>
                          </el-tree>
                        </el-scrollbar>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card
                        shadow="hover"
                    >
                      <div style="height: 660px">
                        <div style="text-align: center; margin-bottom: 10px" v-if="project && project['id']">
                          <el-button
                              :disabled="pocoDetail === null"
                              plain
                              size="small"
                              type="primary"
                              round
                              @click="toAddElement('poco','')"
                          >{{ $t('androidRemoteTS.code.addControls') }}
                          </el-button
                          >
                        </div>
                        <el-alert style="margin-bottom: 10px" v-else :title="$t('androidRemoteTS.code.titleMessage')"
                                  type="info" show-icon
                                  close-text="Get!"/>
                        <el-scrollbar
                            style="height: 100%"
                            class="element-tree-scrollbar"
                        >
                          <el-form
                              label-position="left"
                              class="element-table"
                              label-width="100px"
                              v-if="pocoDetail !== null"
                          >
                            <el-form-item
                                v-for="key in Object.keys(pocoDetail)"
                                :label="key"
                                style="cursor: pointer"
                                @click="copy(JSON.stringify(pocoDetail[key]))"
                            >
                              <span>{{ pocoDetail[key] }}</span>
                            </el-form-item>
                          </el-form>
                        </el-scrollbar>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                <el-card style="height: 100%" v-show="!isShowPocoImg">
                  <el-result icon="info" :title="$t('androidRemoteTS.code.hintText')"
                             :subTitle="$t('androidRemoteTS.code.getPocoSDKMessage')">
                  </el-result>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <el-tab-pane :label="$t('androidRemoteTS.code.webView.webDebug')" name="webview">
            <div v-if="isWebView">
              <div v-if="webViewListDetail.length==0">
                <el-result icon="info" :title="$t('androidRemoteTS.code.hintText')"
                           :subTitle="$t('androidRemoteTS.code.webView.err')">
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
                      {{ $t('androidRemoteTS.code.webView.getWeb') }}
                    </el-button
                    >
                  </template>
                </el-result>
              </div>
              <div v-else>
                <el-button @click="getWebViewForward" :loading="webViewLoading" type="primary" size="mini">
                  {{ $t('androidRemoteTS.code.webView.againGetWeb') }}
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
                          <strong>{{
                              w.title.length > 0 ? w.title : $t('androidRemoteTS.code.webView.Untitled')
                            }}</strong>
                        </div>
                        <div style="color: #909399">{{
                            w.url.length > 50 ? w.url.substring(0, 50) + '...' : w.url
                          }}
                        </div>
                      </div>
                      <el-button type="primary" size="mini"
                                 @click="tabWebView(web.port,w.id,(w.title.length > 0 ? w.title : $t('androidRemoteTS.code.webView.Untitled')))">
                        {{ $t('androidRemoteTS.code.webView.nowDebug') }}
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
                    <span style="color: #606266">{{ $t('androidRemoteTS.code.webView.return') }}</span>
                  </template>
                  <template #content>
                    {{ $t('androidRemoteTS.code.webView.nowWeb') }}：<strong>{{ title }}</strong>
                  </template>
                </el-page-header>
              </div>
              <iframe v-if="!isWebView" allow="clipboard-read;clipboard-write"
                      :style="'border:1px solid #C0C4CC;;width: 100%;height: '+iFrameHeight+'px;margin-top:15px'"
                      :src="iframeUrl">
              </iframe>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
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
  margin: 1em calc(16px);

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

#debugPocoPic {
  width: 100%;
  height: auto;
}

.url-install-box {
  position: relative;
  height: 100%;
}
</style>
