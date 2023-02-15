<script setup>
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const props = defineProps({
  device: Object,
});
</script>

<template>
  <span>{{
    device['nickName'] && device['nickName'].length > 0
      ? device['nickName']
      : device['chiName'] && device['chiName'].length > 0
      ? device['chiName']
      : device['model'] && device['model'].length > 0
      ? device['model']
      : $t('form.unknown')
  }}</span>
</template>
