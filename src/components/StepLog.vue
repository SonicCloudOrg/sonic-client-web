<script setup>
import { watch, nextTick, ref } from 'vue';
import { Loading, CircleCheckFilled, CaretBottom } from '@element-plus/icons';
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const props = defineProps({
  stepLog: Array,
  debugLoading: Boolean,
  isReadOnly: Boolean,
  isDone: Boolean,
});
const emit = defineEmits(['clearLog', 'loadMore', 'stopStep']);
const stopStep = () => {
  emit('stopStep');
};
const clearLog = () => {
  emit('clearLog');
};
const loadMore = () => {
  emit('loadMore');
};
const stepLogScrollbar = ref(null);
watch(props.stepLog, (newVal, oldVal) => {
  nextTick(() => {
    stepLogScrollbar.value.wrap.scrollTop =
      stepLogScrollbar.value.wrap.scrollHeight;
  });
});
const getTag = (status) => {
  switch (status) {
    case 3:
      return 'warning';
    case 4:
      return 'danger';
    default:
      return '';
  }
};
const isPic = (s) => {
  return (
    s.startsWith('http') &&
    (s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.png'))
  );
};
</script>

<template>
  <div v-if="!isReadOnly" style="text-align: center; margin-bottom: 10px">
    <el-button
      type="danger"
      size="mini"
      style="margin-right: 10px"
      :disabled="!debugLoading"
      @click="stopStep"
    >
      {{ $t('steps.forceStep') }}
    </el-button>
    <el-button
      icon="el-icon-delete"
      type="danger"
      size="mini"
      @click="clearLog()"
      >{{ $t('steps.clear') }}
    </el-button>
  </div>
  <div :style="isReadOnly ? 'height:100%' : 'height: 650px'">
    <el-scrollbar
      ref="stepLogScrollbar"
      class="demo-tree-scrollbar"
      style="height: 100%"
    >
      <el-table :data="stepLog" style="width: 100%" border>
        <el-table-column
          :label="$t('steps.status')"
          width="50"
          header-align="center"
          align="center"
        >
          <template #default="scope">
            <i
              v-if="scope.row.status === 2"
              class="el-icon-success"
              style="color: #67c23a"
            ></i>
            <i
              v-if="scope.row.status === 1"
              class="el-icon-info"
              style="color: #409eff"
            ></i>
            <i
              v-if="scope.row.status === 3"
              class="el-icon-warning"
              style="color: #e6a23c"
            ></i>
            <i
              v-if="scope.row.status === 4"
              class="el-icon-error"
              style="color: #f56c6c"
            ></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="time"
          :label="$t('steps.time')"
          width="100"
          header-align="center"
          align="center"
        >
        </el-table-column>
        <el-table-column header-align="center" :label="$t('steps.detail')">
          <template #default="scope">
            <span v-if="scope.row['des']">
              <el-tag
                :type="getTag(scope.row.status)"
                size="small"
                style="margin-right: 10px"
                >{{ scope.row['des'] }}</el-tag
              >
            </span>
            <div v-if="isPic(scope.row.log)">
              <el-image
                :z-index="5000"
                fit="contain"
                style="width: 100px; height: 100%; margin-top: 10px"
                hide-on-click-modal
                :src="scope.row.log"
                :preview-src-list="[scope.row.log]"
              ></el-image>
            </div>
            <span
              v-else-if="scope.row.log.startsWith('Script: <br>')"
              style="white-space: break-spaces"
              >Script:
              <el-collapse style="margin: 5px 0">
                <el-collapse-item>
                  <template #title> {{ $t('steps.script') }} </template>
                  <span
                    v-html="
                      scope.row.log.substring(
                        scope.row.log.indexOf('Script: <br>') + 12
                      )
                    "
                  ></span>
                </el-collapse-item>
              </el-collapse>
            </span>
            <span
              v-else
              style="white-space: break-spaces"
              v-html="scope.row.log"
            ></span>
          </template>
        </el-table-column>
        <template #append>
          <div v-if="!isReadOnly">
            <div v-if="stepLog.length !== 0">
              <div
                v-if="debugLoading"
                style="color: #409eff; line-height: 50px"
                class="flex-center"
              >
                <el-icon class="is-loading" style="margin-right: 5px">
                  <Loading />
                </el-icon>
                {{ $t('steps.running') }}
              </div>
              <div
                v-else
                style="line-height: 50px; color: #909399"
                class="flex-center"
              >
                <el-icon style="margin-right: 5px">
                  <CircleCheckFilled />
                </el-icon>
                {{ $t('steps.done') }}
              </div>
            </div>
          </div>
          <div v-else>
            <div
              v-if="debugLoading"
              style="color: #409eff; line-height: 50px"
              class="flex-center"
            >
              <el-icon class="is-loading" style="margin-right: 5px">
                <Loading />
              </el-icon>
              {{ $t('steps.loading') }}
            </div>
            <div
              v-else-if="isDone"
              style="line-height: 50px; color: #67c23a"
              class="flex-center"
            >
              <el-icon style="margin-right: 5px">
                <CircleCheckFilled />
              </el-icon>
              {{ $t('steps.loadDone') }}
            </div>
            <div
              v-else
              style="color: #409eff; line-height: 50px; cursor: pointer"
              class="flex-center"
              @click="loadMore"
            >
              <el-icon style="margin-right: 5px">
                <CaretBottom />
              </el-icon>
              {{ $t('steps.loadMore') }}
            </div>
          </div>
        </template>
      </el-table>
    </el-scrollbar>
  </div>
</template>
