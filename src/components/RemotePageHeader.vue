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
import { QuestionFilled } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const props = defineProps({
  ticker: Number,
  idleCount: Number,
  remoteTimeout: Number,
  idleTimeout: Number,
});
const emit = defineEmits(['close']);
const parseTimeout = (time) => {
  let h = parseInt((time / 60 / 60) % 24);
  h = h < 10 ? `0${h}` : h;
  let m = parseInt((time / 60) % 60);
  m = m < 10 ? `0${m}` : m;
  let s = parseInt(time % 60);
  s = s < 10 ? `0${s}` : s;
  return `${h} ${$t('common.hour')} ${m} ${$t('common.min')} ${s} ${$t(
    'common.sec'
  )} `;
};
const close = () => {
  emit('close');
};
</script>

<template>
  <div class="remote-header">
    <el-page-header @back="close">
      <template #content>
        <div style="display: flex; align-items: center">
          {{ $t('routes.remoteControl') + ' - ' }}
          <span style="font-size: 12px; margin-left: 10px">
            <div>{{ $t('common.inuse') }} {{ parseTimeout(ticker) }}</div>
            <div>{{ $t('common.inidle') }} {{ parseTimeout(idleCount) }}</div>
          </span>
          <el-popover placement="bottom" width="270" trigger="hover">
            <div>
              {{
                $t('settingIndexTS.remote.text') +
                remoteTimeout +
                ' ' +
                $t('common.min')
              }}
            </div>
            <div>
              {{
                $t('settingIndexTS.remote.idle_text') +
                idleTimeout +
                ' ' +
                $t('common.min')
              }}
            </div>
            <div>{{ $t('common.release') }}</div>
            <template #reference>
              <div style="margin-left: 10px; color: #909399">
                <el-icon :size="15" style="vertical-align: middle">
                  <QuestionFilled />
                </el-icon>
              </div>
            </template>
          </el-popover>
        </div>
      </template>
    </el-page-header>
  </div>
</template>
