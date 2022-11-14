<script setup>
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import ColorImg from '@/components/ColorImg.vue';
import { useRouter } from 'vue-router';
import RenderStatus from './RenderStatus.vue';
import RenderDeviceName from './RenderDeviceName.vue';
import axios from '../http/axios';

const router = useRouter();
const { t: $t } = useI18n();
const img = import.meta.globEager('./../assets/img/*');
const props = defineProps({
  device: Object,
  agentList: Array,
  detail: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['flush']);
const upload = (content) => {
  const formData = new FormData();
  formData.append('file', content.file);
  formData.append('type', 'keepFiles');
  axios
    .post('/folder/upload', formData, {
      headers: { 'Content-type': 'multipart/form-data' },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        updateImg(content.data.id, resp.data);
      }
    });
};
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
    return true;
  }
  ElMessage.error({
    message: $t('dialog.suffixError'),
  });
  return false;
};
const updateImg = (id, imgUrl) => {
  axios.put('/controller/devices/updateImg', { id, imgUrl }).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
      emit('flush');
    }
  });
};
const saveDetail = (device) => {
  axios
    .put('/controller/devices/saveDetail', {
      id: device.id,
      password: device.password,
      nickName: device.nickName,
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
      }
    });
};
const deleteDevice = (id) => {
  axios.delete('/controller/devices', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
      emit('flush');
    }
  });
};
const jump = (id, platform) => {
  let routeData;
  if (platform === 1) {
    routeData = router.resolve({
      path: `/AndroidRemote/${id}`,
    });
  } else {
    routeData = router.resolve({
      path: `/IOSRemote/${id}`,
    });
  }
  window.open(routeData.href, '_blank');
};
const reboot = (id) => {
  axios.get('/transport/exchange/reboot', { params: { id } }).then((resp) => {
    if (resp.code === 2000) {
      ElMessage.success({
        message: resp.message,
      });
    }
  });
};
const getPhoneImg = (name, url) => {
  let result;
  if (url === null || !url || (url && url.length === 0)) {
    result = img['./../assets/img/default.png'].default;
  } else {
    result = url;
  }
  return result;
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
    result = img[`./../assets/img/${name}.jpg`].default;
  } catch {
    result = img['./../assets/img/unName.jpg'].default;
  }
  return result;
};
const findAgentById = (id) => {
  let result = $t('form.unknown');
  for (const i in props.agentList) {
    if (props.agentList[i].id === id) {
      result = props.agentList[i].name;
      break;
    }
  }
  return result;
};
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
            :src="getPhoneImg(device.model, device['imgUrl'])"
            :preview-src-list="[getPhoneImg(device.model, device['imgUrl'])]"
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
            <div>{{ device.model }}</div>
          </el-form-item>
          <el-form-item :label="$t('devices.form.manufacturer')">
            <img
              v-if="
                device.manufacturer === 'HUAWEI' ||
                device.manufacturer === 'samsung' ||
                device.manufacturer === 'OnePlus' ||
                device.manufacturer === 'GIONEE' ||
                device.manufacturer === 'motorola' ||
                device.manufacturer === 'HONOR'
              "
              style="width: 80px"
              :src="getImg(device.manufacturer)"
            />
            <img
              v-else-if="
                device.manufacturer === 'Xiaomi' ||
                device.manufacturer === 'LGE' ||
                device.manufacturer === 'HTC' ||
                device.manufacturer === 'deltainno'
              "
              style="width: 30px"
              :src="getImg(device.manufacturer)"
            />
            <img
              v-else-if="
                device.manufacturer === 'blackshark' ||
                device.manufacturer === 'APPLE'
              "
              style="width: 22px"
              :src="getImg(device.manufacturer)"
            />
            <img
              v-else-if="
                getImg(device.manufacturer) ==
                img['./../assets/img/unName.jpg'].default
              "
              style="width: 30px"
              :src="getImg(device.manufacturer)"
            />
            <img
              v-else
              style="width: 70px"
              :src="getImg(device.manufacturer)"
            />
          </el-form-item>
          <el-form-item :label="$t('devices.form.system')">
            <span v-if="device.platform === 1">
              <img
                v-if="device['isHm'] === 0"
                style="width: 30px"
                :src="getImg('ANDROID')"
              />
              <img
                v-if="device['isHm'] === 1"
                style="width: 22px"
                :src="getImg('HarmonyOs')"
              />
            </span>
            <img
              v-if="device.platform === 2"
              style="width: 22px"
              :src="getImg('IOS')"
            />
            <span style="margin-left: 6px">{{ device.version }}</span>
          </el-form-item>
          <el-form-item :label="$t('devices.form.battery.level')">
            <div
              :style="{
                position: 'relative',
                display: 'flex',
                'align-items': 'center',
                color:
                  device['level'] === 0 ||
                  (device.status !== 'ONLINE' &&
                    device.status !== 'DEBUGGING' &&
                    device.status !== 'TESTING')
                    ? '#606266'
                    : device['level'] <= 30
                    ? '#F56C6C'
                    : device['level'] <= 70
                    ? '#E6A23C'
                    : '#67C23A',
              }"
            >
              <ColorImg
                v-if="
                  device['level'] !== 0 &&
                  (device.status === 'ONLINE' ||
                    device.status === 'DEBUGGING' ||
                    device.status === 'TESTING')
                "
                style="margin-right: 5px"
                :src="
                  device['level'] <= 25
                    ? img['./../assets/img/powerLow.png'].default
                    : device['level'] <= 50
                    ? img['./../assets/img/powerMid.png'].default
                    : device['level'] <= 75
                    ? img['./../assets/img/powerHigh.png'].default
                    : img['./../assets/img/powerFull.png'].default
                "
                :width="20"
                :height="20"
                :color="
                  device['level'] === 0
                    ? '#606266'
                    : device['level'] <= 30
                    ? '#F56C6C'
                    : device['level'] <= 70
                    ? '#E6A23C'
                    : '#67C23A'
                "
              />
              {{
                device['level'] === 0 ||
                (device.status !== 'ONLINE' &&
                  device.status !== 'DEBUGGING' &&
                  device.status !== 'TESTING')
                  ? $t('form.unknown')
                  : device['level']
              }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('devices.form.battery.temperature')">
            <div
              :style="{
                position: 'relative',
                display: 'flex',
                'align-items': 'center',
                color:
                  device.status !== 'ONLINE' &&
                  device.status !== 'DEBUGGING' &&
                  device.status !== 'TESTING'
                    ? '#606266'
                    : device['temperature'] < 300
                    ? '#67C23A'
                    : device['temperature'] < 350
                    ? '#E6A23C'
                    : '#F56C6C',
              }"
            >
              <ColorImg
                v-if="
                  device['temperature'] !== 0 &&
                  (device.status === 'ONLINE' ||
                    device.status === 'DEBUGGING' ||
                    device.status === 'TESTING')
                "
                style="margin-left: -4px; margin-right: 3px"
                :src="img['./../assets/img/tem.png'].default"
                :width="20"
                :height="20"
                :color="
                  device['temperature'] === 0
                    ? '#606266'
                    : device['temperature'] < 300
                    ? '#67C23A'
                    : device['temperature'] < 350
                    ? '#E6A23C'
                    : '#F56C6C'
                "
              />
              {{
                device['temperature'] === 0 ||
                (device.status !== 'ONLINE' &&
                  device.status !== 'DEBUGGING' &&
                  device.status !== 'TESTING')
                  ? $t('form.unknown')
                  : (device['temperature'] / 10).toFixed(1) + ' ℃'
              }}
            </div>
          </el-form-item>
          <el-form-item :label="$t('devices.form.agent')">
            <div>{{ findAgentById(device.agentId) }}</div>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <div style="text-align: center">
      <el-button
        type="primary"
        size="mini"
        :disabled="device.status !== 'ONLINE'"
        @click="jump(device.id, device.platform)"
        >{{ $t('devices.useRightNow') }}
      </el-button>
      <el-popover placement="top" width="340px" trigger="hover">
        <el-form
          v-if="device.id"
          label-position="left"
          class="demo-table-expand"
          label-width="90px"
          style="margin-left: 10px; word-break: break-all"
        >
          <el-form-item :label="$t('devices.detail.image')">
            <el-upload
              style="width: 30px"
              :data="{ id: device.id }"
              action=""
              :with-credentials="true"
              :before-upload="beforeAvatarUpload"
              :http-request="upload"
              :show-file-list="false"
            >
              <el-button type="primary" size="mini"
                >{{ $t('devices.detail.uploadImg') }}
              </el-button>
            </el-upload>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.nickName')">
            <el-input
              v-model="device['nickName']"
              show-word-limit
              type="text"
              size="mini"
              :placeholder="$t('devices.detail.nickPlaceholder')"
              maxlength="30"
              style="position: absolute; top: 7px; bottom: 7px"
            >
              <template #append>
                <el-button size="mini" @click="saveDetail(device)"
                  >{{ $t('form.save') }}
                </el-button>
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
              v-model="device.password"
              show-word-limit
              type="text"
              size="mini"
              :placeholder="$t('devices.detail.pwdPlaceholder')"
              maxlength="30"
              style="position: absolute; top: 7px; bottom: 7px"
            >
              <template #append>
                <el-button size="mini" @click="saveDetail(device)"
                  >{{ $t('form.save') }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('devices.detail.operation')">
            <el-popconfirm
              placement="top"
              :confirm-button-text="$t('form.confirm')"
              :cancel-button-text="$t('form.cancel')"
              icon="el-icon-warning"
              icon-color="red"
              :title="$t('devices.detail.rebootTips')"
              @confirm="reboot(device.id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="mini"
                  :disabled="
                    device.status !== 'ONLINE' &&
                    device.status !== 'DEBUGGING' &&
                    device.status !== 'TESTING' &&
                    device.status !== 'ERROR'
                  "
                  >{{ $t('devices.detail.reboot') }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              placement="top"
              :confirm-button-text="$t('form.confirm')"
              :cancel-button-text="$t('form.cancel')"
              icon="el-icon-warning"
              icon-color="red"
              :title="$t('devices.detail.deleteTips')"
              @confirm="deleteDevice(device.id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="mini"
                  :disabled="
                    device.status === 'ONLINE' &&
                    device.status === 'DEBUGGING' &&
                    device.status === 'TESTING'
                  "
                  >{{ $t('common.delete') }}
                </el-button>
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
