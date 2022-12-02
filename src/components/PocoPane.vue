<script setup>
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import defaultLogo from '@/assets/logo.png';
import ElementUpdate from '@/components/ElementUpdate.vue';
import {
  Headset,
  MoreFilled,
  FullScreen,
  Edit,
  HelpFilled,
  HomeFilled,
  Coin,
  List,
  Picture,
  Pointer,
  Operation,
  Menu,
  Share,
  VideoCamera,
} from '@element-plus/icons';

const img = import.meta.globEager('../assets/img/*');
const { t: $t } = useI18n();
const selectPocoType = ref('');
const pocoPort = ref('');
const dialogElement = ref(false);
const props = defineProps({
  pocoLoading: Boolean,
  isDriverFinish: Boolean,
  directionStatus: Object,
  project: Object,
  projectList: Array,
  getImgUrl: Function,
});
let imgWidth = 0;
let imgHeight = 0;
const pocoData = ref([]);
const pocoDetail = ref(null);
const pocoTree = ref(null);
const currentPocoId = ref([]);
const isShowPocoImg = ref(false);
const imgUrl = ref('');
const emit = defineEmits(['getPoco', 'copy']);
const switchPocoType = (e) => {
  switch (e) {
    case 'UNITY_3D':
    case 'UE4':
      pocoPort.value = '5001';
      break;
    case 'COCOS_2DX_JS':
    case 'COCOS_CREATOR':
    case 'EGRET':
      pocoPort.value = '5003';
      break;
    case 'COCOS_2DX_LUA':
      pocoPort.value = '15004';
      break;
    case 'COCOS_2DX_C_PLUS_1':
      pocoPort.value = '18888';
      break;
  }
};
const pocoTypeList = ref([
  {
    name: 'Unity3d',
    value: 'UNITY_3D',
    img: 'Unity',
  },
  {
    name: 'Egret',
    value: 'EGRET',
    img: 'Egret',
  },
  {
    name: 'UE4',
    value: 'UE4',
    img: 'UE4',
  },
  {
    name: 'Cocos2dx-js',
    value: 'COCOS_2DX_JS',
    img: 'Cocos2dx',
  },
  {
    name: 'Cocos2dx-lua',
    value: 'COCOS_2DX_LUA',
    img: 'Cocos2dx',
  },
  {
    name: 'Cocos2dx-c++',
    value: 'COCOS_2DX_C_PLUS_1',
    img: 'Cocos2dx',
  },
  {
    name: 'Cocos-creator',
    value: 'COCOS_CREATOR',
    img: 'Cocos2dx',
  },
]);
const setPocoImgData = () => {
  const imageUrl = props.getImgUrl();
  const img = new Image();
  img.src = imageUrl;
  imgUrl.value = imageUrl;
  const canvasPoco = document.getElementById('debugPocoPic');
  img.onload = function () {
    canvasPoco.width = img.width;
    canvasPoco.height = img.height;
  };
  isShowPocoImg.value = true;
};
const getPoco = (engine) => {
  setPocoImgData();
  emit('getPoco', engine, pocoPort.value);
};
const getImg = (name) => {
  let result;
  try {
    result = img[`../assets/img/${name}.jpg`].default;
  } catch {
    result = img['../assets/img/unName.jpg'].default;
  }
  return result;
};
const touchstartpoco = async (event) => {
  const debugPic = document.getElementById('debugPocoPic');
  const rect = debugPic.getBoundingClientRect();
  let x;
  let y;
  if (props.directionStatus === 0 || props.directionStatus === 180) {
    x = parseInt(
      (event.clientX - rect.left) * (imgWidth / debugPic.clientWidth)
    );
    y = parseInt(
      (event.clientY - rect.top) * (imgHeight / debugPic.clientHeight)
    );
  } else {
    x = parseInt(
      (event.clientX - rect.left) * (imgHeight / debugPic.clientWidth)
    );
    y = parseInt(
      (event.clientY - rect.top) * (imgWidth / debugPic.clientHeight)
    );
  }
  await nextTick(() => {
    pocoTree.value.setCurrentKey(
      findPocoMinSize(findPocoByPoint(pocoData.value, x, y))
    );
  });
  await handlePocoClick(pocoTree.value.getCurrentNode());
};
const findPocoMinSize = (data) => {
  if (data.length === 0) {
    return null;
  }
  let result = data[0];
  for (const i in data) {
    if (data[i].size === result.size) {
      result = data[i];
    }
    if (data[i].size < result.size) {
      result = data[i];
    }
  }
  currentPocoId.value = [result.ele.id];
  return result.ele.id;
};
const findPocoByPoint = (ele, x, y) => {
  const result = [];
  for (const i in ele) {
    let eleStartX;
    let eleStartY;
    let eleEndX;
    let eleEndY;
    if (props.directionStatus === 0 || props.directionStatus === 180) {
      eleStartX =
        ele[i].payload.pos[0] * imgWidth -
        (ele[i].payload.size[0] * imgWidth) / 2;
      eleStartY =
        ele[i].payload.pos[1] * imgHeight -
        (ele[i].payload.size[1] * imgHeight) / 2;
      eleEndX =
        ele[i].payload.pos[0] * imgWidth +
        (ele[i].payload.size[0] * imgWidth) / 2;
      eleEndY =
        ele[i].payload.pos[1] * imgHeight +
        (ele[i].payload.size[1] * imgHeight) / 2;
    } else {
      eleStartX =
        ele[i].payload.pos[0] * imgHeight -
        (ele[i].payload.size[0] * imgHeight) / 2;
      eleStartY =
        ele[i].payload.pos[1] * imgWidth -
        (ele[i].payload.size[1] * imgWidth) / 2;
      eleEndX =
        ele[i].payload.pos[0] * imgHeight +
        (ele[i].payload.size[0] * imgHeight) / 2;
      eleEndY =
        ele[i].payload.pos[1] * imgWidth +
        (ele[i].payload.size[1] * imgWidth) / 2;
    }
    if (x >= eleStartX && x <= eleEndX && y >= eleStartY && y <= eleEndY) {
      result.push({
        ele: ele[i],
        size: (eleEndX - eleStartX) * (eleEndY - eleStartY),
      });
    }
    if (ele[i].children) {
      const childrenResult = findPocoByPoint(ele[i].children, x, y);
      if (childrenResult.length > 0) {
        result.push.apply(result, childrenResult);
      }
    }
  }
  return result;
};
const handlePocoClick = (data) => {
  if (data !== null) {
    pocoDetail.value = data.payload;
    printPoco(data.payload);
  }
};
const printPoco = (data) => {
  const canvas = document.getElementById('debugPocoPic');
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  const eleStartX = data.pos[0] * imgWidth - (data.size[0] * imgWidth) / 2;
  const eleStartY = data.pos[1] * imgHeight - (data.size[1] * imgHeight) / 2;
  const a = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  const c = Math.round(Math.random() * 255);
  g.fillStyle = `rgba(${a}, ${b}, ${c}, 0.6)`;
  g.fillRect(
    eleStartX * (canvas.width / imgWidth),
    eleStartY * (canvas.height / imgHeight),
    data.size[0] * imgWidth * (canvas.width / imgWidth),
    data.size[1] * imgHeight * (canvas.height / imgHeight)
  );
};
let treeId = 1;
const setPocoTreeId = (data) => {
  for (const i in data) {
    data[i].id = treeId;
    treeId++;
    if (data[i].children) {
      setPocoTreeId(data[i].children, treeId);
    }
  }
};
const findBestPoco = (elementDetail) => {
  const result = [];
  if (elementDetail.name) {
    result.push(
      `poco("${elementDetail.name}")${
        elementDetail.index ? `[${elementDetail.index - 1}]` : ''
      }`
    );
  }
  if (elementDetail.name && elementDetail.type) {
    result.push(
      `poco(name="${elementDetail.name}", type="${elementDetail.type}")`
    );
  }
  return result;
};
const findBestXpathForPoco = (elementDetail) => {
  const result = [];
  if (elementDetail.name) {
    result.push(`//*[@name='${elementDetail.name}']`);
  }
  if (elementDetail.name && elementDetail.type) {
    result.push(
      `//*[@name='${elementDetail.name}' and @type='${elementDetail.type}']`
    );
  }
  return result;
};
const transferPoco = (data, xpath) => {
  for (const i in data) {
    let tagCount = 0;
    let siblingIndex = 0;
    let indexXpath;
    for (const j in data) {
      if (data[j].name === data[i].name) {
        tagCount++;
      }
      if (i == j) {
        siblingIndex = tagCount;
      }
    }
    if (tagCount == 1) {
      indexXpath = `${xpath}/${data[i].name}`;
    } else {
      data[i].payload.index = siblingIndex;
      indexXpath = `${xpath}/${data[i].name}[${siblingIndex}]`;
    }
    data[i].payload.xpath = indexXpath;
    if (data[i].children && data[i].children.length > 0) {
      data[i].children = transferPoco(data[i].children, indexXpath);
    }
  }
  return data;
};
const setPocoData = (data) => {
  pocoData.value = [];
  const list = [];
  list.push(data);
  pocoData.value = transferPoco(list, '');
  setPocoTreeId(pocoData.value, treeId);
  currentPocoId.value = [1];
};
const element = ref({
  id: null,
  moduleId: 0,
  eleName: '',
  eleType: 'image',
  eleValue: '',
  projectId: 0,
});
const toAddElement = (eleType, eleValue) => {
  if (props.project) {
    element.value.eleType = eleType;
    element.value.eleValue = eleValue;
    dialogElement.value = true;
  }
};
const copy = (value) => {
  emit('copy', value);
};
const setSize = (width, height) => {
  imgWidth = width;
  imgHeight = height;
};
defineExpose({ setPocoData, setSize });
</script>

