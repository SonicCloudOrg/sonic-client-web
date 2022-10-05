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

import {ref, shallowRef} from "vue";
import {Codemirror} from 'vue-codemirror'
import {java} from '@codemirror/lang-java'
import {python} from '@codemirror/lang-python'
import {oneDark} from '@codemirror/theme-one-dark'

defineProps({
  code: String,
})

const extensions = [java(), oneDark]
const view = shallowRef()
const handleReady = (payload) => {
  view.value = payload.view
}
// const getCodemirrorStates = () => {
//   const state = view.value.state
//   const ranges = state.selection.ranges
//   const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
//   const cursor = ranges[0].anchor
//   const length = state.doc.length
//   const lines = state.doc.lines
// }

</script>

<template>
  <Codemirror
      v-model="code"
      placeholder="Code goes here..."
      :style="{ height: '400px' }"
      :autofocus="false"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
      @change="log('change', $event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
  />
</template>


<style>
.v-codemirror .ͼ1 .cm-scroller {
  font-family: 'Menlo, Monaco, Consolas,"Courier New", monospace';
}
</style>