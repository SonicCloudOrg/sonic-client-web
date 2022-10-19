<script setup>
/*
 *  Copyright (C) [SonicCloudOrg] Sonic Project
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import {shallowRef, reactive, computed, defineEmits} from "vue";
import {Codemirror} from 'vue-codemirror'
import {oneDark} from '@codemirror/theme-one-dark'
import {java} from '@codemirror/lang-java'
import {python} from '@codemirror/lang-python'

const props = defineProps({
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
    default: false
  },
  /** 是否展示顶部工具栏，默认不展示 */
  showToolBar: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(["ready", "change", "save", "update:code", "update:language", "update:theme", "update:tabSize"])

const themes = {oneDark}
const languages = {
  Groovy: java(),
  Python: python()
  // ... 支持语言高亮扩展
}

const view = shallowRef()
const config = reactive({
  disabled: props?.disabled || false,
  indentWithTab: true,
  tabSize: props?.tabSize || 2,
  autofocus: false,
  placeholder: props?.placeholder || 'Code goes here...',
  language: props?.language || 'Groovy',
  theme: props?.theme || 'oneDark',
  phrases: 'en-us'
})

const extensions = computed(() => {
  const result = []
  result.push(languages[config.language])
  if (themes[config.theme]) {
    result.push(themes[config.theme])
  }
  return result
})

const getCodemirrorStates = (view) => {
  const state = view.state
  const ranges = state.selection.ranges
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
  const cursor = ranges[0].anchor
  const length = state.doc.length
  const lines = state.doc.lines
  return {
    selected,
    cursor,
    length,
    lines
  }
}

const state = reactive({
  lines: null,
  cursor: null,
  selected: null,
  length: null
})

const handleStateUpdate = (viewUpdate) => {
  const {lines, cursor, selected, length} = getCodemirrorStates(viewUpdate)
  // selected
  state.selected = selected
  state.cursor = cursor
  // length
  state.length = length
  state.lines = lines
}

// defineExpose({
//   getCodemirrorStates,
// });

</script>

<template>
  <div class="toolbar" v-if="showToolBar">
    <div class="item">
      <label for="language">Language:</label>
      <el-select v-model="config.language" size="mini" placeholder="请选择" @change="emit('update:language', $event)">
        <el-option v-for="item in Object.keys(languages)" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label for="theme">Theme:</label>
      <el-select v-model="config.theme" size="mini" placeholder="请选择" @change="emit('update:theme', $event)">
        <el-option v-for="item in ['default', ...Object.keys(themes)]" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label for="tabSize">TabSize:</label>
      <el-select v-model="config.tabSize" size="mini" placeholder="请选择" @change="emit('update:tabSize', $event)">
        <el-option v-for="item in [2, 4, 6, 8]" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <el-button size="mini" type="primary" @click="emit('save')">保存</el-button>
    </div>
  </div>
  <Codemirror
      class="codemirror"
      ref="cm"
      v-model="code"
      :autofocus="config.autofocus"
      :placeholder="config.placeholder"
      :indentWithTab="config.indentWithTab"
      :tabSize="config.tabSize"
      :disabled="config.disabled"
      :style="{ height: height || '300px' }"
      :extensions="extensions"
      @update="handleStateUpdate"
      @ready="emit('ready', $event)"
      @change="emit('update:code', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
  />
  <div class="footer" v-if="showFooter">
    <div class="infos">
      <span class="item">TIPS: 编辑后记得保存哦</span>
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
  height: 3rem;
  padding: 0 10px;
  background: #F9F9F9;
  border: 1px solid #DDDDE1;

  .item {
    margin-left: 30px;
    display: inline-flex;
    align-items: center;

    label {
      display: inline-block;
      margin-right: 0.4em;
    }
  }

  .item:first-child {
    margin: unset;
  }
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