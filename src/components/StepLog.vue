<script setup>
import {watch, nextTick, ref} from "vue";
import {Loading, CircleCheckFilled, CaretBottom} from "@element-plus/icons";

const props = defineProps({
  stepLog: Array,
  debugLoading: Boolean,
  isReadOnly: Boolean,
  isDone: Boolean
})
const emit = defineEmits(['clearLog', 'loadMore', 'stopStep'])
const stopStep = () => {
  emit('stopStep')
}
const clearLog = () => {
  emit('clearLog')
}
const loadMore = () => {
  emit("loadMore")
}
const stepLogScrollbar = ref(null)
watch(props.stepLog, (newVal, oldVal) => {
  nextTick(() => {
    stepLogScrollbar['value'].wrap.scrollTop =
        stepLogScrollbar['value'].wrap.scrollHeight;
  });
})
const getTag = (status) => {
  switch (status) {
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    default:
      return ''
  }
}
</script>
<template>
  <div v-if="!isReadOnly" style="text-align: center; margin-bottom: 10px">
    <el-button type="danger" size="mini" style="margin-right: 10px" @click="stopStep" :disabled="!debugLoading">
      强制终止
    </el-button>
    <el-button
        icon="el-icon-delete"
        type="danger"
        size="mini"
        @click="clearLog()"
    >清空
    </el-button
    >
  </div>
  <div :style="isReadOnly?'height:100%':'height: 650px'">
    <el-scrollbar
        class="demo-tree-scrollbar"
        style="height: 100%"
        ref="stepLogScrollbar"
    >
      <el-table :data="stepLog" style="width: 100%" border>
        <el-table-column
            label="状态"
            width="50"
            header-align="center"
            align="center"
        >
          <template #default="scope">
            <i
                class="el-icon-success"
                style="color: #67c23a"
                v-if="scope.row.status === 2"
            ></i>
            <i
                class="el-icon-info"
                style="color: #409eff"
                v-if="scope.row.status ===1"
            ></i>
            <i
                class="el-icon-warning"
                style="color: #e6a23c"
                v-if="scope.row.status === 3"
            ></i>
            <i
                class="el-icon-error"
                style="color: #f56c6c"
                v-if="scope.row.status === 4"
            ></i>
          </template>
        </el-table-column>
        <el-table-column
            prop="time"
            label="时间"
            width="100"
            header-align="center"
            align="center"
        >
        </el-table-column>
        <el-table-column header-align="center" label="步骤详情">
          <template #default="scope">
           <span v-if="scope.row['des']">
                        <el-tag
                            :type="getTag(scope.row.status)"
                            size="small"
                            style="margin-right: 10px"
                        >{{ scope.row['des'] }}</el-tag
                        >
                      </span>
            <div
                v-if="scope.row.log.indexOf('http') !== -1 &&
                    (scope.row.log.indexOf('.jpg') !== -1 || scope.row.log.indexOf('.png') !== -1) "
            >
              <el-image
                  :z-index="5000"
                  fit="contain"
                  style="width: 100px; height: 100%; margin-top: 10px"
                  hide-on-click-modal
                  :src="scope.row.log"
                  :preview-src-list="[
                            scope.row.log,
                          ]"
              ></el-image>
            </div>
            <span v-html="scope.row.log" v-else></span>
          </template>
        </el-table-column>
        <template #append>
          <div v-if="!isReadOnly">
            <div v-if="stepLog.length !== 0">
              <div
                  v-if="debugLoading"
                  style="color: #409eff;line-height: 50px;"
                  class="flex-center"
              >
                <el-icon class="is-loading" style="margin-right: 5px">
                  <Loading/>
                </el-icon>
                运行中
              </div>
              <div v-else style="line-height: 50px;color: #909399;" class="flex-center">
                <el-icon style="margin-right: 5px">
                  <CircleCheckFilled/>
                </el-icon>
                运行完毕
              </div>
            </div>
          </div>
          <div v-else>
            <div
                v-if="debugLoading"
                style="color: #409eff;line-height: 50px;"
                class="flex-center"
            >
              <el-icon class="is-loading" style="margin-right: 5px">
                <Loading/>
              </el-icon>
              加载中
            </div>
            <div v-else-if="isDone" style="line-height: 50px;color: #67C23A;" class="flex-center">
              <el-icon style="margin-right: 5px">
                <CircleCheckFilled/>
              </el-icon>
              加载完毕
            </div>
            <div v-else style="color: #409eff;line-height: 50px;cursor: pointer"
                 class="flex-center" @click="loadMore">
              <el-icon style="margin-right: 5px">
                <CaretBottom/>
              </el-icon>
              加载更多
            </div>
          </div>
        </template>
      </el-table>
    </el-scrollbar>
  </div>
</template>