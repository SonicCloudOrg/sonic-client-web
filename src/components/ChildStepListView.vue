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

import { useI18n } from 'vue-i18n';
import StepShow from './StepShow.vue';

const { t: $t } = useI18n();
const props = defineProps({
  steps: Array,
});
</script>

<template>
  <el-timeline v-if="steps.length > 0" style="padding: 10px 0 10px 20px">
    <el-timeline-item
      v-for="(s, index) in steps"
      :key="index"
      :timestamp="
        $t('steps.step') +
        (index + 1) +
        '  - ' +
        $t('steps.cases') +
        (s.caseId === 0 ? $t('common.null') : s.caseId)
      "
      placement="top"
      :type="
        s['error'] === 1 ? 'primary' : s['error'] === 2 ? 'warning' : 'danger'
      "
      style="padding-bottom: 5px !important"
      :hollow="true"
    >
      <el-card v-if="s.conditionType !== 0">
        <template #header>
          <step-show :step="s"></step-show>
        </template>
        <child-step-list-view :steps="s['childSteps']" />
      </el-card>
      <div v-else style="display: flex; justify-content: space-between">
        <step-show :step="s"></step-show>
      </div>
    </el-timeline-item>
  </el-timeline>
  <el-empty v-else :description="$t('steps.empty')"></el-empty>
</template>
