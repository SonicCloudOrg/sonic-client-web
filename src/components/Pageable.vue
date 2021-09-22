<script setup>
import {defineProps} from "vue";

defineProps(
    {
      pageData: Object,
      isPageSet: Boolean
    }
);
const emit = defineEmits(["changePage", "changeSize"])
const changePage = (num) => {
  emit("changePage", num)
}
const changeSize = (num) => {
  emit("changeSize", num)
}
</script>
<template>
  <el-pagination
      v-if="isPageSet === true"
      background
      style="text-align: center; margin-top: 20px"
      @current-change="changePage"
      :page-size="pageData.size"
      :current-page="pageData.number + 1"
      :page-sizes="[10, 15, 20, 25]"
      @size-change="changeSize"
      layout="sizes, prev, pager, next, jumper, ->, total"
      :total="pageData['totalElements']"
  ></el-pagination>
  <el-pagination
      v-else
      background
      style="text-align: center; margin-top: 20px"
      @current-change="changePage"
      :page-size="pageData.size"
      :current-page="pageData.number + 1"
      layout="prev, pager, next, jumper, ->, total"
      :total="pageData['totalElements']"
  ></el-pagination>
</template>