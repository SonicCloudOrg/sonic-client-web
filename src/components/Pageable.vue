<script setup>
import {defineProps} from "vue";

const props = defineProps(
    {
      pageSize: Number,
      currentPage: Number,
      total: Number,
      isPageSet: Boolean
    }
);
const emit = defineEmits()
const changePage = (num) => {
  emit("change", num, props.pageSize)
}
const changeSize = (num) => {
  emit("change", props.currentPage, num)
}
</script>
<template>
  <el-pagination
      v-if="isPageSet === true"
      background
      style="text-align: center; margin-top: 20px"
      @current-change="changePage"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      :page-sizes="[10, 15, 20, 25]"
      @size-change="changeSize"
      layout="sizes, prev, pager, next, jumper, ->, total"
      :total="total"
  ></el-pagination>
  <el-pagination
      v-else
      background
      style="text-align: center; margin-top: 20px"
      @current-change="changePage"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      layout="prev, pager, next, jumper, ->, total"
      :total="total"
  ></el-pagination>
</template>