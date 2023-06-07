<script setup>
import axios from '@/http/axios';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  dataToEdit: Object,
  isAdmin: Boolean,
  projectMap: Object,
});

const updateFormModel = ref(false);
watch(
  () => props.dataToEdit,
  (val) => {
    if (val) updateFormModel.value = { ...val };
    else updateFormModel.value = false;
  }
);
const emit = defineEmits(['save', 'abort']);
const { t: $t } = useI18n();

const getImg = (name) => {
  const img = import.meta.globEager('./../assets/img/*');
  let result;
  try {
    result = img[`./../assets/img/${name}.jpg`].default;
  } catch {
    result = img['./../assets/img/unName.jpg'].default;
  }
  return result;
};

const updateForm = ref(null);
const submit = () => {
  updateForm.value.validate((valid) => {
    if (valid) {
      emit('save', updateFormModel.value);
    }
  });
};
const queryDefault = (type, scene) => {
  if (!scene || !type) return;
  axios
    .get('/controller/alertRobots/findDefaultTemplate', {
      params: {
        type,
        scene,
      },
    })
    .then((resp) => {
      updateFormModel.value.template = resp.data ? resp.data : ' ';
    })
    .catch(() => {
      updateFormModel.value.template = ' ';
    });
};
</script>

<script>
const robotList = [
  { name: '钉钉群机器人', value: 1, img: 'DingTalk' },
  { name: '企业微信机器人', value: 2, img: 'WeChat' },
  { name: '飞书群机器人', value: 3, img: 'FeiShu' },
  { name: '友空间机器人', value: 4, img: 'You' },
  { name: 'Telegram Bot', value: 5, img: 'Telegram' },
  { name: 'LINE Notify', value: 6, img: 'LineNotify' },
  { name: 'Slack Bot', value: 7, img: 'SlackBot' },
  { name: 'Webhook', value: 8, img: '' },
];
const sceneList = [
  { name: 'robot.sceneList.testsuite', value: 'testsuite' },
  { name: 'robot.sceneList.summary', value: 'summary' },
  { name: 'robot.sceneList.agent', value: 'agent' },
];
const robotMap = robotList.reduce((map, val) => {
  map[val.value] = val.name;
  return map;
}, {});
const sceneMap = sceneList.reduce((map, val) => {
  map[val.value] = val.name;
  return map;
}, {});
export default {
  robotList,
  robotMap,
  sceneList,
  sceneMap,
};
</script>

