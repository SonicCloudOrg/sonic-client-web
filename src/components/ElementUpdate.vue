<script setup>
import {ref, onMounted} from "vue";
import {ElMessage} from "element-plus";
import axios from "../http/axios";

const props = defineProps({
  projectId: Number,
  elementId: Number
})
const emit = defineEmits(['flush'])
const element = ref({
  id: null,
  eleName: "",
  eleType: "",
  eleValue: "",
  projectId: props.projectId,
})
const updateEle = ref(null)
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
          element.value.eleValue = resp['data']
        }
      });
}
const getElementInfo = (id) => {
  axios.get("/controller/elements", {
    params: {
      id
    }
  }).then(resp => {
    element.value = resp.data
  })
}
const saveElement = () => {
  updateEle['value'].validate((valid) => {
    if (valid) {
      axios.put("/controller/elements", element.value).then(resp => {
        if (resp['code'] === 2000) {
          ElMessage.success({
            message: resp['message'],
          });
          emit("flush");
        }
      })
    }
  })
}
onMounted(() => {
  if (props.elementId !== 0) {
    getElementInfo(props.elementId)
  }
})
</script>
<template>
  <el-alert style="margin-bottom: 10px" title="如选择坐标类型，xy之间用英文逗号隔开，例：111,222" type="info" show-icon close-text="Get!"/>
  <el-form ref="updateEle" :model="element" size="small" class="demo-table-expand" label-width="90px"
           label-position="left">
    <el-form-item
        prop="eleName"
        label="控件名称"
        :rules="{
          required: true,
          message: '控件元素名称不能为空',
          trigger: 'blur',
        }"
    >
      <el-input
          v-model="element.eleName"
          placeholder="请输入控件元素名称"
      ></el-input>
    </el-form-item>
    <el-form-item prop="eleType" label="定位类型">
      <el-select
          style="width: 100%"
          v-model="element.eleType"
          placeholder="请选择定位类型"
      >
        <el-option-group label="移动端常用定位方式">
          <el-option label="id（resource-id）" value="id"></el-option>
          <el-option value="xpath"></el-option>
          <el-option label="nsPredicate（仅支持iOS10或以上）" value="nsPredicate"></el-option>
          <el-option value="accessibilityId"></el-option>
        </el-option-group>
        <el-option-group label="特殊定位方式">
          <el-option label="坐标" value="point"></el-option>
          <el-option label="图片" value="image"></el-option>
        </el-option-group>
        <el-option-group label="WebView常用定位方式">
          <el-option value="name"></el-option>
          <el-option value="cssSelector"></el-option>
          <el-option value="linkText"></el-option>
          <el-option value="className"></el-option>
          <el-option value="tagName"></el-option>
          <el-option value="partialLinkText"></el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-alert show-icon style="margin-bottom:10px" close-text="Get!" type="info"
              title="TIPS: 需要临时变量或全局变量时，可以添加{{变量名}}的形式"/>
    <el-form-item prop="eleValue" label="控件元素值">
      <el-upload
          v-if="element.eleType === 'image'"
          drag
          action=""
          :with-credentials="true"
          :limit="1"
          :before-upload="beforeAvatarUpload"
          :on-exceed="limitOut"
          :http-request="upload"
          list-type="picture"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">只能上传jpg/png文件</div>
        </template>
      </el-upload>
      <el-input
          v-else
          v-model="element.eleValue"
          placeholder="请输入控件元素值"
      ></el-input>
    </el-form-item>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="saveElement">确 定</el-button>
    </div>
  </el-form>
</template>