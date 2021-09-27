<script setup>
import {useRoute, useRouter} from "vue-router";
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import useClipboard from 'vue-clipboard3';
import StepList from '../components/StepList.vue'
import TestCaseList from '../components/TestCaseList.vue'
import StepLog from '../components/StepLog.vue'
import ElementUpdate from '../components/ElementUpdate.vue'
import {
  Download,
  Search,
  UploadFilled,
  SwitchButton,
  Edit,
  Position,
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
  InfoFilled
} from "@element-plus/icons";

const {toClipboard} = useClipboard();
const route = useRoute()
const store = useStore()
const router = useRouter()
const loading = ref(false)
const device = ref({})
const agent = ref({})
const upload = ref({apk: "", pkg: ""})
const text = ref({content: ""})
const installFrom = ref(null)
let imgWidth = 0
let imgHeight = 0
let moveX = 0
let moveY = 0
let devicePlatformVersion = 0
let isPress = true
let loop = null
let time = 0
let isLongPress = false
let mouseMoveTime = 0
const pic = ref("中");
const elementLoading = ref(false)
const isShowImg = ref(false)
const isDriverFinish = ref(false)
const imgUrl = ref("")
const activity = ref("")
const webViewData = ref([])
const isShowTree = ref(false)
const elementData = ref([])
const elementDetail = ref(null)
const elementScreenLoading = ref(false)
const tree = ref(null)
const currentId = ref([])
const filterText = ref("")
const project = ref(null)
const testCase = ref({})
const activeTab = ref('case')
const stepLog = ref([])
const debugLoading = ref(false)
const dialogElement = ref(false)
const dialogImgElement = ref(false)
const imgElementUrl = ref(null)
const updateImgEle = ref(null)
const element = ref({
  id: null,
  eleName: "",
  eleType: "image",
  eleValue: "",
  projectId: 0
})
const img = import.meta.globEager("./../assets/img/*")
let websocket = null;
const saveEle = () => {
  updateImgEle['value'].validate((valid) => {
    if (valid) {
      element.value.eleValue = imgElementUrl.value;
      element.value.projectId = project.value['id']
      axios.put("/controller/elements", element.value)
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
}
const selectCase = (val) => {
  ElMessage.success({
    message: "关联成功！"
  })
  testCase.value = val
}
const removeCase = () => {
  testCase.value = {};
}
const getImg = (name) => {
  let result;
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
watch(filterText, (newValue, oldValue) => {
  tree['value'].filter(newValue);
})
const filterNode = (value, data) => {
  if (!value) return true;
  return (data.label.indexOf(value) !== -1) ||
      (data.detail['resource-id'] ? data.detail['resource-id'].indexOf(value) !== -1 : false);
}
const downloadImg = () => {
  window.open(imgUrl.value, "_blank");
}
const copy = (value) => {
  try {
    toClipboard(value);
    ElMessage.success({
      message: "复制成功！",
    });
  } catch (e) {
    ElMessage.error({
      message: "复制失败！",
    });
  }
}
const setImgData = (data) => {
  const img = new Image();
  imgUrl.value = data;
  img.src = data;
  const canvas = document.getElementById("debugPic"),
      g = canvas.getContext("2d");
  const parent = canvas.parentNode;
  img.onload = function () {
    const per = img.height / img.width;
    const width = parseInt(parent.offsetWidth);
    const height = parseInt(width * per);
    canvas.width = width;
    canvas.height = height;
  };
  isShowImg.value = true;
}
const openSocket = (host, port, udId, key) => {
  if ("WebSocket" in window) {
    websocket = new WebSocket(
        "ws://" + host + ":" + port + "/websockets/android/" + udId + "/" + key
    );
  } else {
    console.error("不支持WebSocket");
  }
  websocket.onmessage = websocketOnmessage;
  websocket.onclose = (e) => {
  };
}
const websocketOnmessage = (message) => {
  if (typeof message.data === "object") {
    const blob = new Blob([message.data], {type: "image/jpeg"});
    const URL = window.URL || window.webkitURL;
    const img = new Image();
    const canvas = document.getElementById("canvas"),
        g = canvas.getContext("2d");
    const brother = document.getElementById("pressKey");
    img.onload = function () {
      const per = img.height / img.width;
      const width = parseInt(brother.offsetWidth) - 2;
      const height = parseInt(width * per);
      canvas.width = width;
      canvas.height = height;
      g.drawImage(img, 0, 0, width, height);
    };
    const u = URL.createObjectURL(blob);
    img.src = u;
  } else {
    switch (JSON.parse(message.data)['msg']) {
      case "size": {
        imgWidth = JSON.parse(message.data).width;
        imgHeight = JSON.parse(message.data).height;
        break
      }
      case "tree": {
        ElMessage.success({
          message: "获取控件元素成功！",
        });
        currentId.value = [1]
        elementData.value = JSON.parse(message.data).detail;
        isShowTree.value = true;
        elementLoading.value = false
        setImgData(JSON.parse(message.data).img)
        webViewData.value = JSON.parse(message.data)['webView']
        activity.value = JSON.parse(message.data)['activity']
        break
      }
      case "treeFail": {
        ElMessage.error({
          message: "获取控件元素失败！请重新获取"
        });
        elementLoading.value = false
        break
      }
      case "installFinish": {
        if (JSON.parse(message.data).status === "success") {
          ElMessage.success({
            message: "安装成功！",
          });
        } else {
          ElMessage.error({
            message: "安装失败！",
          });
        }
        break
      }
      case "openDriver": {
        loading.value = false;
        ElMessage({
          type: JSON.parse(message.data).status,
          message: JSON.parse(message.data).detail
        });
        if (JSON.parse(message.data).status === 'success') {
          isDriverFinish.value = true;
        }
        break
      }
      case "picFinish": {
        loading.value = false;
        break
      }
      case "step": {
        setStepLog(JSON.parse(message.data))
        break
      }
      case "status": {
        debugLoading.value = false
        ElMessage.info({
          message: '运行完毕！',
        })
        break
      }
      case "eleScreen": {
        if (JSON.parse(message.data).img) {
          ElMessage.success({
            message: "获取快照成功！",
          });
          imgElementUrl.value = JSON.parse(message.data)['img'];
          dialogImgElement.value = true;
        } else {
          ElMessage.error(JSON.parse(message.data)['errMsg']);
        }
        elementScreenLoading.value = false;
        break
      }
      case "error": {
        ElMessage.error({
          message: "系统出现异常！已断开远程控制！",
        });
        close()
        router.go(-1)
        break
      }
    }
  }
}
const mouseup = (event) => {
  if (devicePlatformVersion < 9) {
    if (isPress === true) {
      isPress = false;
      websocket.send(
          JSON.stringify({
            type: "touch",
            detail: "u 0\n",
          })
      );
    }
  } else {
    clearInterval(loop);
    time = 0;
    const canvas = document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    const x = parseInt(
        (event.clientX - rect.left * (canvas.width / rect.width)) *
        (imgWidth / rect.width)
    );
    const y = parseInt(
        (event.clientY - rect.top * (canvas.height / rect.height)) *
        (imgHeight / rect.height)
    );
    if (moveX === x && moveY === y) {
      if (isLongPress === false) {
        websocket.send(
            JSON.stringify({
              type: "debug",
              detail: "tap",
              point: x + "," + y,
            })
        );
      }
    } else {
      websocket.send(
          JSON.stringify({
            type: "debug",
            detail: "swipe",
            pointA: moveX + "," + moveY,
            pointB: x + "," + y,
          })
      );
    }
    isLongPress = false;
  }
}
const mouseleave = () => {
  if (devicePlatformVersion >= 9) {
    clearInterval(loop);
    isLongPress = false;
  } else {
    if (isPress === true) {
      isPress = false;
      websocket.send(
          JSON.stringify({
            type: "touch",
            detail: "u 0\n",
          })
      );
    }
  }
}
const mousedown = (event) => {
  const canvas = document.getElementById("canvas");
  const rect = canvas.getBoundingClientRect();
  if (devicePlatformVersion < 9) {
    const x = parseInt(
        (event.clientX - rect.left * (canvas.width / rect.width)) *
        (imgWidth / rect.width)
    );
    const y = parseInt(
        (event.clientY - rect.top * (canvas.height / rect.height)) *
        (imgHeight / rect.height)
    );
    isPress = true;
    websocket.send(
        JSON.stringify({
          type: "touch",
          detail: "d 0 " + x + " " + y + " 50\n",
        })
    );
  } else {
    moveX = parseInt(
        (event.clientX - rect.left * (canvas.width / rect.width)) *
        (imgWidth / rect.width)
    );
    moveY = parseInt(
        (event.clientY - rect.top * (canvas.height / rect.height)) *
        (imgHeight / rect.height)
    );
    clearInterval(loop);
    loop = setInterval(() => {
      time += 500;
      if (time >= 1000 && isLongPress === false) {
        websocket.send(
            JSON.stringify({
              type: "debug",
              detail: "longPress",
              point: moveX + "," + moveY,
            })
        );
        isLongPress = true;
      }
    }, 500);
  }
}
const mousemove = (event) => {
  if (devicePlatformVersion < 9) {
    if (isPress === true) {
      if (mouseMoveTime < 5) {
        mouseMoveTime++;
        return;
      } else {
        const canvas = document.getElementById("canvas");
        const rect = canvas.getBoundingClientRect();
        const x = parseInt(
            (event.clientX - rect.left * (canvas.width / rect.width)) *
            (imgWidth / rect.width)
        );
        const y = parseInt(
            (event.clientY - rect.top * (canvas.height / rect.height)) *
            (imgHeight / rect.height)
        );
        websocket.send(
            JSON.stringify({
              type: "touch",
              detail: "m 0 " + x + " " + y + " 50\n",
            })
        );
        mouseMoveTime = 0;
      }
    }
  }
}
const touchstart = async (event) => {
  const debugPic = document.getElementById("debugPic");
  const rect = debugPic.getBoundingClientRect();
  const x = parseInt(
      (event.clientX - rect.left * (debugPic.width / rect.width)) *
      (imgWidth / rect.width)
  );
  const y = parseInt(
      (event.clientY - rect.top * (debugPic.height / rect.height)) *
      (imgHeight / rect.height)
  );
  await nextTick(() => {
    tree['value'].setCurrentKey(
        findMinSize(findElementByPoint(elementData.value, x, y))
    );
  });
  await handleNodeClick(tree['value'].getCurrentNode());
}
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
}
const findElementByPoint = (ele, x, y) => {
  let result = [];
  for (let i in ele) {
    const eleStartX = ele[i].detail['bStart'].substring(
        0,
        ele[i].detail['bStart'].indexOf(",")
    );
    const eleStartY = ele[i].detail['bStart'].substring(
        ele[i].detail['bStart'].indexOf(",") + 1
    );
    const eleEndX = ele[i].detail['bEnd'].substring(
        0,
        ele[i].detail['bEnd'].indexOf(",")
    );
    const eleEndY = ele[i].detail['bEnd'].substring(
        ele[i].detail['bEnd'].indexOf(",") + 1
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
}
const handleNodeClick = (data) => {
  if (data !== null) {
    elementDetail.value = data.detail;
    print(data);
  }
}
const print = (data) => {
  const canvas = document.getElementById("debugPic"),
      g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  const eleStartX = data.detail['bStart'].substring(
      0,
      data.detail['bStart'].indexOf(",")
  );
  const eleStartY = data.detail['bStart'].substring(
      data.detail['bStart'].indexOf(",") + 1
  );
  const eleEndX = data.detail['bEnd'].substring(
      0,
      data.detail['bEnd'].indexOf(",")
  );
  const eleEndY = data.detail['bEnd'].substring(
      data.detail['bEnd'].indexOf(",") + 1
  );
  let a = Math.round(Math.random() * 255);
  let b = Math.round(Math.random() * 255);
  let c = Math.round(Math.random() * 255);
  g.fillStyle = "rgba(" + a + ", " + b + ", " + c + ", 0.6)";
  g.fillRect(
      eleStartX * (canvas.width / imgWidth),
      eleStartY * (canvas.height / imgHeight),
      (eleEndX - eleStartX) * (canvas.width / imgWidth),
      (eleEndY - eleStartY) * (canvas.height / imgHeight)
  );
}
const getEleScreen = (xpath) => {
  elementScreenLoading.value = true
  websocket.send(
      JSON.stringify({
        type: "debug",
        detail: "eleScreen",
        xpath,
      })
  );
}
const clearLog = () => {
  stepLog.value = [];
}
const setStepLog = (data) => {
  stepLog.value.push(data);
}
const runStep = () => {
  debugLoading.value = true
  activeTab.value = 'log'
  websocket.send(
      JSON.stringify({
        type: "debug",
        detail: "runStep",
        caseId: testCase.value['id'],
        pwd: device.value['password']
      })
  );
}
const pressKey = (keyNum) => {
  websocket.send(
      JSON.stringify({
        type: "keyEvent",
        detail: keyNum,
      })
  );
}
const changePic = (type) => {
  loading.value = true
  let pic;
  switch (type) {
    case "低":
      pic = "low";
      break;
    case "中":
      pic = "middle";
      break;
    case "高":
      pic = "high";
      break;
  }
  websocket.send(
      JSON.stringify({
        type: "pic",
        detail: pic,
      })
  );
}
const screen = (type, p) => {
  if (p !== 'abort') {
    loading.value = true
  }
  let pic;
  switch (type) {
    case "低":
      pic = "low";
      break;
    case "中":
      pic = "middle";
      break;
    case "高":
      pic = "high";
      break;
  }
  websocket.send(
      JSON.stringify({
        type: "screen",
        s: p,
        detail: pic
      })
  );
}
const sendText = (text) => {
  websocket.send(
      JSON.stringify({
        type: "text",
        detail: text,
      })
  );
}
const install = (apk, pkg) => {
  installFrom['value'].validate((valid) => {
    if (valid) {
      websocket.send(
          JSON.stringify({
            type: "debug",
            detail: "install",
            apk,
            pkg,
          })
      );
      ElMessage.success({
        message: "开始安装！请稍后...",
      });
    }
  });
}
const getElement = () => {
  elementLoading.value = true;
  websocket.send(
      JSON.stringify({
        type: "debug",
        detail: "tree",
      })
  );
}
const close = () => {
  if (websocket !== null) {
    websocket.close()
    websocket = null
  }
}
onBeforeUnmount(() => {
  close()
})
const getDeviceById = (id) => {
  loading.value = true;
  axios
      .get("/controller/devices", {params: {id: id}}).then((resp) => {
    if (resp['code'] === 2000) {
      device.value = resp.data
      if (device.value['status'] !== 'ONLINE') {
        ElMessage.error({
          message: "该设备暂时不可使用！",
        });
        router.replace("/Index")
        return
      }
      if (device.value['version'].indexOf(".") === -1) {
        devicePlatformVersion = parseInt(
            device.value['version'].replace(" ", "")
        );
      } else {
        devicePlatformVersion = parseInt(
            device.value['version'].substring(0, device.value['version'].indexOf("."))
        );
      }
      axios
          .get("/controller/agents", {params: {id: device.value['agentId']}}).then((resp) => {
        if (resp['code'] === 2000) {
          agent.value = resp.data
          openSocket(agent.value['host'], agent.value['port']
              , agent.value['secretKey'], device.value['udId']);
        }
      })
    }
  })
}
onMounted(() => {
  if (store.state.project.id) {
    project.value = store.state.project
  }
  getDeviceById(route.params.deviceId)
  store.commit("autoChangeCollapse");
})
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
  <el-card>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card v-loading="loading"
                 element-loading-text="准备图像中..."
                 element-loading-background="rgba(255, 255, 255, 1)"
                 style="font-size: 14px"
                 :body-style="{ padding: '10px', background: '#ccc', position: 'relative',minHeight: '340px' }">
          <template #header>
            <div style="position: relative; display: flex;align-items: center;">
              <el-icon :size="14" style="vertical-align: middle;">
                <Cellphone/>
              </el-icon>
              <span style="color: #e6a23c; margin-left: 5px">{{
                  device['model']
                }}</span>
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
                  <el-form-item label="设备UDID">
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
          <div style="margin-right: 40px">
            <canvas
                id="canvas"
                @mouseup="mouseup"
                @mousemove="mousemove"
                @mousedown="mousedown"
                @mouseleave="mouseleave"
            ></canvas>
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
                content="画质帧数"
                placement="right"
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
                      <el-radio-group v-loading="loading" v-model="pic" size="mini" @change="changePic">
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
                content="设备转向"
                placement="right"
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
                      <Wallet/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider" v-loading="loading"
                                      element-loading-background="rgba(255, 255, 255, 1)">
                      <el-button-group>
                        <el-tooltip
                            effect="dark"
                            content="左转90度"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="screen(pic,'sub')"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <RefreshLeft/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            content="取消自动旋转"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="screen(pic,'abort')"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <Refresh/>
                            </el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip
                            effect="dark"
                            content="右转90度"
                            placement="top"
                        >
                          <el-button
                              size="small"
                              type="info"
                              circle
                              @click="screen(pic,'add')"
                          >
                            <el-icon :size="14" style="vertical-align: middle;">
                              <RefreshRight/>
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
                content="亮度/音量"
                placement="right"
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
                placement="right"
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
                placement="right"
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
                placement="right"
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
                :enterable="false"
                effect="dark"
                content="发送文本"
                placement="right"
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
                      <Edit/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-form size="small" :model="text">
                        <el-form-item
                        >
                          <el-input
                              clearable
                              v-model="text.content"
                              size="small"
                              placeholder="请输入要发送的文本"
                          ></el-input>
                        </el-form-item>
                      </el-form>
                      <div style="text-align: center;">
                        <el-button
                            size="mini"
                            type="primary"
                            @click="sendText(text.content)"
                        >发送
                        </el-button
                        >
                      </div>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
            <el-tooltip
                effect="dark"
                content="锁定/解锁屏幕"
                placement="right"
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
            <el-tooltip
                :enterable="false"
                effect="dark"
                content="安装apk"
                placement="right"
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
                      type="success"
                      circle
                  >
                    <el-icon :size="12" style="vertical-align: middle;">
                      <UploadFilled/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu class="divider">
                      <el-form ref="installFrom" size="small" :model="upload">
                        <el-form-item
                            prop="pkg"
                            :rules="{
                      required: true,
                      message: '包名不能为空',
                      trigger: 'blur',
                    }"
                        >
                          <el-input
                              v-model="upload.pkg"
                              size="small"
                              placeholder="请输入app包名"
                          ></el-input>
                        </el-form-item>
                        <el-form-item
                            prop="apk"
                            :rules="{
                      required: true,
                      message: 'apk下载链接不能为空',
                      trigger: 'blur',
                    }"
                        >
                          <el-input
                              v-model="upload.apk"
                              size="small"
                              placeholder="请输入apk下载链接"
                          ></el-input>
                        </el-form-item>
                      </el-form>
                      <div style="text-align: center;">
                        <el-button
                            size="mini"
                            type="primary"
                            @click="install(upload.apk, upload.pkg)"
                        >开始安装
                        </el-button
                        >
                      </div>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-tooltip>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-tabs type="border-card" v-model="activeTab">
          <el-tab-pane label="用例详情" name="case">
            <div v-if="!testCase['id']">
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
                        :src="item['projectImg']"
                        shape="square"
                    ></el-avatar
                    >
                    {{ item['projectName'] }}
                  </div>
                </el-option>
              </el-select>
              <el-button size="mini" type="primary" style="position: absolute;right: 20px">新增用例</el-button>
                <test-case-list v-if="project!==null"
                                :project-id="project['id']"
                                :platform="1"
                                :is-read-only="true"
                                @select-case="selectCase"></test-case-list>
            </div>
            <div v-else>
              <el-descriptions title="用例详情" :column="2" size="medium" border>
                <el-descriptions-item width="100px" label="用例Id">{{ testCase['id'] }}</el-descriptions-item>
                <el-descriptions-item width="100px" label="用例名称">{{ testCase.name }}</el-descriptions-item>
                <el-descriptions-item label="所属项目">
                  <div style=" display: flex;align-items: center;">
                    <el-avatar
                        style="margin-right: 10px"
                        :size="27"
                        :src="project['projectImg']"
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
                <template #extra>
                  <el-button type="danger" size="mini" @click="removeCase">取消关联</el-button>
                </template>
              </el-descriptions>
            </div>
          </el-tab-pane>
          <el-tab-pane label="UI自动化" name="step">
            <div v-if="testCase['id']">
              <step-list :is-driver-finish="isDriverFinish" :case-id="testCase['id']" :project-id="project['id']"
                         @runStep="runStep"/>
            </div>
            <el-card style="height: 100%" v-else>
              <el-result icon="info" title="提示" subTitle="该功能需要先关联测试用例">
                <template #extra>
                  <el-button type="primary" size="mini" @click="activeTab = 'case'">马上关联</el-button>
                </template>
              </el-result>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="运行日志" name="log">
            <step-log :debug-loading="debugLoading" :step-log="stepLog" @clearLog="clearLog"></step-log>
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
                      ');background-size:cover;'
                    "
                    >
                      <canvas id="debugPic" @mousedown="touchstart"></canvas>
                    </div>
                    <div style="text-align: center;margin-top: 10px">
                      <el-button type="primary" plain size="mini" @click="downloadImg">
                        <el-icon :size="12" style="vertical-align: middle;">
                          <Download/>
                        </el-icon>
                        保存图片
                      </el-button>
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
                            {{ node.label.substring(0, node.label.indexOf('>')) + " " }}
                            <span style="color: #F55781">resource-id</span>={{
                              "\"" + data.detail['resource-id'] + "\">"
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
                          <el-form-item label="xpath">
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
              <el-result icon="info" title="提示" subTitle="请先获取控件元素">
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
          <el-tab-pane label="WebView调试(暂不开放)" name="webview" disabled>xxx</el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-card>
</template>