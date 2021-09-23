<script setup>
import {ref,defineProps} from "vue";

const props = defineProps({
  label: String,
  place: String,
  index: Number,
  step: Object,
})
const elementList = ref([{id: 1, "eleName": "aa"}])
</script>
<template>
  <el-form-item
      :label="label"
      :rules="[
            { required: true, message: place, trigger: 'change' },
          ]"
      :prop="'elements['+index+']'"
  >
    <el-select
        value-key="id"
        v-model="step.elements[index]"
        :placeholder="place"
    >
      <el-option
          v-for="item in elementList"
          :key="item.id"
          :label="item['eleName']"
          :value="item"
      ></el-option>
      <div style="text-align: center;margin-top: 5px">
        <el-pagination small layout="prev, pager, next" :total="50"></el-pagination>
      </div>
    </el-select>
  </el-form-item>
</template>