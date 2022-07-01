<script setup>
import {useI18n} from 'vue-i18n'
import RenderStatus from "../components/RenderStatus.vue"
import RenderDeviceName from "../components/RenderDeviceName.vue";
import axios from "../http/axios";
import {ElMessage} from "element-plus";
import ColorImg from '@/components/ColorImg.vue';
import {useRouter} from "vue-router";

const router = useRouter()
const {t: $t} = useI18n()
const img = import.meta.globEager("./../assets/img/*")
const props = defineProps({
  device: Object,
  agentList: Array,
  detail: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['flush'])
const upload = (content) => {
  let formData = new FormData();
  formData.append("file", content.file);
  formData.append("type", 'keepFiles');
  axios
      .post("/folder/upload", formData, {headers: {"Content-type": "multipart/form-data"}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          updateImg(content.data.id, resp.data)
        }
      });
}
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith(".jpg") || file.name.endsWith(".png")) {
    return true;
  } else {
    ElMessage.error({
      message: $t('dialog.suffixError'),
    });
    return false;
  }
}
const updateImg = (id, imgUrl) => {
  axios
      .put("/controller/devices/updateImg", {id, imgUrl})
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit("flush");
        }
      });
}
const saveDetail = (device) => {
  axios
      .put("/controller/devices/saveDetail", {
        id: device.id, password: device.password,
        nickName: device.nickName
      }).then((resp) => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
}
const deleteDevice = (id) => {
  axios
      .delete("/controller/devices", {params: {id}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit("flush");
        }
      });
}
const jump = (id, platform) => {
  if (platform === 1) {
    router.push({
      path: "AndroidRemote/" + id
    });
  } else {
    router.push({
      path: "IOSRemote/" + id
    });
  }
}
const reboot = (id) => {
  axios
      .get("/transport/exchange/reboot", {params: {id: id}}).then((resp) => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
    }
  })
}
const getPhoneImg = (name, url) => {
  let result;
  if (url === null || !url || (url && url.length === 0)) {
    result = img['./../assets/img/default.png'].default
  } else {
    result = url;
  }
  return result;
}
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  if (name === 'LENOVO') {
    name = 'Lenovo'
  }
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const findAgentById = (id) => {
  let result = $t('form.unknown')
  for (let i in props.agentList) {
    if (props.agentList[i].id === id) {
      result = props.agentList[i].name
      break
    }
  }
  return result
}
</script>
<template>
  <el-card
      shadow="hover"
      :body-style="{ padding: '15px 20px 15px 10px' }"
      class="device-card"
  >
    <template #header>
      <RenderDeviceName :device="device"></RenderDeviceName>
      <RenderStatus :status="device.status" :user="device.user"></RenderStatus>
    </template>
    <el-row>
      <el-col :span="10">
        <div style="text-align: center">
          <el-image
              style="height: 160px"
              fit="contain"
              :src="getPhoneImg(device.model,device['imgUrl'])"
              :preview-src-list="[getPhoneImg(device.model,device['imgUrl'])]"
              hide-on-click-modal
          />
        </div>
      </el-col>
      <el-col :span="14">
        <el-form
            label-position="left"
            class="device-form"
            label-width="70px"
            style="margin: 0 0 15px 10px"
        >
          <el-form-item v-if="!detail" :label="$t('devices.form.model')">
            <div>{{ device.model }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('devices.form.manufacturer')">
            <img
                v-if="device.manufacturer === 'HUAWEI' || device.manufacturer === 'samsung' || device.manufacturer === 'OnePlus'||device.manufacturer === 'GIONEE'|| device.manufacturer === 'motorola'|| device.manufacturer === 'HONOR'"
                style="width: 80px"
                :src="getImg(device.manufacturer)"
            />
            <img
                v-else-if="device.manufacturer === 'Xiaomi' ||device.manufacturer === 'LGE'||device.manufacturer === 'HTC'||device.manufacturer === 'deltainno'"
                style="width: 30px"
                :src="getImg(device.manufacturer)"
            />
            <img
                v-else-if="device.manufacturer === 'blackshark' ||device.manufacturer === 'APPLE'"
                style="width: 22px"
                :src="getImg(device.manufacturer)"
            />
            <img
                v-else
                style="width: 70px"
                :src="getImg(device.manufacturer)"
            />

          </el-form-item>
          <el-form-item :label="$t('devices.form.system')">
            <img
                v-if="device.platform===1"
                style="width: 30px"
                :src="getImg('ANDROID')"
            />
            <img
                v-if="device.platform===2"
                style="width: 22px"
                :src="getImg('IOS')"
            />
            <span style="margin-left: 6px">{{ device.version }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.form.battery.level')">
            <div :style="'position: relative; display: flex;align-items: center;color:'+((device['level'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))?'#606266':
                      device['level']<=30?'#F56C6C':(device['level']<=70?'#E6A23C':'#67C23A'))">
              <ColorImg
                  style="margin-right:5px;"
                  v-if="(device['level'] !== 0 &&
                              (device.status === 'ONLINE' || device.status === 'DEBUGGING' || device.status === 'TESTING'))"
                  :src="device['level'] <=25?img['./../assets/img/powerLow.png'].default
                            :(device['level'] <=50?img['./../assets/img/powerMid.png'].default
                            :(device['level'] <=75?img['./../assets/img/powerHigh.png'].default
                            :img['./../assets/img/powerFull.png'].default))"
                  :width="20"
                  :height="20"
                  :color="(device['level']===0?'#606266':
                      device['level']<=30?'#F56C6C':(device['level']<=70?'#E6A23C':'#67C23A'))"
              />
              {{
                (device['level'] === 0 ||
                    (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))
                    ? $t('form.unknown') : device['level']
              }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('devices.form.battery.temperature')">
            <div :style="'position: relative; display: flex;align-items: center;color:'+((device['temperature'] === 0 ||
                              (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))?'#606266':
                      device['temperature']<300?'#67C23A':(device['temperature']<350?'#E6A23C':'#F56C6C'))">
              <ColorImg
                  style="margin-left:-4px;margin-right:3px"
                  v-if="(device['temperature'] !== 0 &&
                              (device.status === 'ONLINE' || device.status === 'DEBUGGING' || device.status === 'TESTING'))"
                  :src="img['./../assets/img/tem.png'].default"
                  :width="20"
                  :height="20"
                  :color="(device['temperature']===0?'#606266':
                      device['temperature']<300?'#67C23A':(device['temperature']<350?'#E6A23C':'#F56C6C'))"
              />
              {{
                (device['temperature'] === 0 ||
                    (device.status !== 'ONLINE' && device.status !== 'DEBUGGING' && device.status !== 'TESTING'))
                    ? $t('form.unknown') : (device['temperature'] / 10).toFixed(1) + " ℃"
              }}
            </div>
          </el-form-item>
          <div v-if="detail">
            <el-form-item label="电流档位">
              <div>{{ device.gear }}</div>
            </el-form-item>
            <el-form-item label="Hub接口">
              <div>{{ device.position }}</div>
            </el-form-item>
          </div>
          <el-form-item v-else :label="$t('devices.form.agent')">
            <div>{{ findAgentById(device.agentId) }}</div>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <div style="text-align: center">
      <el-button type="primary" size="mini" :disabled="device.status!=='ONLINE'"
                 @click="jump(device.id,device.platform)">{{ $t('devices.useRightNow') }}
      </el-button>
      <el-popover placement="top" width="340px" trigger="hover">
        <el-form
            label-position="left"
            class="demo-table-expand"
            label-width="90px"
            style="margin-left: 10px; word-break: break-all"
            v-if="device.id"
        >
          <el-form-item :label="$t('devices.detail.image')">
            <el-upload
                style="width: 30px"
                :data="{id:device.id}"
                action=""
                :with-credentials="true"
                :before-upload="beforeAvatarUpload"
                :http-request="upload"
                :show-file-list="false"
            >
              <el-button
                  type="primary"
                  size="mini">{{ $t('devices.detail.uploadImg') }}
              </el-button
              >
            </el-upload>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.nickName')">
            <el-input
                show-word-limit
                v-model="device['nickName']"
                type="text"
                size="mini"
                :placeholder="$t('devices.detail.nickPlaceholder')"
                maxlength="30"
                style="position: absolute; top: 7px; bottom: 7px"
            >
              <template #append>
                <el-button
                    size="mini"
                    @click="saveDetail(device)"
                >{{ $t('form.save') }}
                </el-button
                >
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.name')">
            <span>{{ device.name }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.model')">
            <span>{{ device.model }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.udId')">
            <span>{{ device.udId }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.size')">
            <span>{{ device.size }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.cpu')">
            <span>{{ device.cpu }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.pwd')">
            <el-input
                show-word-limit
                v-model="device.password"
                type="text"
                size="mini"
                :placeholder="$t('devices.detail.pwdPlaceholder')"
                maxlength="30"
                style="position: absolute; top: 7px; bottom: 7px"
            >
              <template #append>
                <el-button
                    size="mini"
                    @click="saveDetail(device)"
                >{{ $t('form.save') }}
                </el-button
                >
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.operation')">
            <el-popconfirm
                placement="top"
                :confirmButtonText="$t('form.confirm')"
                :cancelButtonText="$t('form.cancel')"
                @confirm="reboot(device.id)"
                icon="el-icon-warning"
                iconColor="red"
                :title="$t('devices.detail.rebootTips')"
            >
              <template #reference>
                <el-button
                    type="danger"
                    size="mini"
                    :disabled="device.status !== 'ONLINE'
                          &&device.status !== 'DEBUGGING'
                          &&device.status !== 'TESTING'
                           &&device.status !== 'ERROR'"
                >{{ $t('devices.detail.reboot') }}
                </el-button
                >
              </template>
            </el-popconfirm>
            <el-popconfirm
                placement="top"
                :confirmButtonText="$t('form.confirm')"
                :cancelButtonText="$t('form.cancel')"
                @confirm="deleteDevice(device.id)"
                icon="el-icon-warning"
                iconColor="red"
                :title="$t('devices.detail.deleteTips')"
            >
              <template #reference>
                <el-button
                    type="danger"
                    size="mini"
                    :disabled="device.status === 'ONLINE'
                          &&device.status === 'DEBUGGING'
                          &&device.status === 'TESTING'"
                >{{ $t('common.delete') }}
                </el-button
                >
              </template>
            </el-popconfirm>
          </el-form-item>
        </el-form>
        <template #reference>
          <el-button size="mini">{{ $t('devices.moreDetail') }}</el-button>
        </template>
      </el-popover>
    </div>
  </el-card>
</template>