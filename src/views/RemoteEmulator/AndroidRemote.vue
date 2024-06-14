<script setup>
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
import { useRoute, useRouter } from 'vue-router';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import axios from '@/http/axios';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import ColorImg from '@/components/ColorImg.vue';
import StepList from '@/components/StepList.vue';
import TestCaseList from '@/components/TestCaseList.vue';
import StepLog from '@/components/StepLog.vue';
import ElementUpdate from '@/components/ElementUpdate.vue';
import Pageable from '@/components/Pageable.vue';
import PackageList from '@/components/PackageList.vue';
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
  Service,
  VideoCamera,
  Postcard,
} from '@element-plus/icons';

import { useI18n } from 'vue-i18n';

import AudioProcessor from '@/lib/audio-processor';
import wifiLogo from '@/assets/img/wifi.png';
import RenderDeviceName from '../../components/RenderDeviceName.vue';
import Scrcpy from './Scrcpy';
import PocoPane from '../../components/PocoPane.vue';
import AndroidPerf from '../../components/AndroidPerf.vue';
import RemotePageHeader from '../../components/RemotePageHeader.vue';

const pocoPaneRef = ref(null);
const androidPerfRef = ref(null);
const { t: $t } = useI18n();

const { toClipboard } = useClipboard();
const route = useRoute();
const store = useStore();
const router = useRouter();
const wifiList = ref([]);
const currentWifi = ref('');
const isConnectWifi = ref(false);
const pocoLoading = ref(false);
const proxyWebPort = ref(0);
const proxyConnPort = ref(0);
const filterAppText = ref('');
const iFrameHeight = ref(0);
const terminalHeight = ref(0);
const caseList = ref(null);
const loading = ref(false);
const driverLoading = ref(false);
const remoteAdbLoading = ref(true);
const appList = ref([]);
const device = ref({});
const agent = ref({});
const screenUrls = ref([]);
const uploadUrl = ref('');
const text = ref({ content: '' });
const isMultiWindows = ref(false);
const isIgnore = ref(true);
const isVisible = ref(false);
let imgWidth = 0;
let imgHeight = 0;
// 旋转状态 // 0 90 180 270
const directionStatus = {
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
let oldBlob;
const element = ref({
  id: null,
  moduleId: 0,
  eleName: '',
  eleType: 'image',
  eleValue: '',
  projectId: 0,
});
const computedCenter = (b1, b2) => {
  const x1 = b1.substring(0, b1.indexOf(','));
  const y1 = b1.substring(b1.indexOf(',') + 1);
  const x2 = b2.substring(0, b2.indexOf(','));
  const y2 = b2.substring(b2.indexOf(',') + 1);
  const x = parseInt((parseInt(x2) + parseInt(x1)) / 2);
  const y = parseInt((parseInt(y1) + parseInt(y2)) / 2);
  return `${x},${y}`;
};
const switchTabs = (e) => {
  if (e.props.name === 'proxy') {
    getWifiList();
  }
  if (e.props.name === 'apps' || e.props.name === 'perfmon') {
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
const startPerfmon = (bundleId) => {
  websocket.send(
    JSON.stringify({
      type: 'startPerfmon',
      bundleId,
    })
  );
};
const stopPerfmon = () => {
  websocket.send(
    JSON.stringify({
      type: 'stopPerfmon',
    })
  );
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
  iframeUrl.value = `/chrome_devtools/front_end/inspector.html?ws=${agent.value.host}:${agent.value.port}/websockets/webView/${agent.value.secretKey}/${port}/${id}`;
  nextTick(() => {
    iFrameHeight.value = document.body.clientHeight - 150;
  });
};
const saveEle = () => {
  updateImgEle.value.validate((valid) => {
    if (valid) {
      element.value.eleType = 'image';
      element.value.eleValue = imgElementUrl.value;
      element.value.projectId = project.value.id;
      axios.put('/controller/elements', element.value).then((resp) => {
        if (resp.code === 2000) {
          ElMessage.success({
            message: resp.message,
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
      data.packageName.toLowerCase().includes(filterAppText.value.toLowerCase())
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
    directionStatus.value = 90;
  } else {
    directionStatus.value = 0;
  }
};
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
    name = 'Meizu';
  }
  if (name === 'LENOVO') {
    name = 'Lenovo';
  }
  try {
    result = img[`../../assets/img/${name}.jpg`].default;
  } catch {
    result = img['../../assets/img/unName.jpg'].default;
  }
  return result;
};
// 选中安装包列表中的item后响应事件
const selectPackage = (val) => {
  ElMessage.success({
    message: $t('androidRemoteTS.startInstall'),
  });
  install(val);
};
// 三种安装包方式tab选中态
const activeIntallTab = ref('pushInstallPane');
watch(filterText, (newValue, oldValue) => {
  tree.value.filter(newValue);
});
const filterNode = (value, data) => {
  if (!value) return true;
  return (
    data.label.indexOf(value) !== -1 ||
    (data.detail['resource-id']
      ? data.detail['resource-id'].indexOf(value) !== -1
      : false)
  );
};
const findBestXpath = (elementDetail) => {
  const result = [];
  if (elementDetail['resource-id']) {
    result.push(
      `//${elementDetail.class}[@resource-id='${elementDetail['resource-id']}']`
    );
  }
  if (elementDetail.text) {
    result.push(`//${elementDetail.class}[@text='${elementDetail.text}']`);
    result.push(
      `//${elementDetail.class}[contains(@text,'${elementDetail.text}')]`
    );
  }
  if (elementDetail['content-desc']) {
    result.push(
      `//${elementDetail.class}[@content-desc='${elementDetail['content-desc']}']`
    );
    result.push(
      `//${elementDetail.class}[contains(@content-desc,'${elementDetail['content-desc']}')]`
    );
  }
  return result;
};
const downloadImg = (url) => {
  const time = new Date().getTime();
  const link = document.createElement('a');
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      link.href = URL.createObjectURL(blob);
      link.download = `${time}.jpg`;
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
  if (project.value) {
    element.value.eleType = eleType;
    element.value.eleValue = eleValue;
    dialogElement.value = true;
  }
};
const removeScreen = () => {
  screenUrls.value = [];
};
const getVideoScreenshot = () => {
  const canvas = document.createElement('canvas');
  const canvasCtx = canvas.getContext('2d');
  const video = document.getElementById('scrcpy-video');
  // 默认生成图片大小
  let w;
  let h;
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    if (screenMode.value == 'Scrcpy') {
      w = imgWidth;
      h = imgHeight;
    } else {
      w = 369;
      h = 800;
    }
  } else if (screenMode.value == 'Scrcpy') {
    w = imgHeight;
    h = imgWidth;
  } else {
    w = 800;
    h = 369;
  }
  canvas.width = w;
  canvas.height = h;
  canvasCtx.drawImage(
    video,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
    0,
    0,
    w,
    h
  );
  return canvas.toDataURL('image/png', 1);
};
const quickCap = () => {
  let imageUrl;
  if (oldBlob) {
    const blob = new Blob([oldBlob], { type: 'image/jpeg' });
    const URL = window.URL || window.webkitURL;
    imageUrl = URL.createObjectURL(blob);
  } else {
    imageUrl = getVideoScreenshot();
  }
  const img = new Image();
  screenUrls.value.push(imageUrl);
  img.src = imageUrl;
};
const getImgUrl = () => {
  let imageUrl;
  if (oldBlob) {
    const blob = new Blob([oldBlob], { type: 'image/jpeg' });
    const URL = window.URL || window.webkitURL;
    imageUrl = URL.createObjectURL(blob);
  } else {
    imageUrl = getVideoScreenshot();
  }
  return imageUrl;
};
const setImgData = () => {
  const imageUrl = getImgUrl();
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
      `ws://${host}:${port}/websockets/android/${key}/${udId}/${localStorage.getItem(
        'SonicToken'
      )}`
    );
    //
    __Scrcpy = new Scrcpy({
      socketURL: `ws://${host}:${port}/websockets/android/screen/${key}/${udId}/${localStorage.getItem(
        'SonicToken'
      )}`,
      node: 'scrcpy-video',
      onmessage: screenWebsocketOnmessage,
      excuteMode: screenMode.value,
    });
    screenWebsocket = __Scrcpy.websocket;
    changeScreenMode(screenMode.value, 1);
    //
    terminalWebsocket = new WebSocket(
      `ws://${host}:${port}/websockets/android/terminal/${key}/${udId}/${localStorage.getItem(
        'SonicToken'
      )}`
    );
  } else {
    console.error($t('androidRemoteTS.noWebSocket'));
  }
  websocket.onmessage = websocketOnmessage;
  websocket.onclose = (e) => {};
  terminalWebsocket.onmessage = terminalWebsocketOnmessage;
  terminalWebsocket.onclose = (e) => {};
  driverLoading.value = true;
};
const sendLogcat = () => {
  terminalWebsocket.send(
    JSON.stringify({
      type: 'logcat',
      level: logcatFilter.value.level,
      filter: logcatFilter.value.filter,
    })
  );
};
const getWifiList = () => {
  terminalWebsocket.send(
    JSON.stringify({
      type: 'wifiList',
    })
  );
};
const clearLogcat = () => {
  logcatOutPut.value = [];
};
const stopLogcat = () => {
  terminalWebsocket.send(
    JSON.stringify({
      type: 'stopLogcat',
    })
  );
};
const sendCmd = () => {
  if (cmdInput.value.length > 0 && cmdIsDone.value === true) {
    cmdIsDone.value = false;
    cmdOutPut.value.push(
      JSON.parse(
        JSON.stringify(
          `<span style='color: #409EFF'>${cmdUser.value}</span>:/ $ ${cmdInput.value}`
        )
      )
    );
    terminalWebsocket.send(
      JSON.stringify({
        type: 'command',
        detail: cmdInput.value,
      })
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
    })
  );
};
const terminalWebsocketOnmessage = (message) => {
  switch (JSON.parse(message.data).msg) {
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
        JSON.parse(message.data)
          .detail.replace(/ I /g, "<span style='color: #0d84ff'> I </span>")
          .replace(/ V /g, "<span style='color: #0d84ff'> I </span>")
          .replace(/ D /g, "<span style='color: #0d84ff'> D </span>")
          .replace(/ W /g, "<span style='color: #E6A23C'> W </span>")
          .replace(/ E /g, "<span style='color: #F56C6C'> E </span>")
          .replace(/ F /g, "<span style='color: #F56C6C'> F </span>")
      );
      nextTick(() => {
        logcatScroll.value.wrap.scrollTop =
          logcatScroll.value.wrap.scrollHeight;
      });
      break;
    case 'terminal':
      cmdUser.value = JSON.parse(message.data).user;
      cmdOutPut.value.push($t('androidRemoteTS.connection'));
      break;
    case 'terResp':
      cmdOutPut.value.push(JSON.parse(message.data).detail);
      nextTick(() => {
        terScroll.value.wrap.scrollTop = terScroll.value.wrap.scrollHeight;
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
    const blob = new Blob([message.data], { type: 'image/jpeg' });
    const URL = window.URL || window.webkitURL;
    const img = new Image();
    const canvas = document.getElementById('canvas');
    const g = canvas.getContext('2d');
    img.onload = function () {
      // 不根据按钮组，使用数据源的分辨率点对点
      const { width } = img;
      const { height } = img;
      canvas.width = width;
      canvas.height = height;
      g.drawImage(img, 0, 0, width, height);
    };
    const u = URL.createObjectURL(blob);
    img.src = u;
  } else {
    switch (JSON.parse(message.data).msg) {
      case 'rotation': {
        if (directionStatus.value !== -1) {
          loading.value = true;
          ElMessage.success({
            message: $t('androidRemoteTS.messageOne'),
          });
        }
        directionStatus.value = JSON.parse(message.data).value; // TODO
        // 旋转需要重置一下jmuxer
        if (screenMode.value == 'Scrcpy') {
          // 重置播放器
          __Scrcpy.jmuxer && __Scrcpy.jmuxer.reset();
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
        pocoPaneRef.value.setSize(
          JSON.parse(message.data).width,
          JSON.parse(message.data).height
        );
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
  switch (JSON.parse(message.data).msg) {
    case 'perfDetail':
      androidPerfRef.value.setData(JSON.parse(message.data).detail);
      break;
    case 'poco': {
      pocoLoading.value = false;
      const { result } = JSON.parse(message.data);
      if (result) {
        ElMessage.success({
          message: $t('androidRemoteTS.getPocoSuccess'),
        });
        pocoPaneRef.value.setPocoData(JSON.parse(result).result);
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.getPocoFail'),
        });
      }
      break;
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
      pullLoading.value = false;
      if (JSON.parse(message.data).status === 'success') {
        ElMessage.success({
          message: $t('androidRemoteTS.pullFile.success'),
        });
        pullResult.value = JSON.parse(message.data).url;
      } else {
        ElMessage.error({
          message: $t('androidRemoteTS.pullFile.fail'),
        });
      }
      break;
    }
    case 'paste': {
      paste.value = JSON.parse(message.data).detail;
      ElMessage.success({
        message: $t('IOSRemote.clipboard.text'),
      });
      break;
    }
    case 'pushResult': {
      pushLoading.value = false;
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
      remoteAdbLoading.value = false;
      if (
        JSON.parse(message.data).isEnable &&
        JSON.parse(message.data).port > 0
      ) {
        remoteAdbUrl.value = `${agent.value.host}:${
          JSON.parse(message.data).port
        }`;
      }
      break;
    }
    case 'tree': {
      ElMessage.success({
        message: $t('androidRemoteTS.getEle.success'),
      });
      const result = JSON.parse(message.data);
      currentId.value = [1];
      elementData.value = result.detail;
      isShowTree.value = true;
      elementLoading.value = false;
      webViewData.value = result.webView;
      activity.value = result.activity;
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
      let msg = $t('androidRemoteTS.driverStatus.fail');
      driverLoading.value = false;
      if (JSON.parse(message.data).status === 'success') {
        isDriverFinish.value = true;
        msg = $t('androidRemoteTS.driverStatus.success');
      }
      ElMessage({
        type: JSON.parse(message.data).status,
        message: msg,
      });
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
      webViewListDetail.value = JSON.parse(message.data).detail;
      break;
    }
    case 'eleScreen': {
      if (JSON.parse(message.data).img) {
        ElMessage.success({
          message: $t('androidRemoteTS.getPsSuccess'),
        });
        imgElementUrl.value = JSON.parse(message.data).img;
        dialogImgElement.value = true;
      } else {
        ElMessage.error($t('IOSRemote.eleScreen.err'));
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
const inputValue = ref('');
const inputBox = ref(null);
const inputBoxStyle = ref({});
const paste = ref('');
const changeInputHandle = () => {
  if (inputValue.value) {
    websocket.send(
      JSON.stringify({
        type: 'text',
        detail: inputValue.value,
      })
    );
    inputValue.value = '';
  }
};
const deleteInputHandle = () => {
  websocket.send(
    JSON.stringify({
      type: 'text',
      detail: 'CODE_AC_BACK',
    })
  );
};
const setPasteboard = (text) => {
  websocket.send(
    JSON.stringify({
      type: 'setPasteboard',
      detail: text,
    })
  );
  ElMessage.success({
    message: $t('IOSRemote.clipboard.SentSuccessfully'),
  });
};
const getPasteboard = () => {
  websocket.send(
    JSON.stringify({
      type: 'getPasteboard',
    })
  );
};
const enterInputHandle = () => {
  websocket.send(
    JSON.stringify({
      type: 'text',
      detail: 'CODE_AC_ENTER',
    })
  );
};
const openDriver = () => {
  driverLoading.value = true;
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'openDriver',
    })
  );
};
const closeDriver = () => {
  isDriverFinish.value = false;
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'closeDriver',
    })
  );
  ElMessage.success({
    message: $t('androidRemoteTS.code.closeDriverMessage'),
  });
};
const getCurLocation = () => {
  let x;
  let y;
  let _x;
  let _y;
  const canvas = touchWrapper;
  const rect = canvas.getBoundingClientRect();
  if (directionStatus.value != 0 && directionStatus.value != 180) {
    // 左右旋转
    _x = parseInt(
      (event.clientY - rect.top) * (imgWidth / canvas.clientHeight)
    );
    //
    _y = parseInt(
      (event.clientX - rect.left) * (imgHeight / canvas.clientWidth)
    );
    x = directionStatus.value == 90 ? imgWidth - _x : _x - imgWidth * 3;
    y = directionStatus.value == 90 ? _y : -_y;
  } else {
    _x = parseInt(
      (event.clientX - rect.left) * (imgWidth / canvas.clientWidth)
    );
    x = directionStatus.value == 180 ? imgWidth - _x : _x;
    //
    _y = parseInt(
      (event.clientY - rect.top) * (imgHeight / canvas.clientHeight)
    );
    y = directionStatus.value == 180 ? imgHeight - _y : _y;
  }
  inputBoxStyle.value = {
    left: `${event.clientX - rect.left}px`,
    top: `${event.clientY - rect.top}px`,
  };
  return {
    x,
    y,
  };
};
const getCurLocationForAdb = () => {
  let x;
  let y;
  let _x;
  let _y;
  const canvas = touchWrapper;
  const rect = canvas.getBoundingClientRect();
  if (directionStatus.value != 0 && directionStatus.value != 180) {
    // 左右旋转
    _x = parseInt(
      (event.clientY - rect.top) * (imgWidth / canvas.clientHeight)
    );
    _y = parseInt(
      (event.clientX - rect.left) * (imgHeight / canvas.clientWidth)
    );
    x = _y;
    y = _x;
  } else {
    _x = parseInt(
      (event.clientX - rect.left) * (imgWidth / canvas.clientWidth)
    );
    x = directionStatus.value == 180 ? imgWidth - _x : _x;
    //
    _y = parseInt(
      (event.clientY - rect.top) * (imgHeight / canvas.clientHeight)
    );
    y = directionStatus.value == 180 ? imgHeight - _y : _y;
  }
  inputBoxStyle.value = {
    left: `${event.clientX - rect.left}px`,
    top: `${event.clientY - rect.top}px`,
  };
  return {
    x,
    y,
  };
};
const mouseup = (event) => {
  if (!isFixTouch) {
    if (isPress) {
      isPress = false;
      websocket.send(
        JSON.stringify({
          type: 'touch',
          detail: 'up\n',
        })
      );
      inputBox.value.focus();
    }
  } else {
    clearInterval(loop);
    time = 0;
    const { x, y } = getCurLocationForAdb();
    if (moveX === x && moveY === y) {
      if (!isLongPress) {
        websocket.send(
          JSON.stringify({
            type: 'debug',
            detail: 'tap',
            point: `${x},${y}`,
          })
        );
        inputBox.value.focus();
      }
    } else {
      websocket.send(
        JSON.stringify({
          type: 'debug',
          detail: 'swipe',
          pointA: `${moveX},${moveY}`,
          pointB: `${x},${y}`,
        })
      );
      inputBox.value.focus();
    }
    isLongPress = false;
  }
};
const mouseleave = () => {
  if (isFixTouch) {
    clearInterval(loop);
    isLongPress = false;
  } else if (isPress) {
    isPress = false;
    websocket.send(
      JSON.stringify({
        type: 'touch',
        detail: 'up\n',
      })
    );
  }
};
const mousedown = (event) => {
  if (!isFixTouch) {
    // 安卓高版本
    const { x, y } = getCurLocation();
    isPress = true;
    websocket.send(
      JSON.stringify({
        type: 'touch',
        detail: `down ${x} ${y}\n`,
      })
    );
  } else {
    const { x, y } = getCurLocationForAdb();
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
            point: `${moveX},${moveY}`,
          })
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
      } else {
        const { x, y } = getCurLocation();
        websocket.send(
          JSON.stringify({
            type: 'touch',
            detail: `move ${x} ${y}\n`,
          })
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
      (event.clientX - rect.left) * (imgWidth / debugPic.clientWidth)
    );
    y = parseInt(
      (event.clientY - rect.top) * (imgHeight / debugPic.clientHeight)
    );
  } else {
    x = parseInt(
      (event.clientX - rect.left) * (imgHeight / debugPic.clientWidth)
    );
    y = parseInt(
      (event.clientY - rect.top) * (imgWidth / debugPic.clientHeight)
    );
  }
  await nextTick(() => {
    tree.value.setCurrentKey(
      findMinSize(findElementByPoint(elementData.value, x, y))
    );
  });
  await handleNodeClick(tree.value.getCurrentNode());
};
const findMinSize = (data) => {
  if (data.length === 0) {
    return null;
  }
  let result = data[0];
  for (const i in data) {
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
  const result = [];
  for (const i in ele) {
    const eleStartX = ele[i].detail.bStart.substring(
      0,
      ele[i].detail.bStart.indexOf(',')
    );
    const eleStartY = ele[i].detail.bStart.substring(
      ele[i].detail.bStart.indexOf(',') + 1
    );
    const eleEndX = ele[i].detail.bEnd.substring(
      0,
      ele[i].detail.bEnd.indexOf(',')
    );
    const eleEndY = ele[i].detail.bEnd.substring(
      ele[i].detail.bEnd.indexOf(',') + 1
    );
    if (x >= eleStartX && x <= eleEndX && y >= eleStartY && y <= eleEndY) {
      result.push({
        ele: ele[i],
        size: (eleEndY - eleStartY) * (eleEndX - eleStartX),
      });
    }
    if (ele[i].children) {
      const childrenResult = findElementByPoint(ele[i].children, x, y);
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
  const canvas = document.getElementById('debugPic');
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  const eleStartX = data.detail.bStart.substring(
    0,
    data.detail.bStart.indexOf(',')
  );
  const eleStartY = data.detail.bStart.substring(
    data.detail.bStart.indexOf(',') + 1
  );
  const eleEndX = data.detail.bEnd.substring(0, data.detail.bEnd.indexOf(','));
  const eleEndY = data.detail.bEnd.substring(data.detail.bEnd.indexOf(',') + 1);
  const a = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  const c = Math.round(Math.random() * 255);
  g.fillStyle = `rgba(${a}, ${b}, ${c}, 0.6)`;
  if (directionStatus.value === 0 || directionStatus.value === 180) {
    g.fillRect(
      eleStartX * (canvas.width / imgWidth),
      eleStartY * (canvas.height / imgHeight),
      (eleEndX - eleStartX) * (canvas.width / imgWidth),
      (eleEndY - eleStartY) * (canvas.height / imgHeight)
    );
  } else {
    g.fillRect(
      eleStartX * (canvas.width / imgHeight),
      eleStartY * (canvas.height / imgWidth),
      (eleEndX - eleStartX) * (canvas.width / imgHeight),
      (eleEndY - eleStartY) * (canvas.height / imgWidth)
    );
  }
};
const searchDevice = () => {
  websocket.send(
    JSON.stringify({
      type: 'find',
    })
  );
};
const startProxy = () => {
  websocket.send(
    JSON.stringify({
      type: 'proxy',
    })
  );
};
const installCert = () => {
  websocket.send(
    JSON.stringify({
      type: 'installCert',
    })
  );
};
const openApp = (pkg) => {
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'openApp',
      pkg,
    })
  );
};
const killApp = (pkg) => {
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'killApp',
      pkg,
    })
  );
  ElMessage.success({
    message: $t('androidRemoteTS.code.killMsg'),
  });
};
const refreshAppList = () => {
  appList.value = [];
  ElMessage.success({
    message: $t('androidRemoteTS.loadIng'),
  });
  terminalWebsocket.send(
    JSON.stringify({
      type: 'appList',
    })
  );
};
const clearProxy = () => {
  ElMessage.success({
    message: $t('androidRemoteTS.messageTwo'),
  });
  websocket.send(
    JSON.stringify({
      type: 'clearProxy',
    })
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
    })
  );
};
const getEleScreen = (xpath) => {
  elementScreenLoading.value = true;
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'eleScreen',
      xpath,
    })
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
      caseId: testCase.value.id,
      pwd: device.value.password,
    })
  );
};
const stopStep = () => {
  debugLoading.value = false;
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'stopStep',
      udId: device.value.udId,
      caseId: testCase.value.id,
      pf: device.value.platform,
    })
  );
};
const pressKey = (keyNum) => {
  websocket.send(
    JSON.stringify({
      type: 'keyEvent',
      detail: keyNum,
    })
  );
};
const batteryDisconnect = () => {
  websocket.send(
    JSON.stringify({
      type: 'battery',
      detail: 0,
    })
  );
};
const batteryReset = () => {
  websocket.send(
    JSON.stringify({
      type: 'battery',
      detail: 1,
    })
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
    })
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
    oldBlob = undefined; // 清除记录
    touchWrapper = document.getElementById('scrcpy-video');
  }
  // 储存最后模式
  window.localStorage.setItem('screenMode', type);
};
const pullPath = ref('');
const pullLoading = ref(false);
const pullResult = ref('');
const pullFile = () => {
  pullResult.value = '';
  pullLoading.value = true;
  websocket.send(
    JSON.stringify({
      type: 'pullFile',
      path: pullPath.value,
    })
  );
};
const fileLoading = ref(false);
const upLoadFilePath = ref('');
const pushPath = ref('');
const pushLoading = ref(false);
const pushFile = () => {
  pushLoading.value = true;
  websocket.send(
    JSON.stringify({
      type: 'pushFile',
      file: upLoadFilePath.value,
      path: pushPath.value,
    })
  );
};
const uploadFile = (content) => {
  fileLoading.value = true;
  const formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'packageFiles');
  axios
    .post('/folder/upload', formData, {
      headers: { 'Content-type': 'multipart/form-data' },
    })
    .then((resp) => {
      fileLoading.value = false;
      if (resp.code === 2000) {
        upLoadFilePath.value = resp.data;
      }
    });
};
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    return true;
  }
  ElMessage.error({
    message: $t('androidRemoteTS.failErr'),
  });
  return false;
};
const beforeAvatarUpload2 = (file) => {
  if (file.name.endsWith('.apk')) {
    return true;
  }
  ElMessage.error({
    message: $t('androidRemoteTS.failErr'),
  });
  return false;
};
const limitOut = () => {
  ElMessage.error({
    message: $t('androidRemoteTS.addOne'),
  });
};
const uploadPackage = (content) => {
  uploadLoading.value = true;
  const formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'packageFiles');
  axios
    .post('/folder/upload', formData, {
      headers: { 'Content-type': 'multipart/form-data' },
    })
    .then((resp) => {
      uploadLoading.value = false;
      if (resp.code === 2000) {
        install(resp.data);
      }
    });
};
const uploadScan = (content) => {
  const formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'imageFiles');
  axios
    .post('/folder/upload', formData, {
      headers: { 'Content-type': 'multipart/form-data' },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        scan(resp.data);
      }
    });
};
const scan = (url) => {
  websocket.send(
    JSON.stringify({
      type: 'scan',
      url,
    })
  );
};
const sendText = () => {
  websocket.send(
    JSON.stringify({
      type: 'text',
      detail: 'CODE_AC_CLEAN',
    })
  );
};
const startKeyboard = () => {
  websocket.send(
    JSON.stringify({
      type: 'startKeyboard',
    })
  );
};
const stopKeyboard = () => {
  websocket.send(
    JSON.stringify({
      type: 'stopKeyboard',
    })
  );
};
const install = (apk) => {
  if (apk.length > 0) {
    websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'install',
        apk,
      })
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
      isMulti: isMultiWindows.value,
      isIgnore: isIgnore.value,
      isVisible: isVisible.value,
    })
  );
};
const getPoco = (engine, port) => {
  pocoLoading.value = true;
  websocket.send(
    JSON.stringify({
      type: 'debug',
      detail: 'poco',
      engine,
      port,
    })
  );
};
const getWebViewForward = () => {
  webViewLoading.value = true;
  websocket.send(
    JSON.stringify({
      type: 'forwardView',
    })
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
  window.close();
};
onBeforeUnmount(() => {
  close();
});
const getDeviceById = (id) => {
  loading.value = true;
  axios.get('/controller/devices', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      device.value = resp.data;
      if (device.value.status !== 'ONLINE') {
        ElMessage.error({
          message: $t('androidRemoteTS.deviceFail'),
        });
        router.replace('/Index/Devices');
        return;
      }
      axios
        .get('/controller/agents', { params: { id: device.value.agentId } })
        .then((resp) => {
          if (resp.code === 2000) {
            agent.value = resp.data;
            openSocket(
              agent.value.host,
              agent.value.port,
              agent.value.secretKey,
              device.value.udId
            );
          }
        });
    }
  });
};
/**
 * 实时音频
 */
