<script setup>
import {VueDraggableNext} from 'vue-draggable-next';
import StepShow from './StepShow.vue'
import {Delete, Rank, Edit, DocumentAdd} from "@element-plus/icons";

const props = defineProps({
  steps: Object,
})
const emit = defineEmits(['sortStep', 'editStep', 'deleteStep', 'setParent', 'addStep'])
const sortStep = (e, d, s) => {
  if (d && s) {
    emit('sortStep', e, d, s)
  } else {
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
    emit('sortStep', direction, endId, startId)
  }
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
</script>

<template>
  <VueDraggableNext tag="div"
                    v-model="steps"
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
            <el-popconfirm
                style="margin-left: 10px"
                confirmButtonText="确认"
                cancelButtonText="取消"
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
        <StepDraggable :steps="s['childSteps']" @setParent="setParent" @addStep="addStep" @sortStep="sortStep"
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
          <el-popconfirm
              style="margin-left: 10px"
              confirmButtonText="确认"
              cancelButtonText="取消"
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
</template>