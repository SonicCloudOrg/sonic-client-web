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
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useStore} from 'vuex';
import axios from '@/http/axios';
import {ElMessage} from 'element-plus';
import useClipboard from 'vue-clipboard3';
import StepList from '@/components/StepList.vue';
import TestCaseList from '@/components/TestCaseList.vue';
import StepLog from '@/components/StepLog.vue';
import ElementUpdate from '@/components/ElementUpdate.vue';
import Pageable from '@/components/Pageable.vue';
import defaultLogo from '@/assets/logo.png';
import {
  Aim,
  Place,
  FullScreen,
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
  Refresh,
  RefreshRight,
  RefreshLeft,
  Wallet,
  Menu,
  CopyDocument,
  House,
  Back,
  View,
  InfoFilled,
} from '@element-plus/icons';
import RenderDeviceName from "../../components/RenderDeviceName.vue";

const {toClipboard} = useClipboard();
const route = useRoute();
const store = useStore();
const router = useRouter();
const iFrameHeight = ref(0);
const terminalHeight = ref(0);
const caseList = ref(null);
const device = ref({});
const agent = ref({});
const uploadUrl = ref('');
const text = ref({content: ''});
const sid = ref(0);
let imgWidth = 0;
let imgHeight = 0;
const loading = ref(false);
const appList = ref([])
const filterAppText = ref("")
const remoteAppiumPort = ref(0)
// 旋转状态 // 0 90 180 270
let directionStatus = {
  value: 0,
};
let moveX = 0;
let moveY = 0;
let isFixTouch = false;
let isPress = false;
let loop = null;
let time = 0;
let isLongPress = false;
let mouseMoveTime = 0;
const remoteWDAPort = ref(0)
const elementLoading = ref(false);
const isShowImg = ref(false);
const isDriverFinish = ref(false);
const imgUrl = ref('');
const activity = ref('');
const isShowTree = ref(false);
const elementData = ref([]);
const elementDetail = ref(null);
const elementScreenLoading = ref(false);
const tree = ref(null);
const proxyWebPort = ref(0)
const proxyConnPort = ref(0)
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
const title = ref('');
const uploadLoading = ref(false);
const location = ref(false);
const element = ref({
  id: null,
  eleName: '',
  eleType: 'image',
  eleValue: '',
  projectId: 0,
});
const computedCenter = (x, y, width, height) => {
  let reX = parseInt(parseInt(x) + (parseInt(width) / 2));
  let reY = parseInt(parseInt(y) + (parseInt(height) / 2));
  return reX + ',' + reY;
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
          data.name.toLowerCase().includes(filterAppText.value.toLowerCase()) ||
          data.bundleId.toLowerCase().includes(filterAppText.value.toLowerCase())
  )
  transformPageable(list);
  return list;
})
const simLocation = ref({
  long: 0.000000,
  lat: 0.000000
})
const locationSet = () => {
  websocket.send(
      JSON.stringify({
        type: 'location',
        detail: 'set',
        long: simLocation.value.long + "",
        lat: simLocation.value.lat + ""
      }),
  );
  ElMessage.success({
    message: '开始模拟定位...',
  });
}
const locationUnset = () => {
  websocket.send(
      JSON.stringify({
        type: 'location',
        detail: 'unset',
      }),
  );
  ElMessage.success({
    message: '已恢复定位',
  });
}
const openApp = (pkg) => {
  websocket.send(
      JSON.stringify({
        type: 'launch',
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
const switchTabs = (e) => {
  if (e.props.name === 'apps') {
    if (appList.value.length === 0) {
      refreshAppList()
    }
  }
  if (e.props.name === 'terminal') {
    terminalHeight.value = document.getElementById('pressKey').offsetTop - 200;
  }
};
const switchLocation = () => {
  location.value = !location.value;
  ElMessage.success({
    message: '校准完毕！',
  });
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
      (data.detail['name'] ? data.detail['name'].indexOf(value) !== -1 : false);
};
const findBestNS = (elementDetail) => {
  let result = []
  if (!elementDetail['name']) {
    return result;
  }
  let r = "name CONTAINS \'" + elementDetail['name'] + "\'";
  if (elementDetail['label']) {
    r += (' AND label CONTAINS \'' + elementDetail['label'] + '\'');
  }
  if (elementDetail['enabled']) {
    r += (' AND enabled == ' + elementDetail['enabled']);
  }
  if (elementDetail['visible']) {
    r += (' AND visible == ' + elementDetail['visible']);
  }
  result.push(r)
  return result;
}
const findBestXpath = (elementDetail) => {
  let result = []
  if (elementDetail['name']) {
    result.push('//' + elementDetail['type']
        + '[@name=\'' + elementDetail['name'] + '\']');
    result.push('//' + elementDetail['type']
        + '[contains(@name,\'' + elementDetail['name'] + '\')]');
  }
  if (elementDetail['label']) {
    result.push('//' + elementDetail['type']
        + '[@label=\'' + elementDetail['label'] + '\']');
    result.push('//' + elementDetail['type']
        + '[contains(@label,\'' + elementDetail['label'] + '\')]');
  }
  return result;
}
const downloadImg = () => {
  window.open(imgUrl.value, '_blank');
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
const setImgData = (data) => {
  const img = new Image();
  imgUrl.value = data;
  img.src = data;
  const canvas = document.getElementById('debugPicIOS'),
      g = canvas.getContext('2d');
  const parent = canvas.parentNode;
  img.onload = function () {
    const per = img.height / img.width;
    const width = parseInt(parent.offsetWidth);
    const height = parseInt(width * per);
    canvas.width = width;
    canvas.height = height;
  };
  isShowImg.value = true;
};
const openSocket = (host, port, key, udId) => {
  if ('WebSocket' in window) {
    websocket = new WebSocket(
        'ws://' + host + ':' + port + '/websockets/ios/' + key + '/' + udId + '/' + localStorage.getItem('SonicToken'),
    );
    terminalWebsocket = new WebSocket(
        'ws://' + host + ':' + port + '/websockets/ios/terminal/' + key + '/' + udId + '/' + localStorage.getItem('SonicToken'),
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
const logOutPut = ref([])
const logFilter = ref("")
const terminalScroll = ref(null)
const getSyslog = () => {
  terminalWebsocket.send(
      JSON.stringify({
        type: 'syslog',
        filter: logFilter.value
      }),
  );
}
const stopSyslog = () => {
  terminalWebsocket.send(
      JSON.stringify({
        type: 'stopSyslog',
      }),
  );
}
const clearLogcat = () => {
  logOutPut.value = [];
};
const terminalWebsocketOnmessage = (message) => {
  switch (JSON.parse(message.data)['msg']) {
    case 'appListDetail': {
      appList.value.push(JSON.parse(message.data).detail);
      break
    }
    case 'terminal':
      logOutPut.value.push('连接成功！');
      break;
    case 'logDetail':
      logOutPut.value.push(
          JSON.parse(message.data)['detail']
              .replace(/Notice/g, '<span style=\'color: #0d84ff\'>Notice</span>')
              .replace(/Error/g, '<span style=\'color: #F56C6C\'>Error</span>')
      );
      nextTick(() => {
        terminalScroll['value'].wrap.scrollTop =
            terminalScroll['value'].wrap.scrollHeight;
      });
      break;
  }
}
const websocketOnmessage = (message) => {
  switch (JSON.parse(message.data)['msg']) {
    case 'rotation': {
      const d = JSON.parse(message.data).value;
      if (directionStatus.value !== d) {
        if (d !== -1) {
          ElMessage.success({
            message: '检测到屏幕旋转！请稍后...',
          });
        }
        directionStatus.value = JSON.parse(message.data).value;
        location.value = !location.value
      }
      break;
    }
    case 'proxyResult': {
      proxyWebPort.value = JSON.parse(message.data).webPort
      proxyConnPort.value = JSON.parse(message.data).port
      nextTick(() => {
        iFrameHeight.value = document.body.clientHeight - 280;
      });
      break;
    }
    case 'appiumPort': {
      remoteAppiumPort.value = JSON.parse(message.data).port
      break;
    }
    case 'tree': {
      ElMessage.success({
        message: '获取原生控件元素成功！',
      });
      let result = JSON.parse(message.data);
      currentId.value = [1];
      elementData.value = result.detail;
      isShowTree.value = true;
      elementLoading.value = false;
      if (result.img) {
        setImgData(result.img);
      }
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
    case 'openDriver': {
      ElMessage({
        type: JSON.parse(message.data).status,
        message: JSON.parse(message.data).detail,
      });
      if (JSON.parse(message.data).status === 'success') {
        imgWidth = JSON.parse(message.data).width;
        imgHeight = JSON.parse(message.data).height;
        isDriverFinish.value = true;
      }
      break;
    }
    case 'picFinish': {
      sid.value = JSON.parse(message.data).port
      remoteWDAPort.value = JSON.parse(message.data).wda
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
};
const mouseup = (event) => {
  clearInterval(loop);
  time = 0;
  const iosCap = document.getElementById('iosCap');
  const rect = iosCap.getBoundingClientRect();
  let x;
  let y;
  if (location.value) {
    x = parseInt(
        (event.clientX - rect.left) *
        (imgHeight / iosCap.width),
    );
    y = parseInt(
        (event.clientY - rect.top) *
        (imgWidth / iosCap.height),
    );
  } else {
    x = parseInt(
        (event.clientX - rect.left) *
        (imgWidth / iosCap.width),
    );
    y = parseInt(
        (event.clientY - rect.top) *
        (imgHeight / iosCap.height),
    );
  }
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
};
const mouseleave = () => {
  clearInterval(loop);
  isLongPress = false;
};
const mousedown = (event) => {
  const iosCap = document.getElementById('iosCap');
  const rect = iosCap.getBoundingClientRect();
  if (location.value) {
    moveX = parseInt(
        (event.clientX - rect.left) *
        (imgHeight / iosCap.width),
    );
    moveY = parseInt(
        (event.clientY - rect.top) *
        (imgWidth / iosCap.height),
    );
  } else {
    moveX = parseInt(
        (event.clientX - rect.left) *
        (imgWidth / iosCap.width),
    );
    moveY = parseInt(
        (event.clientY - rect.top) *
        (imgHeight / iosCap.height),
    );
  }
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
};
const touchstart = async (event) => {
  const debugPicIOS = document.getElementById('debugPicIOS');
  const rect = debugPicIOS.getBoundingClientRect();
  const x = parseInt(
      (event.clientX - rect.left) *
      (imgWidth / debugPicIOS.width),
  );
  const y = parseInt(
      (event.clientY - rect.top) *
      (imgHeight / debugPicIOS.height),
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
      if (
          data[i].ele.detail.name &&
          data[i].ele.detail.name.length !== 0
      ) {
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
    const eleStartX = parseInt(ele[i].detail['x']);
    const eleStartY = parseInt(ele[i].detail['y']);
    const eleEndX = parseInt(ele[i].detail.x) + parseInt(ele[i].detail.width);
    const eleEndY = parseInt(ele[i].detail.y) + parseInt(ele[i].detail.height);
    if (x >= eleStartX && x <= eleEndX && y >= eleStartY && y <= eleEndY) {
      result.push({
        ele: ele[i],
        size: parseInt(ele[i].detail.height) *
            parseInt(ele[i].detail.width),
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
  const canvas = document.getElementById('debugPicIOS'),
      g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  const eleStartX = parseInt(data.detail['x']);
  const eleStartY = parseInt(data.detail['y']);
  const eleEndX = parseInt(data.detail.x) + parseInt(data.detail.width);
  const eleEndY = parseInt(data.detail.y) + parseInt(data.detail.height);
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
const pressKey = (key) => {
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'keyEvent',
        key
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
  if (file.name.endsWith('.ipa')) {
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
const install = (ipa) => {
  if (ipa.length > 0) {
    websocket.send(
        JSON.stringify({
          type: 'debug',
          detail: 'install',
          ipa,
        }),
    );
    ElMessage.success({
      message: '开始安装！请稍后...',
    });
  }
};
const sendCommand = (text) => {
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'siri',
        command: text
      }),
  );
};
const getElement = () => {
  elementLoading.value = true;
  websocket.send(
      JSON.stringify({
        type: 'debug',
        detail: 'tree',
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
            <img id="iosCap" v-if="sid===0"/>
            <img v-else
                 id="iosCap"
                 :src="'http://' + agent['host'] + ':'+  sid"
                 width="100%"
                 draggable="false"
                 @mousedown="mousedown"
                 @mouseleave="mouseleave"
                 @mouseup="mouseup"
                 style="display: inline-block"
                 :style="canvasRectInfo"
            />
            <el-button-group id="iOSpressKey">
              <el-button
                  size="small"
                  style="width: 100%"
                  type="info"
                  @click="pressKey('home')"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <House/>
                </el-icon>
              </el-button>
            </el-button-group>
          </div>
          <div style="position: absolute; right: 5px; top: 10px">
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
                    <el-dropdown-menu class="divider">
                      <el-button-group>
                        <el-tooltip
                            effect="dark"
                            content="校准坐标"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="switchLocation"
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
                content="音量"
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
                              @click="pressKey('volumeup')"
                          >
                            <el-icon :size="12" style="vertical-align: middle;">
                              <CaretLeft/>
                            </el-icon>
                          </el-button>
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="pressKey('volumedown')"
                          >
                            <el-icon :size="12" style="vertical-align: middle;">
                              <CaretRight/>
                            </el-icon>
                          </el-button>
                        </el-button-group>
                      </div>
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
                    @click="pressKey('mobilephone')"
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
                    @click="pressKey('camera')"
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
                    @click="pressKey('mobilesafari')"
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
                    @click="pressKey('lock')"
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
              <el-col :span="12">
                <el-tabs type="border-card" stretch>
                  <el-tab-pane label="Siri指令">
                    <el-form size="small" :model="text" style="padding: 24px 0">
                      <el-form-item>
                        <el-input
                            clearable
                            v-model="text.content"
                            size="small"
                            placeholder="请输入siri指令，例：what day is it today?"
                        ></el-input>
                      </el-form-item>
                      <div style="text-align: center;">
                        <el-button
                            size="mini"
                            type="primary"
                            @click="sendCommand(text.content)"
                        >发送
                        </el-button>
                      </div>
                    </el-form>
                  </el-tab-pane>
                  <el-tab-pane label="模拟定位">
                    <el-form size="small" :model="simLocation">
                      <el-form-item label="经度">
                        <el-input-number
                            style="width: 100%"
                            :precision="6"
                            :step="0.1"
                            v-model="simLocation.long"
                            controls-position="right"
                        />
                      </el-form-item>
                      <el-form-item label="纬度">
                        <el-input-number
                            style="width: 100%"
                            :precision="6"
                            :step="0.1"
                            v-model="simLocation.lat"
                            controls-position="right"
                        />
                      </el-form-item>
                    </el-form>
                    <div style="text-align: center;">
                      <el-button
                          size="mini"
                          type="primary"
                          @click="locationSet"
                      >开始模拟
                      </el-button>
                      <el-button
                          size="mini"
                          type="primary"
                          @click="locationUnset"
                      >恢复定位
                      </el-button>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-col>
              <el-col :span="12">
                <el-tabs type="border-card" stretch>
                  <el-tab-pane label="远程WDA">
                    <div style="padding: 13px 0">
                      <div v-if="remoteWDAPort!==0" style="margin-top: 20px;margin-bottom: 20px">
                        <el-card :body-style="{backgroundColor:'#303133',cursor:'pointer'}"
                                 @click="copy('http://'+agent['host']+':'+remoteWDAPort)">
                          <strong style="color: #F2F6FC">{{ 'http://' + agent['host'] + ':' + remoteWDAPort }}</strong>
                        </el-card>
                      </div>
                      <div v-else v-loading="remoteWDAPort.length===0"
                           element-loading-spinner="el-icon-lock"
                           element-loading-background="rgba(255, 255, 255, 1)"
                           element-loading-text="driver未初始化成功"
                           style="margin-top: 18px;margin-bottom: 18px">
                        <el-card>
                          <strong>driver未初始化成功</strong>
                        </el-card>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="远程Appium">
                    <div style="padding: 13px 0">
                      <div v-if="remoteAppiumPort!==0" style="margin-top: 20px;margin-bottom: 20px">
                        <el-card :body-style="{backgroundColor:'#303133',cursor:'pointer'}"
                                 @click="copy('http://'+agent['host']+':'+remoteAppiumPort+'/wd/hub')">
                          <strong style="color: #F2F6FC">http://{{ agent['host'] }}:{{
                              remoteAppiumPort
                            }}/wd/hub</strong>
                        </el-card>
                      </div>
                      <div v-else v-loading="remoteAppiumPort===0"
                           element-loading-spinner="el-icon-lock"
                           element-loading-background="rgba(255, 255, 255, 1)"
                           element-loading-text="AppiumDriver未初始化！"
                           style="margin-top: 18px;margin-bottom: 18px">
                        <el-card>
                          <strong>AppiumDriver未初始化！</strong>
                        </el-card>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </el-col>
              <!--              <el-col :span="8">-->
              <!--                <el-card>-->
              <!--                  <template #header>-->
              <!--                    <strong>录制屏幕（即将开放）</strong>-->
              <!--                  </template>-->
              <!--                  <div style="text-align: center">-->
              <!--                    <el-button size="mini" type="success" disabled>开始录制</el-button>-->
              <!--                    <el-button size="mini" type="info" disabled>暂停录制</el-button>-->
              <!--                    <el-button size="mini" type="danger" disabled>结束录制</el-button>-->
              <!--                    <div style="margin-top: 20px">-->
              <!--                      <el-button size="mini" type="primary" disabled>下载录像</el-button>-->
              <!--                    </div>-->
              <!--                  </div>-->
              <!--                </el-card>-->
              <!--              </el-col>-->
              <el-col :span="12" style="margin-top: 20px">
                <el-card>
                  <template #header>
                    <strong>扫描二维码</strong>
                  </template>
                  <div style="text-align: center" v-loading="true"
                       element-loading-spinner="el-icon-lock"
                       element-loading-background="rgba(255, 255, 255, 1)"
                       element-loading-text="该功能即将开放">
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
                    <strong>文件互传与崩溃日志</strong>
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
                    <strong>安装IPA</strong>
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
                      <div class="el-upload__text">将ipa文件拖到此处，或<em>点击上传</em></div>
                      <template #tip>
                        <div class="el-upload__tip">只能上传ipa文件</div>
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
                                 :src="'data:image/png;base64,'+scope.row.iconBase64"></el-avatar>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column width="150" show-overflow-tooltip header-align="center" prop="name" label="应用名">
                </el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="bundleId"
                                 label="包名">
                  <template #default="scope">
                    <div style="cursor: pointer" @click="copy(scope.row.bundleId)">{{ scope.row.bundleId }}</div>
                  </template>
                </el-table-column>
                <el-table-column header-align="center" show-overflow-tooltip prop="version" label="版本号"
                                 width="120"></el-table-column>
                <el-table-column align="center" width="200">
                  <template #header>
                    <el-input v-model="filterAppText" size="mini" placeholder="输入应用名或包名搜索"/>
                  </template>
                  <template #default="scope">
                    <el-button size="mini" @click="openApp(scope.row.bundleId)" type="primary">打开
                    </el-button>
                    <el-button size="mini" @click="uninstallApp(scope.row.bundleId)" type="danger">卸载</el-button>
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
          <el-tab-pane label="网络抓包" name="proxy">
            <el-button size="small" type="success" @click="startProxy">开始抓包</el-button>
            <el-button size="small" @click="installCert">打开浏览器</el-button>
            <strong style="color: #545c64;font-size: 14px;margin-left: 6px">
              打开浏览器后输入网址 <span
                style="color: #409EFF">{{ 'http://' + agent['host'] + ':' + agent['port'] + '/assets/download' }}</span>
              下载证书</strong>
            <strong v-if="proxyConnPort!==0"
                    style="color: #67c23a;float: right;margin-top: 5px">代理连接：{{
                agent['host'] + ':' + proxyConnPort
              }}</strong>
            <iframe v-if="proxyWebPort!==0"
                    :style="'border:1px solid #C0C4CC;;width: 100%;height: '+iFrameHeight+'px;margin-top:15px'"
                    :src="'http://'+agent['host']+':'+proxyWebPort"></iframe>
            <el-card v-else style="margin-top:20px">
              <template #header><strong>使用教学</strong></template>
              <div style="height: 300px">
                <el-steps direction="vertical" :active="3">
                  <el-step title="连接Wifi" status="process"
                           description="未连接Wifi的话，需前往Wifi列表连接你的Wifi。Wifi需要与Agent的网络互通，连接后点击刷新重新获取Wifi状态"/>
                  <el-step title="下载证书" status="process"
                           description="首次抓包需要安装证书，点击打开浏览器按钮后访问链接下载证书并安装。如浏览器无法访问，请确认Agent已关闭防火墙。"/>
                  <el-step title="安装证书" status="process"
                           description="进入手机【设置】->【通用】->【VPN与设备管理 / 描述文件与设备管理 / 设备管理 / 描述文件】->找到mitmproxy证书安装"/>
                  <el-step title="信任证书" status="process"
                           description="进入手机【设置】->【通用】->【关于本机】最下方->【证书信任设置】信任对应证书"/>
                  <el-step title="开始抓包" status="process" description="点击开始抓包后，Wifi设置手动代理，连接右上角对应的ip与端口，即可开启抓包"/>
                </el-steps>
              </div>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="Terminal" name="terminal">
            <el-tabs stretch type="border-card">
              <el-tab-pane label="Syslog">
                <el-card
                    style="border: 0px"
                    :body-style="{color:'#FFFFFF',backgroundColor:'#303133',lineHeight:'1.5'}">
                  <div style="display: flex;margin-bottom: 10px">
                    <el-input style="margin-left: 5px" size="mini" v-model="logFilter"
                              placeholder="请输入输入过滤文本">
                      <template #prepend>| grep</template>
                    </el-input>
                    <el-button size="mini" @click="getSyslog"
                               style="margin-left: 5px" type="primary">Search
                    </el-button>
                    <el-button size="mini" @click="stopSyslog"
                               style="margin-left: 5px" type="danger">Stop
                    </el-button>
                    <el-button size="mini" @click="clearLogcat"
                               style="margin-left: 5px" type="warning">Clear
                    </el-button>
                  </div>
                  <el-scrollbar noresize ref="terminalScroll" :style="'height:'+terminalHeight+'px;min-height:450px'">
                    <div v-html="l" v-for="l in logOutPut" style="white-space: pre-wrap">
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
                  <step-list :is-show-run="true" :platform="2" :is-driver-finish="isDriverFinish"
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
                              :platform="2"
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
                      <canvas id="debugPicIOS" @mousedown="touchstart"></canvas>
                    </div>
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
                        placeholder="输入class或name进行过滤"
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
                          <span style="font-size: 14px" v-if="data.detail['name']">
                            {{ node.label.substring(0, node.label.indexOf('>')) + ' ' }}
                            <span style="color: #F55781">name</span>={{
                              '"' + data.detail['name'] + '">'
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
                              label="type"
                              style="cursor: pointer"
                              @click="copy(elementDetail['type'])"
                          >
                            <span>{{ elementDetail['type'] }}</span>
                          </el-form-item>
                          <el-form-item
                              label="accessibilityId"
                              style="cursor: pointer"
                              v-if="elementDetail['name']"
                              @click="copy(elementDetail['name'])"
                          >
                            <span>{{ elementDetail['name'] }}</span>
                          </el-form-item>
                          <el-form-item label="Predicate推荐">
                            <el-table stripe empty-text="暂无推荐语法" border :data="findBestNS(elementDetail)"
                                      :show-header="false">
                              <el-table-column>
                                <template #default="scope">
                                  <div style="cursor: pointer" @click="copy(scope.row)">{{ scope.row }}</div>
                                </template>
                              </el-table-column>
                            </el-table>
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
                              label="name"
                              style="cursor: pointer"
                              @click="copy(elementDetail['name'])"
                          >
                            <span>{{ elementDetail['name'] }}</span>
                          </el-form-item>
                          <el-form-item
                              label="label"
                              style="cursor: pointer"
                              v-if="elementDetail['label']"
                              @click="copy(elementDetail['label'])"
                          >
                            <span>{{ elementDetail['label'] }}</span>
                          </el-form-item>
                          <el-form-item label="中心坐标" style="cursor: pointer"
                                        @click="copy(computedCenter(elementDetail['x'],elementDetail['y'],elementDetail['width'],elementDetail['height']))">
                            <span>{{
                                computedCenter(elementDetail['x'], elementDetail['y'], elementDetail['width'], elementDetail['height'])
                              }}</span>
                          </el-form-item>
                          <el-form-item label="index">
                            <span>{{ elementDetail['index'] }}</span>
                          </el-form-item>
                          <el-form-item label="是否可用">
                            <el-switch
                                :value="JSON.parse(elementDetail['enabled'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="是否显示">
                            <el-switch
                                :value="JSON.parse(elementDetail['visible'])"
                                disabled
                            >
                            </el-switch>
                          </el-form-item>
                          <el-form-item label="x">
                            <span>{{ elementDetail['x'] }}</span>
                          </el-form-item>
                          <el-form-item label="y">
                            <span>{{ elementDetail['y'] }}</span>
                          </el-form-item>
                          <el-form-item label="width">
                            <span>{{ elementDetail['width'] }}</span>
                          </el-form-item>
                          <el-form-item label="height">
                            <span>{{ elementDetail['height'] }}</span>
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
        </el-tabs>
      </el-col>
    </el-row>
  </el-card>
</template>
<style scoped lang="less">
#iOSpressKey {
  padding: 3px;
  width: 100%;
  margin-top: 10px;
}

#iosCap {
  border: 3px solid #303133;
  border-radius: 15px;
  cursor: url("@/assets/img/pointer.png") 12 12, crosshair;
}

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

#debugPicIOS {
  width: 100%;
  height: auto;
}

.url-install-box {
  position: relative;
  height: 100%;
}
</style>
