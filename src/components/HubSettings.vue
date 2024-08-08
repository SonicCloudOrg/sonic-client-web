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
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import ColorImg from '@/components/ColorImg.vue';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import RenderStatus from './RenderStatus.vue';
import RenderDeviceName from './RenderDeviceName.vue';

const { t: $t } = useI18n();

const props = defineProps({
  agentId: Number,
});
const img = import.meta.globEager('./../assets/img/*');
const devices = ref([]);
const line = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const listByAgentId = () => {
  line.value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  axios
    .get('/controller/devices/listByAgentId', {
      params: {
        agentId: props.agentId,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        devices.value = resp.data;
        for (const i in devices.value) {
          if (devices.value[i].position !== 0) {
            line.value[devices.value[i].position - 1] = devices.value[i];
          }
        }
      }
    });
};
const updatePosition = (id, position) => {
  axios
    .get('/controller/devices/updatePosition', {
      params: {
        id,
        position,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        listByAgentId();
      }
    });
};
const hubControl = (position, type) => {
  axios
    .get('/controller/agents/hubControl', {
      params: {
        id: props.agentId,
        position,
        type,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        listByAgentId();
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
onMounted(() => {
  listByAgentId();
});
</script>

<template>
  <div>
    <div v-for="(l, j) in [line.slice(0, 5), line.slice(5, 10)]">
      <div style="display: flex">
        <div v-for="(device, i) in l" style="width: 20%; padding: 5px">
          <el-card v-if="device != 0" label-width="40px" class="device-card">
            <template #header>
              <RenderDeviceName :device="device"></RenderDeviceName>
              <RenderStatus
                :status="device.status"
                :user="device.user"
              ></RenderStatus>
            </template>
            <el-row>
              <el-col :span="10">
                <div style="text-align: center">
                  <el-image
                    style="height: 100px"
                    fit="contain"
                    :src="getPhoneImg(device.model, device['imgUrl'])"
                    :preview-src-list="[
                      getPhoneImg(device.model, device['imgUrl']),
                    ]"
                    hide-on-click-modal
                  />
                </div>
              </el-col>
              <el-col :span="14">
                <el-form
                  label-position="left"
                  class="device-form"
                  style="margin: 0 0 15px 10px"
                >
                  <el-form-item :label="$t('agent.hub.voltage')">
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
                  <el-form-item :label="$t('agent.hub.temperature')">
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
                  <el-form-item :label="$t('agent.hub.voltage')">
                    <div
                      :style="{
                        position: 'relative',
                        display: 'flex',
                        'align-items': 'center',
                        color:
                          device['voltage'] === 0 ||
                          (device.status !== 'ONLINE' &&
                            device.status !== 'DEBUGGING' &&
                            device.status !== 'TESTING')
                            ? '#606266'
                            : '#67C23A',
                      }"
                    >
                      <ColorImg
                        v-if="
                          device['voltage'] !== 0 &&
                          (device.status === 'ONLINE' ||
                            device.status === 'DEBUGGING' ||
                            device.status === 'TESTING')
                        "
                        style="margin-right: 5px"
                        :src="img['./../assets/img/voltage.png'].default"
                        :width="15"
                        :height="20"
                        :color="device['voltage'] === 0 ? '#606266' : '#67C23A'"
                      />
                      {{
                        device['voltage'] === 0 ||
                        (device.status !== 'ONLINE' &&
                          device.status !== 'DEBUGGING' &&
                          device.status !== 'TESTING')
                          ? $t('form.unknown')
                          : (device['voltage'] / 1000).toFixed(2) + ' V'
                      }}
                    </div>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <div style="text-align: center">
              <el-popover :width="400" trigger="click">
                <el-table border :data="devices">
                  <el-table-column
                    header-align="center"
                    :label="$t('agent.hub.info')"
                  >
                    <template #default="scope">
                      <RenderDeviceName :device="scope.row" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    show-overflow-tooltip
                    header-align="center"
                    width="150"
                    property="udId"
                    label="udId"
                  />
                  <el-table-column
                    align="center"
                    width="100"
                    :label="$t('agent.hub.action')"
                  >
                    <template #default="scope">
                      <el-button
                        type="primary"
                        size="mini"
                        :disabled="scope.row.id === device.id"
                        @click="updatePosition(scope.row.id, i + 1 + j * 5)"
                        >{{ $t('agent.hub.relate') }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <template #reference>
                  <el-button size="mini">
                    {{ $t('agent.hub.switch') }}
                  </el-button>
                </template>
              </el-popover>
              <el-button
                type="primary"
                size="mini"
                @click="hubControl(i + 1 + j * 5, 'up')"
              >
                {{ $t('agent.hub.poweron') }}
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="hubControl(i + 1 + j * 5, 'down')"
              >
                {{ $t('agent.hub.poweroff') }}
              </el-button>
            </div>
          </el-card>
          <el-card v-else>
            <el-empty
              :image-size="30"
              :description="i + 1 + j * 5 + $t('agent.hub.status')"
            />
            <div style="text-align: center">
              <el-popover :width="400" trigger="click">
                <el-table border :data="devices">
                  <el-table-column
                    header-align="center"
                    :label="$t('agent.hub.info')"
                  >
                    <template #default="scope">
                      <RenderDeviceName :device="scope.row" />
                    </template>
                  </el-table-column>
                  <el-table-column
                    show-overflow-tooltip
                    header-align="center"
                    width="150"
                    property="udId"
                    label="udId"
                  />
                  <el-table-column
                    align="center"
                    width="100"
                    :label="$t('agent.hub.action')"
                  >
                    <template #default="scope">
                      <el-button
                        type="primary"
                        size="mini"
                        @click="updatePosition(scope.row.id, i + 1 + j * 5)"
                        >{{ $t('agent.hub.relate') }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <template #reference>
                  <el-button size="mini">
                    {{ $t('agent.hub.relate') }}
                  </el-button>
                </template>
              </el-popover>
              <el-button
                type="primary"
                size="mini"
                @click="hubControl(i + 1 + j * 5, 'up')"
              >
                {{ $t('agent.hub.poweron') }}
              </el-button>
              <el-button
                type="danger"
                size="mini"
                @click="hubControl(i + 1 + j * 5, 'down')"
              >
                {{ $t('agent.hub.poweroff') }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px">
      <el-button type="primary" size="mini" @click="hubControl(11, 'up')">
        {{ $t('agent.hub.allpoweron') }}
      </el-button>
      <el-button type="danger" size="mini" @click="hubControl(11, 'down')">
        {{ $t('agent.hub.allpoweroff') }}
      </el-button>
    </div>
  </div>
</template>
