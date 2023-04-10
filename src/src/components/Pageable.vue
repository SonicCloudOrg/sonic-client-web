<script setup>
const props = defineProps({
  pageSize: Number,
  currentPage: Number,
  total: Number,
  isPageSet: Boolean,
});
const emit = defineEmits(['change']);
const changePage = (num) => {
  emit('change', num, props.pageSize);
};
const changeSize = (num) => {
  emit('change', props.currentPage, num);
};
</script>

<template>
  <el-pagination
    v-if="isPageSet === true"
    :current-page="currentPage"
    background
    style="text-align: center; margin-top: 20px"
    :page-size="pageSize"
    :page-sizes="[10, 15, 20, 25]"
    layout="sizes, prev, pager, next, jumper, ->, total"
    :total="total"
    @current-change="changePage"
    @size-change="changeSize"
  ></el-pagination>
  <el-pagination
    v-else
    :current-page="currentPage"
    background
    style="text-align: center; margin-top: 20px"
    :page-size="pageSize"
    layout="prev, pager, next, jumper, ->, total"
    :total="total"
    @current-change="changePage"
  ></el-pagination>
</template>
