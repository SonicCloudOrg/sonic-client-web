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
import axios from '@/http/axios';
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const remoteTimeout = ref(0);

const getRemoteTimeout = () => {
  axios.get('/controller/confList/getRemoteTimeout').then((resp) => {
    remoteTimeout.value = resp.data;
  });
};

const setRemoteTimeout = () => {
  axios
    .get('/controller/confList/setRemoteTimeout', {
      params: {
        timeout: remoteTimeout.value,
      },
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
      }
    });
};

onMounted(() => {
  getRemoteTimeout();
});
</script>

<template>
  <div>
    <el-alert
      :title="$t('settingIndexTS.remote.alertMsg')"
      type="info"
      :closable="false"
      style="margin-bottom: 10px"
    />
    {{ $t('settingIndexTS.remote.text') }}
    <el-input-number v-model="remoteTimeout" :min="1" :max="9600" />
    min
    <el-divider />
    <div style="text-align: center">
      <el-button type="primary" size="small" @click="setRemoteTimeout">{{
        $t('form.save')
      }}</el-button>
    </div>
  </div>
</template>
