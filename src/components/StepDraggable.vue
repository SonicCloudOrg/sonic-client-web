<script setup>
/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
import {VueDraggableNext} from 'vue-draggable-next';
import StepShow from './StepShow.vue'
import {Delete, Rank, Edit, DocumentAdd, Minus} from "@element-plus/icons";
import axios from "../http/axios";
import {ElMessage} from "element-plus";

const props = defineProps({
  steps: Array,
  isEdit: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['flush', 'editStep', 'deleteStep', 'setParent', 'addStep', 'remove'])
const sortStep = e => {
  if (props.isEdit && props.steps[e.moved.newIndex].parentId === 0) {
    return
  }
  let startId = null;
  let endId = null;
  let direction = "";
  if (e.moved.newIndex > e.moved.oldIndex) {
    direction = "down";
    endId = props.steps[e.moved.newIndex].sort;
    startId = props.steps[e.moved.newIndex - 1].sort;
  } else {
    direction = "up";
    startId = props.steps[e.moved.newIndex].sort;
    endId = props.steps[e.moved.newIndex + 1].sort;
  }
  axios
      .put("/controller/steps/stepSort", {
        caseId: props.steps[e.moved.newIndex].caseId,
        direction,
        startId,
        endId,
      })
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit('flush')
        }
      });
}
const setParent = (id) => {
  emit('setParent', id)
}
const editStep = (id, pId) => {
  setParent(pId)
  emit('editStep', id, pId)
}
const addStep = (pId) => {
  setParent(pId)
  emit('addStep', pId)
}
const deleteStep = id => {
  emit('deleteStep', id)
}
const remove = e => {
  emit('remove', e)
}
</script>

<template>
  <el-timeline v-if="steps.length>0">
    <VueDraggableNext tag="div"
                      :list="steps"
                      handle=".handle"
                      animation="200"
                      forceFallback="true"
                      fallbackClass="shake"
                      ghostClass="g-host"
                      chosenClass="move"
                      @change="sortStep">
      <el-timeline-item
          v-for="(s, index) in steps"
          :key="index"
          :timestamp="'步骤' + (index + 1)"
          placement="top"
          :type="s['error']===1?'primary':(s['error']===2?'warning':'danger')"
          style="padding-bottom: 0px!important;"
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
                <el-icon :size="13" style="vertical-align: middle;">
                  <DocumentAdd/>
                </el-icon>
              </el-button>
              <el-button
                  circle
                  type="primary"
                  size="mini"
                  @click="editStep(s.id,s.parentId)"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <Edit/>
                </el-icon>
              </el-button>
              <el-button
                  class="handle"
                  circle
                  size="mini"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <Rank/>
                </el-icon>
              </el-button>
              <el-button
                  v-if="isEdit"
                  circle
                  size="mini"
                  @click="remove(index)"
              >
                <el-icon :size="13" style="vertical-align: middle;">
                  <Minus/>
                </el-icon>
              </el-button>
              <el-popconfirm
                  v-else
                  style="margin-left: 10px"
                  :confirmButtonText="$t('form.confirm')"
                  :cancelButtonText="$t('form.cancel')"
                  @confirm="deleteStep(s.id)"
                  icon="el-icon-warning"
                  iconColor="red"
                  title="确定移除该步骤吗？"
              >
                <template #reference>
                  <el-button
                      circle
                      type="danger"
                      size="mini"
                  >
                    <el-icon :size="13" style="vertical-align: middle;">
                      <Delete/>
                    </el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
          <step-draggable :steps="s['childSteps']" @setParent="setParent" @addStep="addStep" @flush="emit('flush')"
                          @editStep="editStep" @deleteStep="deleteStep"/>
        </el-card>
        <div v-else>
          <step-show :step="s"></step-show>
          <div style="float: right">
            <el-button
                circle
                type="primary"
                size="mini"
                @click="editStep(s.id,0)"
            >
              <el-icon :size="13" style="vertical-align: middle;">
                <Edit/>
              </el-icon>
            </el-button>
            <el-button
                class="handle"
                circle
                size="mini"
            >
              <el-icon :size="13" style="vertical-align: middle;">
                <Rank/>
              </el-icon>
            </el-button>
            <el-button
                v-if="isEdit"
                circle
                size="mini"
                @click="remove(index)"
            >
              <el-icon :size="13" style="vertical-align: middle;">
                <Minus/>
              </el-icon>
            </el-button>
            <el-popconfirm
                v-else
                style="margin-left: 10px"
                :confirmButtonText="$t('form.confirm')"
                :cancelButtonText="$t('form.cancel')"
                @confirm="deleteStep(s.id)"
                icon="el-icon-warning"
                iconColor="red"
                title="确定移除该步骤吗？"
            >
              <template #reference>
                <el-button
                    circle
                    type="danger"
                    size="mini"
                >
                  <el-icon :size="13" style="vertical-align: middle;">
                    <Delete/>
                  </el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-timeline-item>
    </VueDraggableNext>
  </el-timeline>
  <el-empty description="暂无步骤" v-else></el-empty>
</template>