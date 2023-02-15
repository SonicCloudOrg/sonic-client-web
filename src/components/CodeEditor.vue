<script setup>
/*
 *   sonic-client-web  Front end of Sonic cloud real machine platform.
 *   Copyright (C) 2022 SonicCloudOrg
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  shallowRef,
  reactive,
  computed,
  defineEmits,
  ref,
  onMounted,
} from 'vue';
import { Codemirror } from 'vue-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { useI18n } from 'vue-i18n';
import axios from '../http/axios';
import Pageable from './Pageable.vue';

const { t: $t } = useI18n();
const props = defineProps({
  projectId: Number,
  /** 代码内容 */
  code: String,
  /** 代码高亮语言类型 */
  language: String,
  /** 代码主题 */
  theme: String,
  /** 代码块高度，auto 为自适应高度 */
  height: String,
  /** 代码缩进大小 */
  tabSize: Number,
  /** 是否可编辑 */
  disabled: Boolean,
  /** 文本输入提示 */
  placeholder: String,
  /** 是否展示底部栏，默认不展示 */
  showFooter: {
    type: Boolean,
    default: false,
  },
  /** 是否展示顶部工具栏，默认不展示 */
  showToolBar: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'ready',
  'change',
  'save',
  'update:code',
  'update:language',
  'update:theme',
  'update:tabSize',
]);

const themes = { oneDark };
const languages = {
  Groovy: java(),
  Python: python(),
  // ... 支持语言高亮扩展
};
const themeOptions = [
  {
    label: 'Light',
    value: 'default',
  },
  {
    label: 'Dark',
    value: 'oneDark',
  },
];
const languageOptions = [
  {
    label: 'Groovy (Java) ',
    value: 'Groovy', // 与 languages key 对应
  },
  {
    label: 'Python',
    value: 'Python',
  },
  // ... 支持语言高亮选项
];

const view = shallowRef();
const config = reactive({
  disabled: props?.disabled || false,
  indentWithTab: true,
  tabSize: props?.tabSize || 2,
  autofocus: false,
  placeholder: props?.placeholder || 'Code goes here...',
  language: props?.language || 'Groovy',
  theme: props?.theme || 'oneDark',
  phrases: 'en-us',
});

const extensions = computed(() => {
  const result = [];
  result.push(languages[config.language]);
  if (themes[config.theme]) {
    result.push(themes[config.theme]);
  }
  return result;
});

const getCodemirrorStates = (view) => {
  const { state } = view;
  const { ranges } = state.selection;
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0);
  const cursor = ranges[0].anchor;
  const { length } = state.doc;
  const { lines } = state.doc;
  return {
    selected,
    cursor,
    length,
    lines,
  };
};

const state = reactive({
  lines: null,
  cursor: null,
  selected: null,
  length: null,
});

const handleStateUpdate = (viewUpdate) => {
  const { lines, cursor, selected, length } = getCodemirrorStates(viewUpdate);
  // selected
  state.selected = selected;
  state.cursor = cursor;
  // length
  state.length = length;
  state.lines = lines;
};

const pageData = ref([]);
const pageCurrNum = ref(1);
const name = ref('');
const getScriptList = (pageNum, pSize) => {
  pageCurrNum.value = pageNum || pageCurrNum.value;
  axios
    .get('/controller/scripts/list', {
      params: {
        projectId: props.projectId,
        name: name.value,
        page: pageCurrNum.value,
        pageSize: 5,
      },
    })
    .then((resp) => {
      pageData.value = resp.data;
    });
};
const importReplaceFrom = (s) => {
  emit('update:code', s.content);
  emit('update:language', s.scriptLanguage);
};
const importAddFrom = (s) => {
  emit('update:code', `${props.code}\n${s.content}`);
  emit('update:language', s.scriptLanguage);
};
onMounted(() => {
  getScriptList();
});
</script>

