<script setup>
import {onMounted, ref} from "vue";
import {ElMessage} from "element-plus";
import axios from "../http/axios";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";

const props = defineProps({
  isUpdate: Boolean
})
const store = useStore()
const route = useRoute()
const router = useRouter()
const project = ref({
  id: null,
  projectName: "",
  projectDes: "",
  robotType: 1,
  robotToken: "",
  robotSecret: "",
  projectImg: ""
})
const projectUpdateForm = ref(null)
const dialogDel = ref(false)
const img = import.meta.globEager("./../assets/img/*")
const getImg = (name) => {
  let result;
  if (name === 'meizu') {
    name = 'Meizu'
  }
  if (name === 'LENOVO') {
    name = 'Lenovo'
  }
  try {
    result = img['./../assets/img/' + name + '.jpg'].default
  } catch {
    result = img['./../assets/img/unName.jpg'].default
  }
  return result;
}
const robotList = [{name: "钉钉群机器人", value: 1, img: "DingTalk"}
  , {name: "企业微信机器人", value: 2, img: "WeChat"},
  {name: "飞书群机器人", value: 3, img: "FeiShu"},
  {name: "友空间机器人(即将开放)", value: 4, img: "You", disabled: true}]
const beforeAvatarUpload = (file) => {
  if (file.name.endsWith(".jpg") || file.name.endsWith(".png")) {
    return true;
  } else {
    ElMessage.error({
      message: "文件格式有误！",
    });
    return false;
  }
}
const limitOut = () => {
  ElMessage.error({
    message: "只能添加一个文件！请先移除旧文件",
  });
}
const upload = (content) => {
  let formData = new FormData();
  formData.append("file", content.file);
  formData.append("type", 'keepFiles');
  axios
      .post("/folder/upload", formData, {headers: {"Content-type": "multipart/form-data"}})
      .then((resp) => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          project.value.projectImg = resp['data']
        }
      });
}
const emit = defineEmits(['flush'])
const summit = () => {
  projectUpdateForm['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/projects", project.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          if (props.isUpdate) {
            store.commit("saveProject", project.value);
          }
          emit('flush');
        }
      })
    }
  })
}
const fullscreenLoading = ref(false)
const delProject = () => {
  fullscreenLoading.value = true
  axios.delete("/controller/projects", {params: {id: route.params.projectId}}).then(resp => {
    fullscreenLoading.value = false
    if (resp['code'] === 2000) {
      ElMessage.success({
        message: resp['message'],
      });
      dialogDel.value = false;
      router.push('/')
    }
  })
}
onMounted(() => {
  if (props.isUpdate) {
    project.value = JSON.parse(JSON.stringify(store.state.project))
  }
})
</script>
<template>
  <el-form
      ref="projectUpdateForm"
      :model="project"
      label-width="100px"
      class="project-table-expand"
  >
    <el-form-item label="项目Logo" prop="projectImg">
      <el-upload
          action=""
          list-type="picture-card"
          :with-credentials="true"
          :limit="1"
          :before-upload="beforeAvatarUpload"
          :on-exceed="limitOut"
          :http-request="upload"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
    </el-form-item>
    <el-form-item label="项目名称" prop="projectName" :rules="{
          required: true,
          message: '项目名称不能为空',
          trigger: 'blur',
        }">
      <el-input
          v-model="project.projectName"
          placeholder="请输入项目名"
      ></el-input>
    </el-form-item>
    <el-form-item label="项目描述" prop="projectDes">
      <el-input
          type="textarea"
          :rows="5"
          v-model="project.projectDes"
          placeholder="请输入项目描述"
      ></el-input>
    </el-form-item>
    <el-form-item label="机器人类型">
      <el-select
          style="width: 100%"
          v-model="project.robotType"
          placeholder="请选择机器人类型"
      >
        <el-option
            v-for="item in robotList"
            :key="item.name"
            :value="item.value"
            :label="item.name"
            :disabled="item['disabled']"
        >
          <div style="display: flex;align-items: center">
            <el-avatar
                style="margin-right: 10px"
                :size="30"
                :src="getImg(item.img)"
                shape="square"
            ></el-avatar
            >
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="机器人Hook" prop="robotToken">
      <el-input
          v-model="project.robotToken"
          placeholder="请输入群机器人的WebHook"
      ></el-input>
      <span style="font-size: 13px; color: #999"
      >填写群机器人的WebHook，可在机器人设置页面查看，机器人用于报告通知</span
      >
    </el-form-item>
    <el-form-item label="机器人密钥" prop="robotSecret">
      <el-input
          v-model="project.robotSecret"
          placeholder="（可选）请输入群机器人的密钥"
          type="password"
      ></el-input>
      <span style="font-size: 13px; color: #999"
      >（可选）填写群机器人的密钥，可在机器人设置页面查看</span
      >
    </el-form-item>
  </el-form>
  <div style="text-align: center">
    <el-button
        size="medium"
        type="primary"
        icon="el-icon-edit"
        @click="summit"
    >提交
    </el-button
    >
    <el-button
        v-if="isUpdate"
        type="danger"
        size="medium"
        icon="el-icon-delete"
        @click="dialogDel = true"
    >删除项目
    </el-button
    >
  </div>
  <el-dialog title="警告" v-model="dialogDel" width="25%" center>
    <div style="text-align: center">
      <p>确定删除这个项目吗？</p>
      <p style="color: red">
        <i class="el-icon-warning">项目包含的所有信息将一并删除！</i>
      </p>
    </div>
    <template #footer>
      <el-button size="small" @click="dialogDel = false">取 消</el-button>
      <el-button size="small" type="danger" @click="delProject" v-loading.fullscreen.lock="fullscreenLoading">确 定
      </el-button>
    </template>
  </el-dialog>
</template>