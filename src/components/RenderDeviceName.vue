<script setup>
const props = defineProps(
    {
      device: Object
    }
);
</script>

<template>
   <span>{{
       (device['nickName'] && device['nickName'].length > 0)
           ? device['nickName']
           : ((device['chiName'] && device['chiName'].length > 0)
               ? device['chiName']
               : ((device['model'] && device['model'].length > 0)
                   ? device['model']
                   : '未知型号'))
     }}</span>
</template>