<template>
  <el-dialog
    :model-value="updateFormModel"
    :append-to-body="true"
    :title="$t('robot.ui.addOrEdit')"
    width="600px"
    @close="emit('abort')"
  >
    <el-form
      ref="updateForm"
      :model="updateFormModel"
      size="small"
      class="demo-table-expand"
      label-width="90px"
      label-position="left"
    >
      <el-form-item
        prop="name"
        :label="$t('robot.name')"
        :rules="{
          required: true,
          message: $t('robot.validate.nameNoNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="updateFormModel.name"
          :placeholder="$t('robot.robotNamePlaceholder')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="scene"
        :label="$t('robot.scene')"
        :rules="{
          required: true,
          message: $t('robot.validate.sceneNoNull'),
          trigger: 'blur',
        }"
      >
        <el-select v-model="updateFormModel.scene" style="width: 100%">
          <el-option
            v-for="item in sceneList"
            :key="item.value"
            :value="item.value"
            :label="$t(item.name)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="isAdmin"
        prop="projectId"
        :label="$t('robot.projectId')"
      >
        <el-select
          v-model="updateFormModel.projectId"
          :clearable="true"
          :placeholder="$t('robot.projectIdPlaceholder')"
          style="width: 100%"
        >
          <el-option
            v-for="val in projectMap"
            :key="val.id"
            :value="val.id"
            :label="val.projectName"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('robot.robotType')"
        :rules="{
          required: true,
          message: $t('robot.validate.robotTypeNoNull'),
          trigger: 'blur',
        }"
      >
        <el-select
          v-model="updateFormModel.robotType"
          style="width: 100%"
          :placeholder="$t('robot.robotTypePlaceholder')"
        >
          <el-option
            v-for="item in robotList"
            :key="item.name"
            :value="item.value"
            :label="item.name"
            :disabled="item['disabled']"
          >
            <div style="display: flex; align-items: center">
              <el-avatar
                style="margin-right: 10px"
                :size="30"
                :src="getImg(item.img)"
                shape="square"
              ></el-avatar>
              {{ item.name }}
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('robot.robotToken')"
        prop="robotToken"
        :rules="{
          required: true,
          message: $t('robot.validate.robotTokenNoNull'),
          trigger: 'blur',
        }"
      >
        <el-input
          v-model="updateFormModel.robotToken"
          :placeholder="$t('robot.robotTokenPlaceholder')"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('robot.robotSecret')" prop="robotSecret">
        <el-input
          v-model="updateFormModel.robotSecret"
          :placeholder="$t('robot.robotSecretPlaceholder')"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('robot.muteRule')" prop="muteRule">
        <el-input
          v-if="!!updateFormModel.muteRule"
          v-model="updateFormModel.muteRule"
          :placeholder="$t('robot.robotSecretPlaceholder')"
        ></el-input>
        <el-tag v-else type="info" size="small" style="margin-right: 10px">{{
          $t('robot.consts.nomute')
        }}</el-tag>
        <el-dropdown
          size="small"
          split-button
          trigger="click"
          @command="(cmd) => (updateFormModel.muteRule = cmd)"
          >{{ $t('robot.ui.commonMuteRules')
          }}<template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="">
                {{ $t('robot.consts.nomute') }}</el-dropdown-item
              >
              <el-dropdown-item divided command="#{true}">
                {{ $t('robot.consts.mute') }}</el-dropdown-item
              >
              <el-dropdown-item
                command="#{now.DAY_OF_WEEK == 7 || now.DAY_OF_WEEK == 1}"
                >{{ $t('robot.consts.muteWeekend') }}</el-dropdown-item
              >
              <el-dropdown-item
                command="#{now.HOUR_OF_DAY < 8 || now.HOUR_OF_DAY > 17}"
                >{{ $t('robot.consts.muteNonworktime') }}</el-dropdown-item
              >
              <template
                v-if="
                  updateFormModel.scene == 'testsuite' ||
                  updateFormModel.scene == 'summary'
                "
              >
                <el-dropdown-item command="#{warn == 0 && fail == 0}">{{
                  $t('robot.consts.muteNoerr')
                }}</el-dropdown-item>
                <el-dropdown-item
                  command="#{(now.DAY_OF_WEEK == 7 || now.DAY_OF_WEEK == 1) && warn == 0 && fail == 0}"
                  >{{ $t('robot.consts.muteWeekendNoerr') }}</el-dropdown-item
                >
                <el-dropdown-item
                  command="#{(now.HOUR_OF_DAY < 8 || now.HOUR_OF_DAY > 17) && warn == 0 && fail == 0}"
                  >{{
                    $t('robot.consts.muteNonworktimeNoerr')
                  }}</el-dropdown-item
                >
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-form-item>
      <el-form-item :label="$t('robot.template')" prop="template">
        <el-input
          v-if="!!updateFormModel.template"
          v-model="updateFormModel.template"
          type="textarea"
          rows="8"
        ></el-input>
        <el-tag v-else type="info" size="small" style="margin-right: 10px">{{
          $t('robot.consts.defaultTemplate')
        }}</el-tag>
        <el-button
          v-if="!!updateFormModel.template"
          size="mini"
          @click="updateFormModel.template = ''"
          >{{ $t('robot.ui.defaultTemplate') }}</el-button
        >
        <el-button
          v-else
          size="mini"
          @click="
            queryDefault(updateFormModel.robotType, updateFormModel.scene)
          "
          >{{ $t('robot.ui.custom') }}</el-button
        >
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button size="small" type="primary" @click="submit">{{
        $t('modulesTS.sure')
      }}</el-button>
    </div>
  </el-dialog>
</template>
