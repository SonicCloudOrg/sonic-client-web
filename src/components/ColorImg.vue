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
const props = defineProps(
    {
      src: String,
      color: String,
      className: String,
      width: String | Number,
      height: String | Number,
    }
);
</script>
<template>
  <div
    :class="['colorImg', ]"
    :style="{
      maskImage: `url(${src})`,
      backgroundColor: color || '#000',
      width: width+'px',
      height: height+'px',
    }"
  />
</template>
<style scoped lang="less">
  .colorImg{
    display: inline-block;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
  }
</style>