<template>
  <div>
    <el-dialog
      v-model="dialogElement"
      :title="$t('elements.eleInfo')"
      width="600px"
    >
      <element-update
        v-if="dialogElement"
        :project-id="project['id']"
        :element-id="0"
        :element-obj="element"
        @flush="dialogElement = false"
      />
    </el-dialog>
    <div style="margin-bottom: 10px; display: flex">
      <el-select v-model="selectPocoType" size="mini" @change="switchPocoType">
        <el-option
          v-for="item in pocoTypeList"
          :key="item.name"
          :value="item.value"
          :label="item.name"
        >
          <div style="display: flex; align-items: center">
            <el-avatar
              style="margin-right: 10px"
              :size="28"
              :src="getImg(item.img)"
              shape="square"
            ></el-avatar>
            {{ item.name }}
          </div>
        </el-option>
      </el-select>
      <el-input
        v-model="pocoPort"
        placeholder="Default connect port"
        style="margin-left: 10px; width: 200px"
        size="mini"
      ></el-input>
      <el-button
        style="margin-left: 10px"
        type="primary"
        :loading="pocoLoading || !isDriverFinish"
        size="mini"
        :disabled="selectPocoType.length === 0"
        @click="getPoco(selectPocoType)"
        >{{ $t('androidRemoteTS.code.getPoco') }}
      </el-button>
      <el-link
        style="position: absolute; right: 20px"
        type="primary"
        href="https://poco.readthedocs.io/en/latest/source/doc/integration.html"
        target="_blank"
      >
        {{ $t('androidRemoteTS.code.pocoSDK') }}
      </el-link>
    </div>
    <el-row v-show="isShowPocoImg" :gutter="10">
      <el-col :span="8">
        <el-card shadow="hover">
          <div
            :style="
              'width: 100%;background-image: url(' +
              imgUrl +
              ');background-size: 100% 100%;'
            "
          >
            <canvas id="debugPocoPic" @mousedown="touchstartpoco"></canvas>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div style="height: 660px">
            <el-scrollbar class="element-tree-scrollbar" style="height: 100%">
              <el-tree
                ref="pocoTree"
                :indent="13"
                :default-expanded-keys="currentPocoId"
                node-key="id"
                style="margin-top: 10px; margin-bottom: 20px"
                :highlight-current="true"
                :accordion="true"
                :data="pocoData"
                @node-click="handlePocoClick"
              >
                <template #default="{ node, data }">
                  <div v-if="data.payload" style="margin-right: 5px">
                    <el-icon
                      v-if="
                        data.payload.type === 'Root' ||
                        data.payload.type === 'Scene'
                      "
                      :size="15"
                      style="margin-top: 3px; color: #67c23a"
                    >
                      <Operation />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Node'"
                      :size="15"
                      style="margin-top: 3px; color: #67c23a"
                    >
                      <Share />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Button'"
                      :size="15"
                      style="margin-top: 3px; color: #409eff"
                    >
                      <HelpFilled />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Layer'"
                      :size="15"
                      style="margin-top: 3px; color: #409eff"
                    >
                      <Coin />
                    </el-icon>
                    <el-icon
                      v-if="
                        data.payload.type === 'Image' ||
                        data.payload.type === 'Sprite'
                      "
                      :size="15"
                      style="margin-top: 3px; color: #67c23a"
                    >
                      <Picture />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Camera'"
                      :size="15"
                      style="margin-top: 3px; color: #409eff"
                    >
                      <VideoCamera />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Canvas'"
                      :size="15"
                      style="margin-top: 3px; color: #409eff"
                    >
                      <FullScreen />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Widget'"
                      :size="15"
                      style="margin-top: 3px; color: #409eff"
                    >
                      <Menu />
                    </el-icon>
                    <el-icon
                      v-if="
                        data.payload.type === 'Text' ||
                        data.payload.type.indexOf('Label') !== -1
                      "
                      :size="15"
                      style="margin-top: 3px; color: #e6a23c"
                    >
                      <List />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'ProgressBar'"
                      :size="15"
                      style="margin-top: 3px; color: #e6a23c"
                    >
                      <MoreFilled />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'GameObject'"
                      :size="15"
                      style="margin-top: 3px; color: #f56c6c"
                    >
                      <HomeFilled />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'Game'"
                      :size="15"
                      style="margin-top: 3px; color: #f56c6c"
                    >
                      <Headset />
                    </el-icon>
                    <el-icon
                      v-if="data.payload.type === 'TextField'"
                      :size="15"
                      style="margin-top: 3px; color: #f56c6c"
                    >
                      <Edit />
                    </el-icon>
                  </div>
                  <span style="font-size: 14px">{{ data.name }}</span>
                </template>
              </el-tree>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div style="height: 660px; padding-bottom: 60px">
            <div
              v-if="project && project['id']"
              style="text-align: center; margin-bottom: 10px"
            >
              <el-button
                :disabled="pocoDetail === null"
                plain
                size="small"
                type="primary"
                round
                @click="toAddElement('poco', '')"
                >{{ $t('androidRemoteTS.code.addControls') }}
              </el-button>
            </div>
            <div v-else>
              <el-alert
                style="margin-bottom: 10px"
                :title="$t('androidRemoteTS.code.titleMessage')"
                type="info"
                show-icon
                close-text="Get!"
              />
              <el-select
                v-model="project"
                style="width: 100%"
                size="mini"
                value-key="id"
                :placeholder="$t('androidRemoteTS.code.chooseProject')"
              >
                <el-option
                  v-for="item in projectList"
                  :key="item.id"
                  :value="item"
                  :label="item['projectName']"
                >
                  <div style="display: flex; align-items: center">
                    <el-avatar
                      style="margin-right: 10px"
                      :size="32"
                      :src="
                        item['projectImg'].length > 0
                          ? item['projectImg']
                          : defaultLogo
                      "
                      shape="square"
                    ></el-avatar>
                    {{ item['projectName'] }}
                  </div>
                </el-option>
              </el-select>
            </div>
            <el-scrollbar style="height: 100%" class="element-tree-scrollbar">
              <el-form
                v-if="pocoDetail !== null"
                label-position="left"
                class="element-table"
                label-width="100px"
              >
                <el-form-item
                  v-if="pocoDetail['name']"
                  label="name"
                  @click="copy(JSON.stringify(pocoDetail['name']))"
                >
                  <span>{{ pocoDetail['name'] }}</span>
                </el-form-item>
                <el-form-item :label="$t('androidRemoteTS.code.pocoRecommend')">
                  <el-table
                    stripe
                    :empty-text="$t('androidRemoteTS.code.pocoNull')"
                    border
                    :data="findBestPoco(pocoDetail)"
                    :show-header="false"
                  >
                    <el-table-column>
                      <template #default="scope">
                        <span
                          style="cursor: pointer"
                          @click="copy(scope.row)"
                          >{{ scope.row }}</span
                        >
                        <el-icon
                          v-if="project && project['id']"
                          color="green"
                          size="16"
                          style="
                            vertical-align: middle;
                            margin-left: 10px;
                            cursor: pointer;
                          "
                          @click="toAddElement('poco', scope.row)"
                        >
                          <Pointer />
                        </el-icon>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
                <el-form-item :label="$t('androidRemoteTS.code.xpath')">
                  <el-table
                    stripe
                    :empty-text="$t('androidRemoteTS.code.xpathNull')"
                    border
                    :data="findBestXpathForPoco(pocoDetail)"
                    :show-header="false"
                  >
                    <el-table-column>
                      <template #default="scope">
                        <span
                          style="cursor: pointer"
                          @click="copy(scope.row)"
                          >{{ scope.row }}</span
                        >
                        <el-icon
                          v-if="project && project['id']"
                          color="green"
                          size="16"
                          style="
                            vertical-align: middle;
                            margin-left: 10px;
                            cursor: pointer;
                          "
                          @click="toAddElement('xpath', scope.row)"
                        >
                          <Pointer />
                        </el-icon>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
                <el-form-item
                  :label="$t('androidRemoteTS.code.absolutePath')"
                  style="cursor: pointer"
                >
                  <span @click="copy(pocoDetail['xpath'])">{{
                    pocoDetail['xpath']
                  }}</span>
                  <el-icon
                    v-if="project && project['id']"
                    color="green"
                    size="16"
                    style="
                      vertical-align: middle;
                      margin-left: 10px;
                      cursor: pointer;
                    "
                    @click="toAddElement('xpath', pocoDetail['xpath'])"
                  >
                    <Pointer />
                  </el-icon>
                </el-form-item>
                <div
                  v-for="key in Object.keys(pocoDetail)"
                  style="cursor: pointer"
                >
                  <el-form-item
                    v-if="key !== 'name' && key !== 'xpath'"
                    :label="key"
                    @click="copy(JSON.stringify(pocoDetail[key]))"
                  >
                    <span>{{ pocoDetail[key] }}</span>
                  </el-form-item>
                </div>
              </el-form>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card v-show="!isShowPocoImg" style="height: 100%">
      <el-result
        icon="info"
        :title="$t('androidRemoteTS.code.hintText')"
        :sub-title="$t('androidRemoteTS.code.getPocoSDKMessage')"
      >
      </el-result>
    </el-card>
  </div>
</template>

<style>
#debugPocoPic {
  width: 100%;
  height: auto;
}
</style>
