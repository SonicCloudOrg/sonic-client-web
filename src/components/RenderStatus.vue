<script setup>
import {defineProps, h, render} from "vue";

const props = defineProps(
    {
      status: String,
    }
);
render(() => {
  let type;
  let text;
  switch (props.status) {
    case 'ONLINE':
      type = 'success';
      text = '空闲中';
      break
    case 'OFFLINE':
      type = 'info';
      text = '已离线';
      break
    case "DISCONNECTED":
      type = 'info';
      text = '已断开';
      break
    case "DEBUGGING":
      text = '占用中';
      break
    case "TESTING":
      text = '测试中';
      break
    case "UNAUTHORIZED":
      type = 'danger';
      text = '未授权';
      break
    case "ERROR":
      type = 'warning';
      text = '异常中';
    default :
      type = 'warning';
      text = '加载中';
  }
  return h('el-tag', {type: type, size: 'mini', style: 'float: right'}, text)
}, {}, false)
</script>