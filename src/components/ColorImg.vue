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
const props = defineProps({
  src: String,
  color: String,
  className: String,
  width: String | Number,
  height: String | Number,
});
</script>

<template>
  <div
    :class="['colorImg']"
    :style="{
      maskImage: `url(${src})`,
      backgroundColor: color || '#000',
      width: width + 'px',
      height: height + 'px',
    }"
  />
</template>

<style scoped lang="less">
.colorImg {
  display: inline-block;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
}
</style>
