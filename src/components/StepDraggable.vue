<script setup>
import {VueDraggableNext} from 'vue-draggable-next';
import StepShow from './StepShow.vue'
import {Delete, Rank, Edit} from "@element-plus/icons";

defineProps({
  steps: Object,
})
const emit = defineEmits(['sortStep', 'editStep', 'resetCaseId'])
const sortStep = (e) => {
  emit('sortStep', e)
}
const editStep = id => {
  emit('editStep', id)
}
const resetCaseId = id => {
  emit('resetCaseId', id)
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
          <span v-if="s.conditionType === 1">
      <el-tag size="small" type="warning" style="margin-right: 10px">if</el-tag>
    </span>
        <span v-if="s.conditionType === 2">
      <el-tag size="small" type="warning" style="margin-right: 10px">else if</el-tag>
    </span>
        <span v-if="s.conditionType === 3">
      <el-tag size="small" type="warning" style="margin-right: 10px">else</el-tag>
    </span>
        <span v-if="s.conditionType === 4">
      <el-tag size="small" type="warning" style="margin-right: 10px">while</el-tag>
    </span>
        (
        <step-show :step="s"></step-show>
        )
        <span>
      <el-tag size="small" type="warning" style="margin-left: 10px">无异常</el-tag>
    </span>
        <div style="float: right">
          <el-button
              circle
              type="primary"
              size="mini"
              @click="editStep(s.id)"
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
              @confirm="resetCaseId(s.id)"
              icon="el-icon-warning"
              iconColor="red"
              title="确定从用例中移除该步骤吗？"
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
      </el-card>
      <div v-else>
        <step-show :step="s"></step-show>
        <div style="float: right">
          <el-button
              circle
              type="primary"
              size="mini"
              @click="editStep(s.id)"
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
              @confirm="resetCaseId(s.id)"
              icon="el-icon-warning"
              iconColor="red"
              title="确定从用例中移除该步骤吗？"
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