<template>
  <div v-if="showToolBar" class="toolbar">
    <div class="item">
      <label class="toolbar-label" for="language">Language:</label>
      <el-select
        v-model="config.language"
        style="width: 130px"
        size="mini"
        :placeholder="$t('code.placeholder')"
        @change="emit('update:language', $event)"
      >
        <el-option
          v-for="item in languageOptions"
          :key="item.label"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <el-popover placement="top" :width="200" trigger="click">
        <template #reference>
          <el-button size="mini" icon="el-icon-setting">{{
            $t('code.settings')
          }}</el-button>
        </template>
        <div class="form-section">
          <label for="theme">Theme:</label>
          <el-select
            v-model="config.theme"
            style="width: 130px"
            size="mini"
            :placeholder="$t('code.placeholder')"
            @change="emit('update:theme', $event)"
          >
            <el-option
              v-for="item in themeOptions"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <div class="form-section">
          <label for="tabSize">TabSize:</label>
          <el-select
            v-model="config.tabSize"
            style="width: 130px"
            size="mini"
            :placeholder="$t('code.placeholder')"
            @change="emit('update:tabSize', $event)"
          >
            <el-option
              v-for="item in [2, 4, 6, 8]"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </div>
      </el-popover>
      <el-popover placement="left" :width="490" trigger="click">
        <template #reference>
          <el-button size="mini">{{ $t('code.temp') }}</el-button>
        </template>
        <el-table border :data="pageData.content">
          <el-table-column align="center" width="80" property="id" label="id" />
          <el-table-column header-align="center" property="name">
            <template #header>
              <el-input
                v-model="name"
                size="mini"
                :placeholder="$t('code.table.name')"
                @input="getScriptList()"
              />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            width="100"
            property="scriptLanguage"
            :label="$t('code.table.lang')"
          />
          <el-table-column
            align="center"
            width="170"
            :label="$t('code.table.type')"
          >
            <template #default="scope">
              <el-button
                type="primary"
                size="mini"
                @click="importAddFrom(scope.row)"
                >{{ $t('code.table.add') }}</el-button
              >
              <el-button
                type="primary"
                size="mini"
                @click="importReplaceFrom(scope.row)"
                >{{ $t('code.table.replace') }}</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <pageable
          :is-page-set="false"
          :total="pageData['totalElements']"
          :current-page="pageData['number'] + 1"
          :page-size="pageData['size']"
          @change="getScriptList"
        ></pageable>
      </el-popover>
      <el-button size="mini" type="primary" @click="emit('save')">{{
        $t('form.save')
      }}</el-button>
    </div>
  </div>
  <Codemirror
    ref="cm"
    v-model="code"
    class="codemirror"
    :autofocus="config.autofocus"
    :placeholder="config.placeholder"
    :indent-with-tab="config.indentWithTab"
    :tab-size="config.tabSize"
    :disabled="config.disabled"
    :style="{ height: height || '300px' }"
    :extensions="extensions"
    @update="handleStateUpdate"
    @ready="emit('ready', $event)"
    @change="emit('update:code', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  />
  <div v-if="showFooter" class="footer">
    <div class="infos">
      <span class="item">TIPS: {{ $t('code.tip') }}</span>
      <span class="item">Spaces: {{ config.tabSize }}</span>
      <span class="item">Length: {{ state.length }}</span>
      <span class="item">Lines: {{ state.lines }}</span>
      <span class="item">Cursor: {{ state.cursor }}</span>
      <span class="item">Selected: {{ state.selected }}</span>
    </div>
  </div>
</template>

<style lang="less">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 10px 10px 10px;
  background: #f9f9f9;
  border: 1px solid #dddde1;

  .item {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 10px;
  }
}

.form-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.form-section:first-child {
  margin-top: unset;
}

.toolbar-label {
  display: inline-block;
  margin: 0 0.4em;
}

.v-codemirror .ͼ1 .cm-scroller {
  font-family: Consolas, 'Courier New', monospace;
}

.footer {
  position: relative;
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  color: #fff;
  border-top: none;
  background: #409eff;

  .infos {
    position: absolute;
    right: 14px;

    .item {
      margin-left: 14px;
      display: inline-block;
      font-feature-settings: 'tnum';
    }
  }
}
</style>
