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
  isPublicSteps: {
    type: Boolean,
    default: false, // 公共步骤可能会引用多个不同case的步骤，不应该允许拖拽更改parentId
  },
  parentId: Number, // 用于分组拖拽时，更新step数据的parentId
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
const switchStep = (id, e) => {
  axios
    .get('/controller/steps/switchStep', {
      params: {
        id,
        type: e,
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
const sortStep = (e) => {
  if (e.removed !== undefined) {
    return;
  }
  let startId = null;
  let endId = null;
  let direction = '';
  let newIndex = null;
  let stepsId = null;
  let newParentId = null;
  let caseId = null;
  if (e.added !== undefined) {
    // eslint-disable-next-line vue/no-mutating-props
    props.steps[e.added.newIndex].parentId = props.parentId; // 更新parentId
    caseId = props.steps[e.added.newIndex].caseId;
    newParentId = props.parentId;
    newIndex = e.added.newIndex;
    stepsId = props.steps[e.added.newIndex].id;
    // 此场景中下面3个参数不重要，为了兼容后端参数要求随便填的，它们会由后端进行处理
    direction = 'added';
    startId = 1;
    endId = 2;
  } else {
    caseId = props.steps[e.moved.newIndex].caseId;
    if (props.isEdit && props.steps[e.moved.newIndex].parentId === 0) {
      return;
    }
    if (e.moved.newIndex > e.moved.oldIndex) {
      direction = 'down';
      endId = props.steps[e.moved.newIndex].sort;
      startId = props.steps[e.moved.newIndex - 1].sort;
    } else {
      direction = 'up';
      startId = props.steps[e.moved.newIndex].sort;
      endId = props.steps[e.moved.newIndex + 1].sort;
    }
  }
  axios
    .put('/controller/steps/stepSort', {
      caseId,
      direction,
      startId,
      endId,
      newParentId,
      newIndex,
      stepsId,
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

/**
 * 拷贝步骤的方法
 * @param {*} id  步骤id
 * @param {*} toLast 是否复制到最后一行
 */
const copyStep = (id, toLast) => {
  emit('copyStep', id, toLast);
};
/**
 * 添加步骤到特定位置的方法
 * @param {*} id         点选的位置
 * @param {*} toNext     true添加到下一行，false添加到上一行
 */
const addStepTotarget = (id, toNext) => {
  emit('addStepTotarget', id, toNext);
};
</script>

<template>
  <el-scrollbar style="height: 100%">
    <el-timeline class="stepsTimeline">
      <!-- 设置group，这样同名的group之间就可以互相拖拽 -->
      <VueDraggableNext
        tag="div"
        :list="steps"
        :group="isPublicSteps ? '' : 'case-step'"
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
            s['error'] === 1
              ? 'primary'
              : s['error'] === 2
              ? 'warning'
              : 'danger'
          "
          style="padding-bottom: 0px !important"
          :hollow="true"
        >
          <el-card v-if="s.conditionType !== 0">
            <template #header>
              <step-show :step="s"></step-show>
              <div style="float: right">
                <el-switch
                  v-model="s.disabled"
                  :active-value="0"
                  :inactive-value="1"
                  active-color="#67C23A"
                  width="30"
                  size="large"
                  @change="switchStep(s.id, $event)"
                ></el-switch>
                <el-button
                  circle
                  style="margin-left: 10px"
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
              :parent-id="s['id']"
              @set-parent="setParent"
              @add-step="addStep"
              @flush="emit('flush')"
              @edit-step="editStep"
              @delete-step="deleteStep"
              @copy-step="copyStep"
            />
          </el-card>
          <div v-else style="display: flex; justify-content: space-between">
            <step-show :step="s"></step-show>
            <div
              style="
                float: right;
                flex: 0 0 245px;
                text-align: right;
                margin-right: 12px;
              "
            >
              <el-switch
                v-model="s.disabled"
                :active-value="0"
                :inactive-value="1"
                active-color="#67C23A"
                width="30"
                size="large"
                @change="switchStep(s.id, $event)"
              ></el-switch>
              <el-button
                style="margin-left: 10px"
                circle
                type="primary"
                size="mini"
                @click="editStep(s.id, 0)"
              >
                <el-icon :size="13" style="vertical-align: middle">
                  <Edit />
                </el-icon>
              </el-button>
              <!--添加操作的按钮-->
              <el-popconfirm
                v-if="s.parentId === 0 && !isEdit"
                style="margin-left: 10px"
                :confirm-button-text="$t('steps.addToNextLine')"
                :cancel-button-text="$t('steps.addToBeforeLine')"
                confirm-button-type="text"
                icon="el-icon-warning"
                icon-color="green"
                :title="$t('steps.addStepTips')"
                @confirm="addStepTotarget(s.id, true)"
                @cancel="addStepTotarget(s.id, false)"
              >
                <template #reference>
                  <el-button circle type="primary" size="mini">
                    <el-icon :size="13" style="vertical-align: middle">
                      <DocumentAdd />
                    </el-icon>
                  </el-button>
                </template>
              </el-popconfirm>

              <!--复制操作的按钮-->
              <el-popconfirm
                v-if="!isEdit"
                style="margin-left: 10px"
                :confirm-button-text="$t('steps.copyToLastLine')"
                :cancel-button-text="$t('steps.copyToNextLine')"
                confirm-button-type="text"
                icon="el-icon-warning"
                icon-color="green"
                :title="$t('steps.copyStepTips')"
                @confirm="copyStep(s.id, true)"
                @cancel="copyStep(s.id, false)"
              >
                <template #reference>
                  <el-button circle type="primary" size="mini">
                    <el-icon :size="13" style="vertical-align: middle">
                      <CopyDocument />
                    </el-icon>
                  </el-button>
                </template>
              </el-popconfirm>

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
          </div>
        </el-timeline-item>
      </VueDraggableNext>
    </el-timeline>
    <el-empty
      v-if="steps.length === 0"
      :description="$t('steps.empty')"
    ></el-empty>
  </el-scrollbar>
</template>

<style>
.stepsTimeline {
  max-height: 75vh;
}
</style>
