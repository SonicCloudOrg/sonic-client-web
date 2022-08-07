<template>
  <div class="container" ref="containerRef">
    请点击该区域并按下按键
    <input class="input-box" v-model="inputValue" type="text" ref="inputBox" @input="changeInputHandle" :style="inputBoxStyle">
  </div>
  输入内容：{{mockMessage}}
</template>

<script setup>
import { ref, onMounted } from 'vue'

const containerRef = ref(null)
const inputBox = ref(null)
const inputBoxStyle = ref({})
const inputValue = ref('')
let isClickInContainer = false

const mockMessage = ref('')

onMounted(()=> {
  const containerDom = containerRef.value
  const { offsetLeft, offsetTop, clientHeight, clientWidth } = containerDom
  const minX = offsetLeft
  const maxX = offsetLeft + clientWidth
  const minY = offsetTop
  const maxY = offsetTop + clientHeight

  window.addEventListener('click', (event) => {
    const { x: clickX, y: clickY } = event
    if (clickX >= minX && clickX <= maxX && clickY >= minY && clickY <= maxY) {
      isClickInContainer = true
    } else {
      isClickInContainer = false
    }
  })

  containerDom.addEventListener('click', (event) => {
    const { x: clickX, y: clickY } = event
    inputBoxStyle.value = {
      left: clickX - offsetLeft + 'px',
      top: clickY - offsetTop + 'px'
    }
    inputBox.value.focus()
  })
})

const clearInputHandle = () => {
  inputValue.value = ''
}

const changeInputHandle = () => {
  if (inputValue.value) {
    console.log(`changeInputHandle ~ data`, inputValue.value)
    mockMessage.value = mockMessage.value + inputValue.value
    clearInputHandle()
  }
}
</script>

<style scoped>
.container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 375px;
  height: 667px;
  margin: 40px auto;
  border: 2px solid #ccc;
  background-color: rgb(239, 239, 239);
}
.input-box {
  position: absolute;
  border: none;
  background-color: transparent;
  outline:none;
  z-index: -1;
}
</style>
