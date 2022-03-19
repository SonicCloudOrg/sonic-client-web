<script setup>
import {onMounted, ref, watch} from "vue";
import axios from "../http/axios";
import StepShow from '../components/StepShow.vue'
import StepUpdate from './StepUpdate.vue'
import Pageable from '../components/Pageable.vue'
import {Delete, Rank, Edit, Plus} from "@element-plus/icons";
import {VueDraggableNext} from 'vue-draggable-next';
import {ElMessage} from "element-plus";

const props = defineProps({
  projectId: Number,
  publicStepId: Number
})
const img = import.meta.globEager("./../assets/img/*")
const publicStep = ref({
  id: null,
  projectId: props.projectId,
  platform: 1,
  name: "",
  steps: []
})
const updatePub = ref(null)
const pageData = ref({});
const pageSize = ref(10);
const dialogVisible = ref(false)
const stepId = ref(0)
const tabValue = ref("select")
const platformList = [{name: "安卓", value: 1, img: "ANDROID"}
  , {name: "iOS", value: 2, img: "IOS"}]
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const getStepList = (pageNum, pSize) => {
  axios.get("/controller/steps/list", {
    params: {
      projectId: props.projectId,
      platform: publicStep.value.platform,
      page: pageNum || 1,
      pageSize: pSize || pageSize.value,
    }
  }).then(resp => {
    pageData.value = resp.data
  })
}
const deleteStep = (id) => {
  axios.delete("/controller/steps", {
    params: {
      id
    }
  }).then(resp => {
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      getStepList()
    }
  })
}
watch(dialogVisible, (newValue, oldValue) => {
  if (!newValue) {
    stepId.value = 0
  }
})
const editStep = async (id) => {
  stepId.value = id
  await addStep()
}
const addStep = () => {
  dialogVisible.value = true
}
const flush = () => {
  dialogVisible.value = false
  getStepList();
}
const addToPublic = (e) => {
  publicStep.value.steps.push(e)
  ElMessage.success({
    message: "选择成功！已加入到已选步骤",
  });
}
const removeFromPublic = (e) => {
  publicStep.value.steps.splice(e, 1);
  ElMessage.success({
    message: "移出成功！",
  });
}
const emit = defineEmits(['flush'])
const summit = () => {
  updatePub['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/publicSteps", publicStep.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit('flush');
        }
      })
    }
  })
}
const getPublicStepInfo = (id) => {
  axios.get("/controller/publicSteps", {params: {id}}).then(resp => {
    if (resp['code'] === 2000) {
      publicStep.value = resp.data
      getStepList()
    }
  })
}
onMounted(() => {
  if (props.publicStepId !== 0) {
    getPublicStepInfo(props.publicStepId)
  } else {
    getStepList()
  }
})
</script>
<template>
  <el-dialog v-model="dialogVisible" title="步骤信息" width="600px">
    <step-update v-if="dialogVisible" :step-id="stepId" :case-id="0"
                 :project-id="projectId"
                 :platform="publicStep.platform" @flush="flush"></step-update>
  </el-dialog>
  <el-form ref="updatePub" :model="publicStep" size="small" class="demo-table-expand" label-width="110px"
           label-position="left">
    <el-form-item
        prop="name"
        label="公共步骤名称"
        :rules="{
          required: true,
          message: '公共步骤名称不能为空',
          trigger: 'blur',
        }"
    >
      <el-input
          v-model="publicStep.name"
          placeholder="请输入公共步骤名称"
      ></el-input>
    </el-form-item>
    <el-form-item
        prop="platform"
        label="平台"
        :rules="{
            required: true,
            message: '请选择平台',
            trigger: 'change',
          }"
    >
      <el-select
          style="width: 100%"
          v-model="publicStep.platform"
          placeholder="请选择平台"
          :disabled="publicStep.steps.length>0"
          @change="getStepList()"
      >
        <el-option
            v-for="item in platformList"
            :key="item.name"
            :value="item.value"
            :label="item.name"
            :disabled="item['disabled']"
        >
          <div style="display: flex;align-items: center;justify-content: center">
            <el-avatar
                style="margin-right: 10px"
                :size="32"
                :src="getImg(item.img)"
                shape="square"
            ></el-avatar
            >
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
  <el-tabs type="border-card" stretch v-model="tabValue">
    <el-tab-pane label="已选步骤" name="select">
      <el-timeline v-if="publicStep.steps.length>0">
        <VueDraggableNext tag="div"
                          v-model="publicStep.steps"
                          handle=".handle"
                          animation="200"
                          forceFallback="true"
                          fallbackClass="shake"
                          ghostClass="g-host"
                          chosenClass="move">
          <el-timeline-item
              v-for="(s, index) in publicStep.steps"
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
                      class="handle"
                      circle
                      size="mini"
                  >
                    <el-icon :size="13" style="vertical-align: middle;">
                      <Rank/>
                    </el-icon>
                  </el-button>
                  <el-button
                      circle
                      type="danger"
                      size="mini"
                      @click="removeFromPublic(index)"
                  >
                    <el-icon :size="13" style="vertical-align: middle;">
                      <Delete/>
                    </el-icon>
                  </el-button>
                </div>
              </template>
              <el-timeline v-if="s['childSteps'].length>0">
                <el-timeline-item v-for="(sc,index) in s['childSteps']" :timestamp="'步骤' + (index + 1)"
                                  placement="top"
                                  :type="sc['error']===1?'primary':(sc['error']===2?'warning':'danger')"
                                  style="padding-bottom: 0px!important;"
                                  :hollow="true">
                  <step-show :step="sc"></step-show>
                </el-timeline-item>
              </el-timeline>
            </el-card>
            <div v-else>
              <step-show :step="s"></step-show>
              <div style="float: right">
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
                    circle
                    type="danger"
                    size="mini"
                    @click="removeFromPublic(index)"
                >
                  <el-icon :size="13" style="vertical-align: middle;">
                    <Delete/>
                  </el-icon>
                </el-button>
              </div>
            </div>
          </el-timeline-item>
        </VueDraggableNext>
      </el-timeline>
      <el-empty description="暂无步骤" v-else>
        <el-button size="mini" @click="tabValue = 'list'">马上添加</el-button>
      </el-empty>
    </el-tab-pane>
    <el-tab-pane label="步骤列表" name="list">
      <el-alert style="margin-bottom: 10px" show-icon title="从此处添加或编辑步骤，并加入到已选步骤中" type="info" close-text="Get!"/>
      <el-button size="mini" round type="primary" @click="addStep">添加步骤</el-button>
      <el-table :data="pageData['content']" border style="margin-top: 10px">
        <el-table-column width="80" label="步骤Id" prop="id" align="center" show-overflow-tooltip/>
        <el-table-column width="90" label="所属用例Id" align="center">
          <template #default="scope">
            <el-tag size="mini" v-if="scope.row.caseId=== 0">无</el-tag>
            <span v-else>{{ scope.row.caseId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="步骤详情" header-align="center">
          <template #default="scope">
            <step-show :step="scope.row"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
            <el-button
                circle
                size="mini"
                @click="addToPublic(scope.row)"
            >
              <el-icon :size="13" style="vertical-align: middle;">
                <Plus/>
              </el-icon>
            </el-button>
            <el-button
                circle
                type="primary"
                size="mini"
                @click="editStep(scope.row.id)"
            >
              <el-icon :size="13" style="vertical-align: middle;">
                <Edit/>
              </el-icon>
            </el-button>
            <el-popconfirm
                style="margin-left: 10px"
                confirmButtonText="确认"
                cancelButtonText="取消"
                @confirm="deleteStep(scope.row.id)"
                icon="el-icon-warning"
                iconColor="red"
                title="确定彻底删除该步骤吗？"
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
          </template>
        </el-table-column>
      </el-table>
      <pageable :is-page-set="false" :total="pageData['totalElements']"
                :current-page="pageData['number']+1"
                :page-size="pageData['size']"
                @change="getStepList"></pageable>
    </el-tab-pane>
  </el-tabs>
  <div style="text-align: center;margin-top: 20px">
    <el-button @click="summit" size="small" type="primary">提交</el-button>
  </div>
</template>