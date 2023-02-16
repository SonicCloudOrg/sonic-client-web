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
import { VueDraggableNext } from 'vue-draggable-next';
import {
  Delete,
  Rank,
  Edit,
  DocumentAdd,
  Minus,
  CopyDocument,
} from '@element-plus/icons';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import StepShow from './StepShow.vue';
import axios from '../http/axios';

const { t: $t } = useI18n();
const props = defineProps({
  steps: Array,
  isEdit: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'flush',
  'editStep',
  'deleteStep',
  'setParent',
  'addStep',
  'remove',
  'copyStep',
]);
const sortStep = (e) => {
  if (props.isEdit && props.steps[e.moved.newIndex].parentId === 0) {
    return;
  }
  let startId = null;
  let endId = null;
  let direction = '';
  if (e.moved.newIndex > e.moved.oldIndex) {
    direction = 'down';
    endId = props.steps[e.moved.newIndex].sort;
    startId = props.steps[e.moved.newIndex - 1].sort;
  } else {
    direction = 'up';
    startId = props.steps[e.moved.newIndex].sort;
    endId = props.steps[e.moved.newIndex + 1].sort;
  }
  axios
    .put('/controller/steps/stepSort', {
      caseId: props.steps[e.moved.newIndex].caseId,
      direction,
      startId,
      endId,
    })
    .then((resp) => {
      if (resp.code === 2000) {
        ElMessage.success({
          message: resp.message,
        });
        emit('flush');
      }
    });
};
const setParent = (id) => {
  emit('setParent', id);
};
const editStep = (id, pId) => {
  setParent(pId);
  emit('editStep', id, pId);
};
const addStep = (pId) => {
  setParent(pId);
  emit('addStep', pId);
};
const deleteStep = (id) => {
  emit('deleteStep', id);
};
const remove = (e) => {
  emit('remove', e);
};

const copyStep = (id) => {
  emit('copyStep', id);
};
</script>

<template>
  <el-timeline v-if="steps.length > 0">
    <VueDraggableNext
      tag="div"
      :list="steps"
      handle=".handle"
      animation="200"
      force-fallback="true"
      fallback-class="shake"
      ghost-class="g-host"
      chosen-class="move"
      @change="sortStep"
    >
      <el-timeline-item
        v-for="(s, index) in steps"
        :key="index"
        :timestamp="$t('steps.step') + (index + 1)"
        placement="top"
        :type="
          s['error'] === 1 ? 'primary' : s['error'] === 2 ? 'warning' : 'danger'
        "
        style="padding-bottom: 0px !important"
        :hollow="true"
      >
        <el-card v-if="s.conditionType !== 0">
          <template #header>
            <step-show :step="s"></step-show>
            <div style="float: right">
              <el-button
                circle
                type="primary"
                size="mini"
                @click="addStep(s.id)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <DocumentAdd />
                </el-icon>
              </el-button>
              <el-button
                circle
                type="primary"
                size="mini"
                @click="editStep(s.id, s.parentId)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <Edit />
                </el-icon>
              </el-button>
              <el-button
                circle
                type="primary"
                size="mini"
                @click="copyStep(s.id)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <CopyDocument />
                </el-icon>
              </el-button>
              <el-button class="handle" circle size="mini">
                <el-icon :size="13" style="vertical-align: middle">
                  <Rank />
                </el-icon>
              </el-button>
              <el-button
                v-if="isEdit"
                circle
                size="mini"
                @click="remove(index)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <Minus />
                </el-icon>
              </el-button>
              <el-popconfirm
                v-else
                style="margin-left: 10px"
                :confirm-button-text="$t('form.confirm')"
                :cancel-button-text="$t('form.cancel')"
                icon="el-icon-warning"
                icon-color="red"
                :title="$t('steps.remove')"
                @confirm="deleteStep(s.id)"
              >
                <template #reference>
                  <el-button circle type="danger" size="mini">
                    <el-icon :size="13" style="vertical-align: middle">
                      <Delete />
                    </el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
          <step-draggable
            :steps="s['childSteps']"
            @setParent="setParent"
            @addStep="addStep"
            @flush="emit('flush')"
            @editStep="editStep"
            @deleteStep="deleteStep"
            @copyStep="copyStep"
          />
        </el-card>
        <div v-else style="display: flex; justify-content: space-between">
          <step-show :step="s"></step-show>
          <div style="float: right; flex: 0 0 185px; text-align: right">
            <el-button
              circle
              type="primary"
              size="mini"
              @click="editStep(s.id, 0)"
            >
              <el-icon :size="13" style="vertical-align: middle">
                <Edit />
              </el-icon>
            </el-button>
            <el-button
              circle
              type="primary"
              size="mini"
              @click="copyStep(s.id)"
            >
              <el-icon :size="13" style="vertical-align: middle">
                <CopyDocument />
              </el-icon>
            </el-button>
            <el-button class="handle" circle size="mini">
              <el-icon :size="13" style="vertical-align: middle">
                <Rank />
              </el-icon>
            </el-button>
            <el-button v-if="isEdit" circle size="mini" @click="remove(index)">
              <el-icon :size="13" style="vertical-align: middle">
                <Minus />
              </el-icon>
            </el-button>
            <el-popconfirm
              v-else
              style="margin-left: 10px"
              :confirm-button-text="$t('form.confirm')"
              :cancel-button-text="$t('form.cancel')"
              icon="el-icon-warning"
              icon-color="red"
              :title="$t('steps.remove')"
              @confirm="deleteStep(s.id)"
            >
              <template #reference>
                <el-button circle type="danger" size="mini">
                  <el-icon :size="13" style="vertical-align: middle">
                    <Delete />
                  </el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-timeline-item>
    </VueDraggableNext>
  </el-timeline>
  <el-empty v-else :description="$t('steps.empty')"></el-empty>
</template>
