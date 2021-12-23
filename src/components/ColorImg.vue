<script setup>
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
