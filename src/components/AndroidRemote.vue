<script setup>
import {useRoute, useRouter} from "vue-router";
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useStore} from "vuex";
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const route = useRoute()
const store = useStore()
const router = useRouter()
const loading = ref(false)
const device = ref({})
const agent = ref({})
const upload = ref({apk: "", pkg: ""})
const text = ref({content: ""})
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
const img = import.meta.globEager("./../assets/img/*")
const emit = defineEmits(["sizeData"])
let websocket = null
const getImg = (name) => {
  let result;
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
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
    if (JSON.parse(message.data).msg === "size") {
      imgWidth = JSON.parse(message.data).width;
      imgHeight = JSON.parse(message.data).height;
    }
    // if (JSON.parse(message.data).msg === "statusLog") {
    //   statusLog(JSON.parse(message.data).status);
    // }
    if (JSON.parse(message.data).msg === "installFinish") {
      if (JSON.parse(message.data).status === "success") {
        ElMessage.success({
          message: "安装成功！",
        });
      } else {
        ElMessage.error({
          message: "安装失败！",
        });
      }
    }
    if (JSON.parse(message.data).msg === "openDriver") {
      loading.value = false;
      ElMessage({
        type: JSON.parse(message.data).status,
        message: JSON.parse(message.data).detail
      });
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
const pressKey = (keyNum) => {
  websocket.send(
      JSON.stringify({
        type: "keyEvent",
        detail: keyNum,
      })
  );
}
const screen = (type) => {
  websocket.send(
      JSON.stringify({
        type: "screen",
        detail: type,
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
const getDeviceById = (id) => {
  loading.value = true;
  axios
      .get("/controller/devices", {params: {id: id}}).then((res) => {
    if (res.data.code === 2000) {
      device.value = res.data.data
      if (device.value.status !== 'ONLINE') {
        ElMessage.error({
          message: "该设备暂时不可使用！",
        });
        router.replace("/Index")
        return
      }
      if (device.value.version.indexOf(".") === -1) {
        devicePlatformVersion = parseInt(
            device.value.version.replace(" ", "")
        );
      } else {
        devicePlatformVersion = parseInt(
            device.value.version.substring(0, device.value.version.indexOf("."))
        );
      }
      axios
          .get("/controller/agents", {params: {id: device.value.agentId}}).then((res) => {
        if (res.data.code === 2000) {
          agent.value = res.data.data
          openSocket(agent.value.host, agent.value.port
              , agent.value.secretKey, device.value.udId);
        }
      })
    }
  })
}
const close = async () => {
  await debugClose()
  websocket.close()
  websocket = null
}
const debugClose = () => {
  websocket.send(
      JSON.stringify({
        type: "debug",
        detail: "close",
      })
  );
}
onBeforeUnmount(() => {
  close()
})
onMounted(() => {
  getDeviceById(route.params.deviceId)
  store.commit("autoChangeCollapse");
})
</script>

<template>
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
                 element-loading-text="初始化设备中"
                 element-loading-background="rgba(255, 255, 255, 0.9)"
                 style="font-size: 14px"
                 :body-style="{
        padding: '10px',
        background: '#ccc',
        position: 'relative',
      }">
          <template #header>
            <i class="el-icon-mobile-phone"></i>
            <span style="color: #e6a23c; margin-left: 5px">{{
                device.model
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
                  <span>{{ device.model }}</span>
                </el-form-item>
                <el-form-item label="设备UDID">
                  <span>{{ device.udId }}</span>
                </el-form-item>
                <el-form-item label="设备系统">
                  <img
                      height="25"
                      style="position: absolute; top: 7px; bottom: 7px; left: 7px"
                      :src="getImg(device.platform===1?'ANDROID':'IOS')"
                  />
                </el-form-item>
                <el-form-item label="系统版本">
                  <span>{{ device.version }}</span>
                </el-form-item>
                <el-form-item label="屏幕分辨率">
                  <span>{{ device.size }}</span>
                </el-form-item>
                <el-form-item label="CPU类型">
                  <span>{{ device.cpu }}</span>
                </el-form-item>
                <el-form-item label="设备制造商">
                  <img
                      height="25"
                      style="position: absolute; top: 7px; bottom: 7px; left: 7px"
                      :src="getImg(device.manufacturer)"
                  />
                </el-form-item>
              </el-form>
              <template #reference>
          <span
              style="float: right; color: #909399; font-size: 13px"
          >
            设备信息 <i class="el-icon-info"></i>
          </span>
              </template>
            </el-popover>
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
                  icon="el-icon-menu"
                  @click="pressKey(82)"
              ></el-button>
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  icon="el-icon-copy-document"
                  @click="pressKey(187)"
              ></el-button>
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  icon="el-icon-house"
                  @click="pressKey(3)"
              ></el-button>
              <el-button
                  size="small"
                  style="width: 25%"
                  type="info"
                  icon="el-icon-back"
                  @click="pressKey(4)"
              ></el-button>
            </el-button-group>
          </div>
          <div style="position: absolute; right: 5px; top: 10px">
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
                  icon="el-icon-wallet"
              ></el-button>
              <template #dropdown>
                <el-dropdown-menu class="divider">
                  <el-button-group>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-refresh-left"
                        @click="screen('portrait')"
                    ></el-button>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-refresh"
                        @click="screen('abort')"
                    ></el-button>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-refresh-right"
                        @click="screen('landscape')"
                    ></el-button>
                  </el-button-group>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <div style="margin-top: 4px">
              <el-button
                  size="small"
                  type="info"
                  circle
                  icon="el-icon-close-notification"
                  @click="pressKey(164)"
              ></el-button>
            </div>
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
                  icon="el-icon-s-operation"
              ></el-button>
              <template #dropdown>
                <el-dropdown-menu class="divider">
                  <i class="el-icon-phone-outline" style="color: #909399"></i>
                  <el-divider direction="vertical"></el-divider>
                  <el-button-group>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-plus"
                        @click="pressKey(24)"
                    ></el-button>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-minus"
                        @click="pressKey(25)"
                    ></el-button>
                  </el-button-group>
                  <el-divider></el-divider>
                  <i class="el-icon-sunny" style="color: #909399"></i>
                  <el-divider direction="vertical"></el-divider>
                  <el-button-group>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-caret-left"
                        @click="pressKey(220)"
                    ></el-button>
                    <el-button
                        size="small"
                        type="info"
                        circle
                        icon="el-icon-caret-right"
                        @click="pressKey(221)"
                    ></el-button>
                  </el-button-group>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <div style="margin-top: 4px">
              <el-button
                  size="small"
                  type="primary"
                  circle
                  icon="el-icon-phone"
                  @click="pressKey(5)"
              ></el-button>
            </div>
            <div style="margin-top: 4px">
              <el-button
                  size="small"
                  type="primary"
                  circle
                  icon="el-icon-camera"
                  @click="pressKey(27)"
              ></el-button>
            </div>
            <div style="margin-top: 4px">
              <el-button
                  size="small"
                  type="primary"
                  circle
                  icon="el-icon-position"
                  @click="pressKey(64)"
              ></el-button>
            </div>
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
                  icon="el-icon-edit"
              ></el-button>
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
            <div style="margin-top: 4px">
              <el-button
                  size="small"
                  type="primary"
                  circle
                  icon="el-icon-switch-button"
                  @click="pressKey(26)"
              ></el-button>
            </div>
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
                  icon="el-icon-upload"
              ></el-button>
              <template #dropdown>
                <el-dropdown-menu class="divider">
                  <el-form ref="install" size="small" :model="upload">
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
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-tabs type="border-card">
          <el-tab-pane label="UI自动化">xxx</el-tab-pane>
          <el-tab-pane label="运行日志">xxx</el-tab-pane>
          <el-tab-pane label="控件元素">xxx</el-tab-pane>
          <el-tab-pane label="WebView调试" disabled>xxx</el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-card>
</template>