let audioPlayer = null;
const isConnectAudio = ref(false);
const initAudioPlayer = () => {
  audioPlayer = new AudioProcessor({
    node: 'audio-player',
    wsUrl: `ws://${agent.value.host}:${agent.value.port}/websockets/audio/${agent.value.secretKey}/${device.value.udId}`,
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
  axios.get('/controller/projects/list').then((resp) => {
    store.commit('saveProjectList', resp.data);
  });
};
let activeTime = 0;
const idleCount = ref(0);
onMounted(() => {
  if (store.state.project.id) {
    project.value = store.state.project;
  } else {
    getProjectList();
  }
  getDeviceById(route.params.deviceId);
  store.commit('autoChangeCollapse');
  getRemoteTimeout();
  getIdleTimeout();
  activeTime = new Date().getTime();
  window.document.onmousedown = (event) => {
    idleCount.value = 0;
    activeTime = new Date().getTime();
  };
  window.document.onmousemove = (event) => {
    idleCount.value = 0;
    activeTime = new Date().getTime();
  };
  checkAlive();
});
const remoteTimeout = ref(0);
const ticker = ref(0);
const getRemoteTimeout = () => {
  axios.get('/controller/confList/getRemoteTimeout').then((resp) => {
    remoteTimeout.value = resp.data;
    setInterval(() => {
      ticker.value += 1;
    }, 1000);
  });
};
const idleTimeout = ref(0);
const getIdleTimeout = () => {
  axios.get('/controller/confList/getIdleTimeout').then((resp) => {
    idleTimeout.value = resp.data;
  });
};

const checkAlive = () => {
  setInterval(() => {
    idleCount.value++;
    const nowTime = new Date().getTime();
    if (nowTime - activeTime > idleTimeout.value * 60 * 1000) {
      close();
    }
  }, 1000);
};
</script>

<template>
  <el-dialog
    v-model="dialogImgElement"
    :title="$t('androidRemoteTS.code.elementsSnapshot')"
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
        </el-button>
      </div>
    </el-form>
  </el-dialog>
  <el-dialog
    v-model="dialogElement"
    :title="$t('elements.eleInfo')"
    width="600px"
  >
    <element-update
      v-if="dialogElement"
      :project-id="project['id']"
      :element-id="0"
      :element-obj="element"
      @flush="dialogElement = false"
    />
  </el-dialog>
  <remote-page-header
    :ticker="ticker"
    :idle-count="idleCount"
    :remote-timeout="remoteTimeout"
    :idle-timeout="idleTimeout"
    @close="close"
  />
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
          transition: !isSplitPressing ? 'flex-basis 0.3s,max-width 0.3s' : '',
        }"
      >
        <el-card
          v-loading="loading"
          :element-loading-text="$t('androidRemoteTS.code.preparingImager')"
          element-loading-background="rgba(255, 255, 255, 1)"
          style="font-size: 14px"
          :body-style="{
            padding: '10px',
            background: '#ccc',
            position: 'relative',
            minHeight: '340px',
          }"
        >
          <template #header>
            <div style="position: relative; display: flex; align-items: center">
              <el-icon :size="14" style="vertical-align: middle">
                <Cellphone />
              </el-icon>
              <RenderDeviceName
                style="color: #e6a23c; margin-left: 5px"
                :device="device"
              />
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
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 7px;
                      "
                      :src="
                        getImg(device['isHm'] === 1 ? 'HarmonyOs' : 'ANDROID')
                      "
                    />
                  </el-form-item>
                  <el-form-item
                    :label="$t('androidRemoteTS.code.systemVersion')"
                  >
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
                      style="
                        position: absolute;
                        top: 7px;
                        bottom: 7px;
                        left: 7px;
                      "
                      :src="getImg(device['manufacturer'])"
                    />
                  </el-form-item>
                </el-form>
                <template #reference>
                  <div style="position: absolute; right: 0px; color: #909399">
                    <el-icon :size="15" style="vertical-align: middle">
                      <InfoFilled />
                    </el-icon>
                  </div>
                </template>
              </el-popover>
            </div>
          </template>
          <div style="margin-right: 40px; text-align: center">
            <div>
              <input
                ref="inputBox"
                v-model="inputValue"
                class="input-box"
                type="text"
                :style="inputBoxStyle"
                @input="changeInputHandle"
                @keyup.delete="deleteInputHandle"
                @keyup.enter="enterInputHandle"
              />
              <video
                v-show="screenMode == 'Scrcpy'"
                id="scrcpy-video"
                style="display: inline-block; min-height: 100%"
                :style="canvasRectInfo"
                autoplay
                muted
                @mouseup="mouseup"
                @mousemove="mousemove"
                @mousedown="mousedown"
                @mouseleave="mouseleave"
              />
              <canvas
                v-show="screenMode != 'Scrcpy'"
                id="canvas"
                style="display: inline-block"
                :style="canvasRectInfo"
                @mouseup="mouseup"
                @mousemove="mousemove"
                @mousedown="mousedown"
                @mouseleave="mouseleave"
              />
              <audio id="audio-player" hidden></audio>
            </div>
            <el-button-group id="pressKey">
              <el-button
                size="small"
                style="width: 25%"
                type="info"
                @click="pressKey(82)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <Menu />
                </el-icon>
              </el-button>
              <el-button
                size="small"
                style="width: 25%"
                type="info"
                @click="pressKey(187)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <CopyDocument />
                </el-icon>
              </el-button>
              <el-button
                size="small"
                style="width: 25%"
                type="info"
                @click="pressKey(3)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <House />
                </el-icon>
              </el-button>
              <el-button
                size="small"
                style="width: 25%"
                type="info"
                @click="pressKey(4)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <Back />
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
                  <el-button size="small" type="info" circle>
                    <el-icon :size="12" style="vertical-align: middle">
                      <VideoCamera />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-radio-group
                        v-model="screenMode"
                        v-loading="loading"
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
                  <el-button size="small" type="info" circle>
                    <el-icon :size="12" style="vertical-align: middle">
                      <View />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-radio-group
                        v-model="pic"
                        v-loading="loading"
                        size="mini"
                        @change="changePic"
                      >
                        <el-radio-button
                          :label="$t('androidRemoteTS.low')"
                        ></el-radio-button>
                        <el-radio-button
                          :label="$t('androidRemoteTS.middle')"
                        ></el-radio-button>
                        <el-radio-button
                          :label="$t('androidRemoteTS.high')"
                        ></el-radio-button>
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
                  <el-button size="small" type="info" circle>
                    <el-icon :size="12" style="vertical-align: middle">
                      <Place />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu
                      v-loading="loading"
                      class="divider"
                      element-loading-background="rgba(255, 255, 255, 1)"
                    >
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
                            <el-icon :size="14" style="vertical-align: middle">
                              <Cellphone />
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
                            <el-icon :size="14" style="vertical-align: middle">
                              <Pointer />
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
                            <el-icon :size="14" style="vertical-align: middle">
                              <Postcard />
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
                  <el-button size="small" type="info" circle>
                    <el-icon :size="12" style="vertical-align: middle">
                      <Service />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-button-group>
                        <el-button
                          size="small"
                          type="success"
                          circle
                          :disabled="isConnectAudio"
                          @click="playAudio"
                        >
                          <el-icon :size="14" style="vertical-align: middle">
                            <Bell />
                          </el-icon>
                        </el-button>
                        <el-button
                          size="small"
                          type="danger"
                          circle
                          :disabled="!isConnectAudio"
                          @click="destroyAudio"
                        >
                          <el-icon :size="14" style="vertical-align: middle">
                            <MuteNotification />
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
                  <el-button size="small" type="info" circle>
                    <el-icon :size="12" style="vertical-align: middle">
                      <Connection />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-button-group>
                        <el-tooltip
                          effect="dark"
                          :content="
                            $t('androidRemoteTS.code.simulatePowerOutage')
                          "
                          placement="top"
                        >
                          <el-button
                            size="small"
                            type="info"
                            circle
                            @click="batteryDisconnect"
                          >
                            <el-icon :size="14" style="vertical-align: middle">
                              <VideoPause />
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
                            <el-icon :size="14" style="vertical-align: middle">
                              <Refresh />
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
                  <el-icon :size="12" style="vertical-align: middle">
                    <Search />
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
                  <el-button size="small" type="primary" circle>
                    <el-icon :size="12" style="vertical-align: middle">
                      <Operation />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <div style="text-align: center">
                        <el-icon
                          :size="14"
                          style="color: #909399; vertical-align: middle"
                        >
                          <Sunny />
                        </el-icon>
                        <el-divider direction="vertical"></el-divider>
                        <el-button-group>
                          <el-button
                            size="small"
                            type="info"
                            circle
                            @click="pressKey(220)"
                          >
                            <el-icon :size="12" style="vertical-align: middle">
                              <CaretLeft />
                            </el-icon>
                          </el-button>
                          <el-button
                            size="small"
                            type="info"
                            circle
                            @click="pressKey(221)"
                          >
                            <el-icon :size="12" style="vertical-align: middle">
                              <CaretRight />
                            </el-icon>
                          </el-button>
                        </el-button-group>
                      </div>
                      <el-divider></el-divider>
                      <el-icon
                        :size="14"
                        style="color: #909399; vertical-align: middle"
                      >
                        <Phone />
                      </el-icon>
                      <el-divider direction="vertical"></el-divider>
                      <el-button-group>
                        <el-button
                          size="small"
                          type="info"
                          circle
                          @click="pressKey(24)"
                        >
                          <el-icon :size="12" style="vertical-align: middle">
                            <Plus />
                          </el-icon>
                        </el-button>
                        <el-button
                          size="small"
                          type="info"
                          circle
                          @click="pressKey(164)"
                        >
                          <el-icon :size="12" style="vertical-align: middle">
                            <MuteNotification />
                          </el-icon>
                        </el-button>
                        <el-button
                          size="small"
                          type="info"
                          circle
                          @click="pressKey(25)"
                        >
                          <el-icon :size="12" style="vertical-align: middle">
                            <Minus />
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
                  <el-icon :size="12" style="vertical-align: middle">
                    <PhoneFilled />
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
                  <el-icon :size="12" style="vertical-align: middle">
                    <Camera />
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
                  <el-icon :size="12" style="vertical-align: middle">
                    <Position />
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
                  <el-icon :size="12" style="vertical-align: middle">
                    <SwitchButton />
                  </el-icon>
                </el-button>
              </div>
            </el-tooltip>
          </div>
        </el-card>
      </el-col>

      <div
        :class="{
          line: tabPosition == 'left',
          lineVertical: tabPosition == 'top',
        }"
        @mousedown="lineMousedown"
      />

      <el-col
        :span="tabPosition == 'left' ? 12 : 24"
        :style="{
          flexBasis:
            tabPosition == 'left'
              ? 100 - Number(layoutSplitInfo.left) + '%'
              : '',
          maxWidth:
            tabPosition == 'left'
              ? 100 - Number(layoutSplitInfo.left) + '%'
              : '',
        }"
      >
        <el-tabs
          v-model="activeTab"
          stretch
          class="remote-tab"
          :tab-position="tabPosition"
          @tab-click="switchTabs"
        >
          <el-tab-pane
            :label="$t('androidRemoteTS.code.remoteControlPanel')"
            name="main"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <strong>{{ $t('androidRemoteTS.code.inputText') }}</strong>
                  </template>
                  <el-alert
                    :title="$t('androidRemoteTS.code.keyboard')"
                    type="info"
                    show-icon
                    :closable="false"
                  >
                  </el-alert>
                  <div style="text-align: center; margin-top: 12px">
                    <el-button size="mini" type="primary" @click="sendText"
                      >{{ $t('androidRemoteTS.code.clear') }}
                    </el-button>
                    <el-button size="mini" type="primary" @click="startKeyboard"
                      >{{ $t('androidRemoteTS.code.startKeyboard') }}
                    </el-button>
                    <el-button size="mini" type="primary" @click="stopKeyboard"
                      >{{ $t('androidRemoteTS.code.stopKeyboard') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-tabs type="border-card" stretch>
                  <el-tab-pane :label="$t('androidRemoteTS.code.remoteADB')">
                    <div
                      v-loading="remoteAdbLoading"
                      style="margin-top: 18px; margin-bottom: 18px"
                    >
                      <div
                        v-if="remoteAdbUrl.length > 0"
                        style="margin-top: 20px; margin-bottom: 20px"
                      >
                        <el-card
                          :body-style="{
                            backgroundColor: '#303133',
                            cursor: 'pointer',
                          }"
                          @click="copy('adb connect ' + remoteAdbUrl)"
                        >
                          <strong style="color: #f2f6fc"
                            >adb connect {{ remoteAdbUrl }}</strong
                          >
                        </el-card>
                      </div>
                      <div v-else>
                        <el-card>
                          <strong>{{
                            $t('androidRemoteTS.code.noAgent')
                          }}</strong>
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
                      <el-button
                        size="mini"
                        type="primary"
                        :disabled="isDriverFinish"
                        :loading="driverLoading"
                        @click="openDriver"
                        >{{ $t('androidRemoteTS.code.UIAutomator2ServerInit') }}
                      </el-button>
                      <el-button
                        size="mini"
                        type="danger"
                        :disabled="!isDriverFinish"
                        @click="closeDriver"
                        >{{ $t('androidRemoteTS.code.closeDriver') }}
                      </el-button>
                      <div style="margin-top: 8px">
                        Status:
                        <span
                          :style="
                            isDriverFinish ? 'color:#67C23A' : 'color:#606266'
                          "
                        >
                          {{ isDriverFinish ? 'Connected' : 'Diconnected' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12" style="margin-top: 15px">
                <el-card>
                  <template #header>
                    <strong>{{ $t('IOSRemote.clipboard.operate') }}</strong>
                  </template>
                  <el-input
                    v-model="paste"
                    :rows="10"
                    show-word-limit
                    clearable
                    type="textarea"
                    :placeholder="$t('IOSRemote.clipboard.inputText')"
                  ></el-input>
                  <div style="text-align: center; margin-top: 15px">
                    <el-button
                      size="mini"
                      type="primary"
                      @click="setPasteboard(paste)"
                    >
                      {{ $t('IOSRemote.clipboard.send') }}
                    </el-button>
                    <el-button size="mini" type="primary" @click="getPasteboard"
                      >{{ $t('IOSRemote.clipboard.getText') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12" style="margin-top: 15px">
                <el-card>
                  <template #header>
                    <strong>{{
                      $t('androidRemoteTS.code.fileTransfer')
                    }}</strong>
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
                          <div class="el-upload__text">
                            {{ $t('androidRemoteTS.code.messageFive') }}
                            <em>{{ $t('devices.detail.uploadImg') }}</em>
                          </div>
                        </el-upload>
                        <div style="display: flex; margin-top: 5px">
                          <el-input
                            v-model="pushPath"
                            size="mini"
                            :placeholder="
                              $t('androidRemoteTS.code.pleaseFilePath')
                            "
                          ></el-input>
                          <el-button
                            style="margin-left: 5px"
                            size="mini"
                            type="primary"
                            :loading="pushLoading"
                            :disabled="
                              pushPath.length === 0 ||
                              upLoadFilePath.length === 0
                            "
                            @click="pushFile"
                            >Push
                          </el-button>
                        </div>
                      </el-tab-pane>
                      <el-tab-pane :label="$t('androidRemoteTS.code.filePath')">
                        <el-input
                          v-model="pullPath"
                          size="mini"
                          :placeholder="$t('androidRemoteTS.code.pullFilePath')"
                        ></el-input>
                        <el-button
                          style="margin-top: 5px"
                          size="mini"
                          type="primary"
                          :loading="pullLoading"
                          :disabled="pullPath.length === 0"
                          @click="pullFile"
                          >Pull
                        </el-button>
                        <a
                          v-if="pullResult.length !== 0"
                          :href="pullResult"
                          download
                          target="_blank"
                        >
                          <el-button
                            style="margin-top: 5px; margin-left: 10px"
                            size="mini"
                            type="success"
                          >
                            {{ $t('androidRemoteTS.code.installFile') }}
                          </el-button>
                        </a>
                      </el-tab-pane>
                      <el-tab-pane
                        :label="$t('androidRemoteTS.code.scanQRCode')"
                      >
                        <el-alert
                          :title="$t('androidRemoteTS.code.errTitle')"
                          type="info"
                          show-icon
                          :closable="false"
                        >
                        </el-alert>
                        <div style="text-align: center; margin-top: 10px">
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
                            <div class="el-upload__text">
                              {{ $t('androidRemoteTS.code.messageThree') }}
                              <em>{{ $t('devices.detail.uploadImg') }}</em>
                            </div>
                            <template #tip>
                              <div class="el-upload__tip">
                                {{ $t('androidRemoteTS.code.messageFour') }}
                              </div>
                            </template>
                          </el-upload>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane :label="$t('androidRemoteTS.code.app')" name="apps">
            <el-tabs v-model="activeIntallTab" type="border-card" stretch>
              <el-tab-pane name="pushInstallPane">
                <template #label>
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
                    <div class="el-upload__text">
                      {{ $t('androidRemoteTS.code.apkFile') }}
                      <em>{{ $t('devices.detail.uploadImg') }}</em>
                    </div>
                    <template #tip>
                      <div class="el-upload__tip">
                        {{ $t('androidRemoteTS.code.onlyAPKFile') }}
                      </div>
                    </template>
                  </el-upload>
                </div>
              </el-tab-pane>
              <el-tab-pane name="urlInstallPane">
                <template #label>
                  <strong>{{ $t('androidRemoteTS.code.URLInstall') }}</strong>
                </template>
                <el-input
                  v-model="uploadUrl"
                  clearable
                  size="small"
                  :placeholder="$t('androidRemoteTS.code.hint')"
                ></el-input>
                <div style="text-align: center; margin-top: 20px">
                  <el-button
                    size="mini"
                    type="primary"
                    :disabled="uploadUrl.length === 0"
                    @click="install(uploadUrl)"
                    >{{ $t('androidRemoteTS.code.send') }}
                  </el-button>
                </div>
              </el-tab-pane>
              <el-tab-pane name="linkInstallPane">
                <template #label>
                  <strong>{{ $t('androidRemoteTS.code.linkInstall') }}</strong>
                </template>
                <span style="color: #909399; margin-right: 10px">{{
                  $t('androidRemoteTS.code.associatedProject')
                }}</span>
                <el-select
                  v-model="project"
                  size="mini"
                  value-key="id"
                  :placeholder="$t('androidRemoteTS.code.chooseProject')"
                >
                  <el-option
                    v-for="item in store.state.projectList"
                    :key="item.id"
                    :value="item"
                    :label="item['projectName']"
                  >
                    <div style="display: flex; align-items: center">
                      <el-avatar
                        style="margin-right: 10px"
                        :size="32"
                        :src="
                          item['projectImg'].length > 0
                            ? item['projectImg']
                            : defaultLogo
                        "
                        shape="square"
                      ></el-avatar>
                      {{ item['projectName'] }}
                    </div>
                  </el-option>
                </el-select>

                <div v-if="project !== null">
                  <package-list
                    v-if="project !== null"
                    :project-id="project['id']"
                    platform-type="Android"
                    @select-package="selectPackage"
                  ></package-list>
                </div>
                <div v-else>
                  <el-card style="height: 100%; margin-top: 20px">
                    <el-result
                      icon="info"
                      :title="$t('androidRemoteTS.code.hintText')"
                      :sub-title="
                        $t('androidRemoteTS.code.hintAssociatedProject')
                      "
                    >
                    </el-result>
                  </el-card>
                </div>
              </el-tab-pane>
            </el-tabs>
            <el-card shadow="hover" style="margin-top: 15px">
              <el-table :data="currAppListPageData" border>
                <el-table-column width="100" header-align="center">
                  <template #header>
                    <el-button size="mini" @click="refreshAppList"
                      >{{ $t('androidRemoteTS.code.refresh') }}
                    </el-button>
                  </template>
                  <template #default="scope">
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      "
                    >
                      <el-avatar
                        shape="square"
                        :size="40"
                        :src="'data:image/png;base64,' + scope.row.appIcon"
                      ></el-avatar>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  width="150"
                  show-overflow-tooltip
                  header-align="center"
                  prop="appName"
                  :label="$t('androidRemoteTS.code.appName')"
                >
                </el-table-column>
                <el-table-column
                  header-align="center"
                  show-overflow-tooltip
                  prop="packageName"
                  :label="$t('androidRemoteTS.code.packagesName')"
                >
                  <template #default="scope">
                    <div
                      style="cursor: pointer"
                      @click="copy(scope.row.packageName)"
                    >
                      {{ scope.row.packageName }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  header-align="center"
                  show-overflow-tooltip
                  prop="versionName"
                  :label="$t('androidRemoteTS.code.version')"
                  width="120"
                ></el-table-column>
                <el-table-column
                  header-align="center"
                  show-overflow-tooltip
                  prop="versionCode"
                  :label="$t('androidRemoteTS.code.subversion')"
                  width="120"
                ></el-table-column>
                <el-table-column align="center" width="260">
                  <template #header>
                    <el-input
                      v-model="filterAppText"
                      size="mini"
                      :placeholder="$t('androidRemoteTS.code.nameSearch')"
                    />
                  </template>
                  <template #default="scope">
                    <el-button
                      size="mini"
                      type="primary"
                      @click="openApp(scope.row.packageName)"
                    >
                      {{ $t('androidRemoteTS.code.open') }}
                    </el-button>
                    <el-button
                      size="mini"
                      type="warning"
                      @click="killApp(scope.row.packageName)"
                    >
                      {{ $t('androidRemoteTS.code.kill') }}
                    </el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      @click="uninstallApp(scope.row.packageName)"
                    >
                      {{ $t('androidRemoteTS.code.unInstall') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <Pageable
                :is-page-set="false"
                :total="filterTableData.length"
                :current-page="currAppListPageIndex + 1"
                :page-size="7"
                @change="changeAppListPage"
              ></Pageable>
            </el-card>
          </el-tab-pane>
          <el-tab-pane :label="$t('androidRemoteTS.code.packet')" name="proxy">
            <el-button size="small" type="success" @click="startProxy"
              >{{ $t('androidRemoteTS.code.startPacket') }}
            </el-button>
            <el-button size="small" @click="installCert"
              >{{ $t('androidRemoteTS.code.downloadCertificate') }}
            </el-button>
            <el-button size="small" @click="clearProxy"
              >{{ $t('androidRemoteTS.code.cancelGlobalProxy') }}
            </el-button>
            <strong
              v-if="proxyConnPort !== 0"
              style="color: #67c23a; float: right; margin-top: 5px"
              >{{ $t('androidRemoteTS.code.proxyConnection') }}：{{
                agent['host'] + ':' + proxyConnPort
              }}</strong
            >
            <span style="float: right; display: flex; align-items: center">
              <el-button
                size="mini"
                style="margin-right: 6px"
                @click="getWifiList"
                >{{ $t('androidRemoteTS.code.refresh') }}</el-button
              >
              <ColorImg
                :src="wifiLogo"
                :width="18"
                :height="18"
                :color="isConnectWifi ? '#67C23A' : '#F56C6C'"
              />
              <span style="margin-left: 6px; color: #67c23a; font-size: 16px">{{
                currentWifi.length > 0 && isConnectWifi
                  ? currentWifi.replaceAll('"', '')
                  : ' '
              }}</span>
            </span>
            <iframe
              v-if="proxyWebPort !== 0"
              allow="clipboard-read;clipboard-write"
              :style="
                'border:1px solid #C0C4CC;width: 100%;height: ' +
                iFrameHeight +
                'px;margin-top:15px'
              "
              :src="'http://' + agent['host'] + ':' + proxyWebPort"
            ></iframe>
            <el-card v-else style="margin-top: 20px">
              <template #header
                ><strong>{{
                  $t('androidRemoteTS.code.useTeaching')
                }}</strong></template
              >
              <div style="height: 300px">
                <el-steps direction="vertical" :active="3">
                  <el-step
                    :title="$t('androidRemoteTS.code.connectWifi')"
                    status="process"
                    :description="$t('androidRemoteTS.code.connectWifiText')"
                  />
                  <el-step
                    :title="$t('androidRemoteTS.code.installCertificate')"
                    status="process"
                    :description="
                      $t('androidRemoteTS.code.installCertificateText')
                    "
                  />
                  <el-step
                    :title="$t('androidRemoteTS.code.startCapturing')"
                    status="process"
                    :description="$t('androidRemoteTS.code.startCapturingText')"
                  />
                </el-steps>
              </div>
            </el-card>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('androidRemoteTS.code.screenshotQuick')"
            name="screenCap"
          >
            <el-button type="primary" size="small" @click="quickCap">
              <el-icon :size="12" style="vertical-align: middle">
                <Camera />
              </el-icon>
              {{ $t('androidRemoteTS.code.screenshot') }}
            </el-button>
            <el-button type="danger" size="small" @click="removeScreen">
              <el-icon :size="12" style="vertical-align: middle">
                <Delete />
              </el-icon>
              {{ $t('androidRemoteTS.code.clean') }}
            </el-button>
            <el-card
              v-if="screenUrls.length === 0"
              style="height: 100%; margin-top: 10px"
            >
              <el-empty
                :description="$t('androidRemoteTS.code.noScreenshots')"
              ></el-empty>
            </el-card>
            <el-row v-else :gutter="20">
              <el-col
                v-for="u in screenUrls"
                :xs="8"
                :sm="8"
                :md="8"
                :lg="4"
                :xl="4"
                style="margin-top: 10px"
              >
                <el-card shadow="hover" :body-style="{ padding: '10px' }">
                  <el-image
                    :src="u"
                    :preview-src-list="screenUrls"
                    hide-on-click-modal
                  ></el-image>
                  <div style="text-align: center; margin-top: 5px">
                    <el-button
                      type="primary"
                      plain
                      size="mini"
                      @click="downloadImg(u)"
                    >
                      <el-icon :size="12" style="vertical-align: middle">
                        <Download />
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
                  :body-style="{
                    color: '#FFFFFF',
                    backgroundColor: '#303133',
                    lineHeight: '1.5',
                  }"
                >
                  <el-scrollbar
                    ref="terScroll"
                    noresize
                    :style="'height:' + terminalHeight + 'px;min-height:450px'"
                  >
                    <div
                      v-for="c in cmdOutPut"
                      style="white-space: pre-wrap"
                      v-html="c"
                    ></div>
                  </el-scrollbar>
                  <div style="display: flex; margin-top: 10px">
                    <el-input
                      v-model="cmdInput"
                      size="mini"
                      :placeholder="$t('androidRemoteTS.code.inputSend')"
                      @keyup.enter="sendCmd"
                    >
                      <template #prepend>{{ cmdUser + ':/ $' }}</template>
                    </el-input>
                    <el-button
                      size="mini"
                      :disabled="cmdInput.length === 0 || !cmdIsDone"
                      style="margin-left: 5px"
                      type="primary"
                      @click="sendCmd"
                      >Send
                    </el-button>
                    <el-button
                      size="mini"
                      :disabled="cmdIsDone"
                      style="margin-left: 5px"
                      type="danger"
                      @click="stopCmd"
                      >Stop
                    </el-button>
                    <el-button
                      size="mini"
                      style="margin-left: 5px"
                      type="warning"
                      @click="clearCmd"
                      >Clear
                    </el-button>
                  </div>
                </el-card>
              </el-tab-pane>
              <el-tab-pane label="Logcat">
                <el-card
                  style="border: 0px"
                  :body-style="{
                    color: '#FFFFFF',
                    backgroundColor: '#303133',
                    lineHeight: '1.5',
                  }"
                >
                  <div style="display: flex; margin-bottom: 10px">
                    <el-select v-model="logcatFilter.level" size="mini">
                      <el-option label="VERBOSE" value="V"></el-option>
                      <el-option label="DEBUG" value="D"></el-option>
                      <el-option label="INFO" value="I"></el-option>
                      <el-option label="WARN" value="W"></el-option>
                      <el-option label="ERROR" value="E"></el-option>
                      <el-option label="FATAL" value="F"></el-option>
                      <el-option label="SILENT" value="S"></el-option>
                    </el-select>
                    <el-input
                      v-model="logcatFilter.filter"
                      style="margin-left: 5px"
                      size="mini"
                      :placeholder="$t('androidRemoteTS.code.enterInput')"
                    >
                      <template #prepend>| grep</template>
                    </el-input>
                    <el-button
                      size="mini"
                      style="margin-left: 5px"
                      type="primary"
                      @click="sendLogcat"
                      >Search
                    </el-button>
                    <el-button
                      size="mini"
                      style="margin-left: 5px"
                      type="danger"
                      @click="stopLogcat"
                      >Stop
                    </el-button>
                    <el-button
                      size="mini"
                      style="margin-left: 5px"
                      type="warning"
                      @click="clearLogcat"
                      >Clear
                    </el-button>
                  </div>
                  <el-scrollbar
                    ref="logcatScroll"
                    noresize
                    :style="'height:' + terminalHeight + 'px;min-height:450px'"
                  >
                    <div
                      v-for="l in logcatOutPut"
                      style="white-space: pre-wrap"
                      v-html="l"
                    ></div>
                  </el-scrollbar>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('androidRemoteTS.code.UIAutomation.UIAutomationName')"
            name="auto"
          >
            <div v-if="testCase['id']">
              <el-collapse accordion style="margin-bottom: 20px">
                <el-collapse-item>
                  <template #title>
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        width: 100%;
                        justify-content: space-between;
                      "
                    >
                      <strong
                        style="
                          font-size: 15px;
                          color: #909399;
                          margin-left: 10px;
                        "
                        >{{
                          $t('androidRemoteTS.code.UIAutomation.testInfo')
                        }}</strong
                      >
                      <el-button
                        style="margin-right: 10px"
                        type="danger"
                        size="mini"
                        @click="removeCase"
                      >
                        {{ $t('androidRemoteTS.code.UIAutomation.clean') }}
                      </el-button>
                    </div>
                  </template>
                  <el-descriptions :column="2" size="medium" border>
                    <el-descriptions-item
                      width="100px"
                      :label="$t('projectIndexTS.page.caseId')"
                      >{{ testCase['id'] }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      width="100px"
                      :label="$t('projectIndexTS.page.caseName')"
                      >{{ testCase.name }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      :label="
                        $t('androidRemoteTS.code.UIAutomation.fatherPlayed')
                      "
                    >
                      <div style="display: flex; align-items: center">
                        <el-avatar
                          style="margin-right: 10px"
                          :size="27"
                          :src="
                            project['projectImg'].length > 0
                              ? project['projectImg']
                              : defaultLogo
                          "
                          shape="square"
                        ></el-avatar>
                        {{ project['projectName'] }}
                      </div>
                    </el-descriptions-item>
                    <el-descriptions-item
                      :label="$t('stepListViewTS.platformToBe')"
                    >
                      <div style="display: flex; align-items: center">
                        <el-avatar
                          style="margin-right: 10px"
                          :size="27"
                          :src="
                            getImg(
                              testCase['platform'] === 1 ? 'ANDROID' : 'IOS'
                            )
                          "
                          shape="square"
                        ></el-avatar>
                        {{
                          testCase['platform'] === 1
                            ? $t('publicStepTS.android')
                            : 'iOS'
                        }}
                      </div>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.module')">
                      {{
                        testCase['modulesDTO'] !== null
                          ? testCase['modulesDTO'].name
                          : ''
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      :label="$t('stepListViewTS.versionName')"
                      >{{ testCase['version'] }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.designer')"
                      >{{ testCase['designer'] }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('stepListViewTS.last')"
                      >{{ testCase['editTime'] }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      :label="$t('stepListViewTS.testMessage')"
                      >{{ testCase['des'] }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-collapse-item>
              </el-collapse>
              <el-tabs v-model="activeTab2" type="border-card" stretch>
                <el-tab-pane :label="$t('publicStepTS.list')" name="step">
                  <step-list
                    :is-show-run="true"
                    :platform="1"
                    :is-driver-finish="isDriverFinish"
                    :case-id="testCase['id']"
                    :project-id="project['id']"
                    :debug-loading="debugLoading"
                    @runStep="runStep"
                  />
                </el-tab-pane>
                <el-tab-pane
                  :label="$t('resultDetailTS.page.runLog')"
                  name="log"
                >
                  <step-log
                    :is-read-only="false"
                    :debug-loading="debugLoading"
                    :step-log="stepLog"
                    @clearLog="clearLog"
                    @stopStep="stopStep"
                  />
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-else>
              <span style="color: #909399; margin-right: 10px">{{
                $t('androidRemoteTS.code.associatedProject')
              }}</span>
              <el-select
                v-model="project"
                size="mini"
                value-key="id"
                :placeholder="$t('androidRemoteTS.code.chooseProject')"
              >
                <el-option
                  v-for="item in store.state.projectList"
                  :key="item.id"
                  :value="item"
                  :label="item['projectName']"
                >
                  <div style="display: flex; align-items: center">
                    <el-avatar
                      style="margin-right: 10px"
                      :size="32"
                      :src="
                        item['projectImg'].length > 0
                          ? item['projectImg']
                          : defaultLogo
                      "
                      shape="square"
                    ></el-avatar>
                    {{ item['projectName'] }}
                  </div>
                </el-option>
              </el-select>
              <el-button
                v-if="project !== null"
                size="mini"
                type="primary"
                round
                style="position: absolute; right: 20px"
                @click="caseList.open()"
              >
                {{ $t('androidRemoteTS.code.addCase') }}
              </el-button>
              <test-case-list
                v-if="project !== null"
                ref="caseList"
                :project-id="project['id']"
                :platform="1"
                :is-read-only="true"
                @select-case="selectCase"
              ></test-case-list>
              <el-card style="height: 100%; margin-top: 20px">
                <el-result
                  icon="info"
                  :title="$t('androidRemoteTS.code.hintText')"
                  :sub-title="$t('androidRemoteTS.code.hintMessage')"
                >
                </el-result>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('routes.controlElement')" name="ele">
            <el-tabs stretch type="border-card">
              <el-tab-pane :label="$t('androidRemoteTS.code.nativeControls')">
                <div v-show="isShowImg">
                  <div
                    style="
                      margin-bottom: 15px;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                  >
                    <div>
                      <el-select v-model="isMultiWindows" size="mini">
                        <el-option
                          :label="$t('androidRemoteTS.element.windows.single')"
                          :value="false"
                        />
                        <el-option
                          :label="$t('androidRemoteTS.element.windows.multi')"
                          :value="true"
                        />
                      </el-select>
                      <el-select
                        v-model="isVisible"
                        style="margin-left: 10px"
                        size="mini"
                      >
                        <el-option
                          :label="$t('androidRemoteTS.element.visible.hid')"
                          :value="false"
                        />
                        <el-option
                          :label="$t('androidRemoteTS.element.visible.show')"
                          :value="true"
                        />
                      </el-select>
                      <el-select
                        v-model="isIgnore"
                        style="margin-left: 10px"
                        size="mini"
                      >
                        <el-option
                          :label="
                            $t('androidRemoteTS.element.unimportant.ignore')
                          "
                          :value="true"
                        />
                        <el-option
                          :label="
                            $t('androidRemoteTS.element.unimportant.show')
                          "
                          :value="false"
                        />
                      </el-select>
                      <el-button
                        style="margin-left: 10px"
                        type="primary"
                        size="mini"
                        :loading="elementLoading"
                        :disabled="isDriverFinish === false"
                        @click="getElement"
                      >
                        <el-icon :size="12" style="vertical-align: middle">
                          <Search />
                        </el-icon>
                        {{ $t('androidRemoteTS.code.retrieveControlEle') }}
                      </el-button>
                    </div>
                    <span
                      v-if="activity.length > 0"
                      style="
                        margin-right: 10px;
                        color: #909399;
                        font-size: 14px;
                        cursor: pointer;
                      "
                      @click="copy(activity)"
                      >{{ $t('androidRemoteTS.code.activity') }}：
                      {{ activity }}</span
                    >
                  </div>
                  <el-row :gutter="10">
                    <el-col :span="7">
                      <el-card shadow="hover">
                        <div
                          :style="
                            'width: 100%;background-image: url(' +
                            imgUrl +
                            ');background-size: 100% 100%;'
                          "
                        >
                          <canvas
                            id="debugPic"
                            @mousedown="touchstart"
                          ></canvas>
                        </div>
                      </el-card>
                      <el-card
                        v-if="webViewData.length > 0"
                        :body-style="{ padding: '12px' }"
                        shadow="hover"
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
                      <el-card v-if="isShowTree" shadow="hover">
                        <el-input
                          v-model="filterText"
                          style="margin-bottom: 10px"
                          size="mini"
                          :placeholder="$t('androidRemoteTS.code.classFilter')"
                        ></el-input>
                        <div style="height: 660px">
                          <el-scrollbar
                            class="element-tree-scrollbar"
                            style="height: 100%"
                          >
                            <el-tree
                              ref="tree"
                              :indent="13"
                              :filter-node-method="filterNode"
                              :default-expanded-keys="currentId"
                              node-key="id"
                              style="margin-top: 10px; margin-bottom: 20px"
                              :highlight-current="true"
                              :accordion="true"
                              :data="elementData"
                              @node-click="handleNodeClick"
                            >
                              <template #default="{ node, data }">
                                <span
                                  v-if="data.detail['resource-id']"
                                  style="font-size: 14px"
                                >
                                  {{
                                    node.label.substring(
                                      0,
                                      node.label.indexOf('>')
                                    ) + ' '
                                  }}
                                  <span style="color: #f55781">resource-id</span
                                  >={{
                                    '"' + data.detail['resource-id'] + '">'
                                  }}
                                </span>
                                <span v-else style="font-size: 14px">{{
                                  node.label
                                }}</span>
                              </template>
                            </el-tree>
                          </el-scrollbar>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="8">
                      <el-card v-if="isShowTree" shadow="hover">
                        <div style="height: 695px; padding-bottom: 60px">
                          <div
                            v-if="project && project['id']"
                            style="text-align: center; margin-bottom: 10px"
                          >
                            <el-button
                              :disabled="elementDetail === null"
                              plain
                              size="small"
                              type="primary"
                              round
                              @click="toAddElement('', '')"
                              >{{ $t('androidRemoteTS.code.addControls') }}
                            </el-button>
                            <el-button
                              v-if="
                                elementDetail &&
                                elementDetail['xpath'] &&
                                isDriverFinish
                              "
                              :loading="elementScreenLoading"
                              style="margin-left: 5px"
                              plain
                              size="small"
                              round
                              @click="getEleScreen(elementDetail['xpath'])"
                              >{{ $t('androidRemoteTS.code.controlSnapshot') }}
                            </el-button>
                          </div>
                          <div v-else>
                            <el-alert
                              style="margin-bottom: 10px"
                              :title="$t('androidRemoteTS.code.titleMessage')"
                              type="info"
                              show-icon
                              close-text="Get!"
                            />
                            <el-select
                              v-model="project"
                              style="width: 100%"
                              size="mini"
                              value-key="id"
                              :placeholder="
                                $t('androidRemoteTS.code.chooseProject')
                              "
                            >
                              <el-option
                                v-for="item in store.state.projectList"
                                :key="item.id"
                                :value="item"
                                :label="item['projectName']"
                              >
                                <div style="display: flex; align-items: center">
                                  <el-avatar
                                    style="margin-right: 10px"
                                    :size="32"
                                    :src="
                                      item['projectImg'].length > 0
                                        ? item['projectImg']
                                        : defaultLogo
                                    "
                                    shape="square"
                                  ></el-avatar>
                                  {{ item['projectName'] }}
                                </div>
                              </el-option>
                            </el-select>
                          </div>
                          <el-scrollbar
                            style="height: 100%"
                            class="element-tree-scrollbar"
                          >
                            <el-form
                              v-if="elementDetail !== null"
                              label-position="left"
                              class="element-table"
                              label-width="100px"
                            >
                              <el-form-item
                                label="class"
                                style="cursor: pointer"
                                @click="copy(elementDetail['class'])"
                              >
                                <span>{{ elementDetail['class'] }}</span>
                              </el-form-item>
                              <el-form-item
                                v-if="elementDetail['resource-id']"
                                label="resource-id"
                                style="cursor: pointer"
                              >
                                <span
                                  @click="copy(elementDetail['resource-id'])"
                                  >{{ elementDetail['resource-id'] }}</span
                                >
                                <el-icon
                                  v-if="project && project['id']"
                                  color="green"
                                  size="16"
                                  style="
                                    vertical-align: middle;
                                    margin-left: 10px;
                                    cursor: pointer;
                                  "
                                  @click="
                                    toAddElement(
                                      'id',
                                      elementDetail['resource-id']
                                    )
                                  "
                                >
                                  <Pointer />
                                </el-icon>
                              </el-form-item>
                              <el-form-item
                                :label="$t('androidRemoteTS.code.xpath')"
                              >
                                <el-table
                                  stripe
                                  :empty-text="
                                    $t('androidRemoteTS.code.xpathNull')
                                  "
                                  border
                                  :data="findBestXpath(elementDetail)"
                                  :show-header="false"
                                >
                                  <el-table-column>
                                    <template #default="scope">
                                      <span
                                        style="cursor: pointer"
                                        @click="copy(scope.row)"
                                        >{{ scope.row }}</span
                                      >
                                      <el-icon
                                        v-if="project && project['id']"
                                        color="green"
                                        size="16"
                                        style="
                                          vertical-align: middle;
                                          margin-left: 10px;
                                          cursor: pointer;
                                        "
                                        @click="
                                          toAddElement('xpath', scope.row)
                                        "
                                      >
                                        <Pointer />
                                      </el-icon>
                                    </template>
                                  </el-table-column>
                                </el-table>
                              </el-form-item>
                              <el-form-item
                                :label="$t('androidRemoteTS.code.absolutePath')"
                                style="cursor: pointer"
                              >
                                <span @click="copy(elementDetail['xpath'])">{{
                                  elementDetail['xpath']
                                }}</span>
                                <el-icon
                                  v-if="project && project['id']"
                                  color="green"
                                  size="16"
                                  style="
                                    vertical-align: middle;
                                    margin-left: 10px;
                                    cursor: pointer;
                                  "
                                  @click="
                                    toAddElement(
                                      'xpath',
                                      elementDetail['xpath']
                                    )
                                  "
                                >
                                  <Pointer />
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
                                v-if="elementDetail['content-desc']"
                                label="content-desc"
                                style="cursor: pointer"
                              >
                                <span
                                  @click="copy(elementDetail['content-desc'])"
                                  >{{ elementDetail['content-desc'] }}</span
                                >
                                <el-icon
                                  v-if="project && project['id']"
                                  color="green"
                                  size="16"
                                  style="
                                    vertical-align: middle;
                                    margin-left: 10px;
                                    cursor: pointer;
                                  "
                                  @click="
                                    toAddElement(
                                      'accessibilityId',
                                      elementDetail['content-desc']
                                    )
                                  "
                                >
                                  <Pointer />
                                </el-icon>
                              </el-form-item>
                              <el-form-item
                                label="package"
                                style="cursor: pointer"
                                @click="copy(elementDetail['package'])"
                              >
                                <span>{{ elementDetail['package'] }}</span>
                              </el-form-item>
                              <el-form-item
                                :label="$t('androidRemoteTS.code.centerXY')"
                                style="cursor: pointer"
                              >
                                <span
                                  @click="
                                    copy(
                                      computedCenter(
                                        elementDetail['bStart'],
                                        elementDetail['bEnd']
                                      )
                                    )
                                  "
                                  >{{
                                    computedCenter(
                                      elementDetail['bStart'],
                                      elementDetail['bEnd']
                                    )
                                  }}</span
                                >
                                <el-icon
                                  v-if="project && project['id']"
                                  color="green"
                                  size="16"
                                  style="
                                    vertical-align: middle;
                                    margin-left: 10px;
                                    cursor: pointer;
                                  "
                                  @click="
                                    toAddElement(
                                      'point',
                                      computedCenter(
                                        elementDetail['bStart'],
                                        elementDetail['bEnd']
                                      )
                                    )
                                  "
                                >
                                  <Pointer />
                                </el-icon>
                              </el-form-item>
                              <el-form-item label="index">
                                <span>{{ elementDetail['index'] }}</span>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.checkable')
                                "
                              >
                                <el-switch
                                  :value="
                                    JSON.parse(elementDetail['checkable'])
                                  "
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.checked')
                                "
                              >
                                <el-switch
                                  :value="JSON.parse(elementDetail['checked'])"
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.clickable')
                                "
                              >
                                <el-switch
                                  :value="
                                    JSON.parse(elementDetail['clickable'])
                                  "
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.selected')
                                "
                              >
                                <el-switch
                                  :value="JSON.parse(elementDetail['selected'])"
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.displayed')
                                "
                              >
                                <el-switch
                                  :value="
                                    JSON.parse(elementDetail['displayed'])
                                  "
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.enabled')
                                "
                              >
                                <el-switch
                                  :value="JSON.parse(elementDetail['enabled'])"
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.focusable')
                                "
                              >
                                <el-switch
                                  :value="
                                    JSON.parse(elementDetail['focusable'])
                                  "
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.focused')
                                "
                              >
                                <el-switch
                                  :value="JSON.parse(elementDetail['focused'])"
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.longClickable')
                                "
                              >
                                <el-switch
                                  :value="
                                    JSON.parse(elementDetail['long-clickable'])
                                  "
                                  disabled
                                >
                                </el-switch>
                              </el-form-item>
                              <el-form-item
                                :label="
                                  $t('androidRemoteTS.code.label.scrollable')
                                "
                              >
                                <el-switch
                                  :value="
                                    JSON.parse(elementDetail['scrollable'])
                                  "
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
                <el-card v-show="!isShowImg" style="height: 100%">
                  <el-result
                    icon="info"
                    :title="$t('androidRemoteTS.code.hintText')"
                    :sub-title="$t('androidRemoteTS.code.subTitleText')"
                  >
                    <template #extra>
                      <el-button
                        size="mini"
                        type="primary"
                        :disabled="isDriverFinish"
                        :loading="driverLoading"
                        @click="openDriver"
                        >{{ $t('androidRemoteTS.code.UIAutomator2ServerInit') }}
                      </el-button>
                      <el-button
                        type="primary"
                        size="mini"
                        :loading="elementLoading"
                        :disabled="isDriverFinish === false"
                        @click="getElement"
                      >
                        <el-icon :size="12" style="vertical-align: middle">
                          <Search />
                        </el-icon>
                        {{ $t('androidRemoteTS.code.getEle') }}
                      </el-button>
                    </template>
                  </el-result>
                </el-card>
              </el-tab-pane>
              <el-tab-pane :label="$t('androidRemoteTS.code.poco')">
                <poco-pane
                  ref="pocoPaneRef"
                  :poco-loading="pocoLoading"
                  :is-driver-finish="isDriverFinish"
                  :direction-status="directionStatus"
                  :project-list="store.state.projectList"
                  :get-img-url="getImgUrl"
                  @get-poco="getPoco"
                  @copy="copy"
                />
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('androidRemoteTS.code.webView.webDebug')"
            name="webview"
          >
            <div v-if="isWebView">
              <div v-if="webViewListDetail.length == 0">
                <el-result
                  icon="info"
                  :title="$t('androidRemoteTS.code.hintText')"
                  :sub-title="$t('androidRemoteTS.code.webView.err')"
                >
                  <template #extra>
                    <el-button
                      type="primary"
                      size="mini"
                      :loading="webViewLoading"
                      @click="getWebViewForward"
                    >
                      <el-icon :size="12" style="vertical-align: middle">
                        <Search />
                      </el-icon>
                      {{ $t('androidRemoteTS.code.webView.getWeb') }}
                    </el-button>
                  </template>
                </el-result>
              </div>
              <div v-else>
                <el-button
                  :loading="webViewLoading"
                  type="primary"
                  size="mini"
                  @click="getWebViewForward"
                >
                  {{ $t('androidRemoteTS.code.webView.againGetWeb') }}
                </el-button>
                <el-card
                  v-for="web in webViewListDetail"
                  style="margin-top: 15px"
                  class="device-card"
                  :body-style="{ padding: '0px 10px 10px 10px' }"
                >
                  <template #header>
                    <div>
                      <div style="display: flex; align-items: center">
                        <img :src="getImg('chrome')" width="20" />
                        <strong style="margin-left: 10px"
                          >{{ web['package'] }} ({{ web['version'] }})</strong
                        >
                      </div>
                    </div>
                  </template>
                  <el-card
                    v-for="w in web.children"
                    :body-style="{ padding: '15px' }"
                    style="
                      margin-top: 10px;
                      word-wrap: break-word;
                      overflow: hidden;
                    "
                  >
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                      "
                    >
                      <div>
                        <div style="display: flex; align-items: center">
                          <img
                            v-if="w.favicon"
                            :src="w.favicon"
                            width="15"
                            style="margin-right: 5px"
                          />
                          <strong>{{
                            w.title.length > 0
                              ? w.title
                              : $t('androidRemoteTS.code.webView.Untitled')
                          }}</strong>
                        </div>
                        <div style="color: #909399">
                          {{
                            w.url.length > 50
                              ? w.url.substring(0, 50) + '...'
                              : w.url
                          }}
                        </div>
                      </div>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="
                          tabWebView(
                            web.port,
                            w.id,
                            w.title.length > 0
                              ? w.title
                              : $t('androidRemoteTS.code.webView.Untitled')
                          )
                        "
                      >
                        {{ $t('androidRemoteTS.code.webView.nowDebug') }}
                      </el-button>
                    </div>
                  </el-card>
                </el-card>
              </div>
            </div>
            <div v-else>
              <div style="display: flex; align-items: center">
                <el-page-header
                  icon="el-icon-arrow-left"
                  @back="switchIsWebView"
                >
                  <template #title>
                    <span style="color: #606266">{{
                      $t('androidRemoteTS.code.webView.return')
                    }}</span>
                  </template>
                  <template #content>
                    {{ $t('androidRemoteTS.code.webView.nowWeb') }}：<strong>{{
                      title
                    }}</strong>
                  </template>
                </el-page-header>
              </div>
              <iframe
                v-if="!isWebView"
                allow="clipboard-read;clipboard-write"
                :style="
                  'border:1px solid #C0C4CC;;width: 100%;height: ' +
                  iFrameHeight +
                  'px;margin-top:15px'
                "
                :src="iframeUrl"
              >
              </iframe>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('IOSRemote.perfmon')" name="perfmon">
            <android-perf
              ref="androidPerfRef"
              :app-list="appList"
              @start-perfmon="startPerfmon"
              @stop-perfmon="stopPerfmon"
            />
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
    background: url('@/assets/img/drag.png') no-repeat center;
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
    background: url('@/assets/img/drag.png') no-repeat center;
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

.input-box {
  position: absolute;
  border: none;
  background-color: transparent;
  outline: none;
  z-index: -1;
  width: 1px;
}
</style>
