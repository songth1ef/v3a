<template>
  <a-date-picker
    :value="bindValue"
    :size="size"
    :placeholder="placeholder"
    :disabled-date="disabledDate"
    @change="updateValue"
  />
</template>

<script setup lang="ts">
import moment from 'moment';
import { computed } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  value: String,
  size: String,
  placeholder: String,
  keepNumber: Boolean,
  disabledDate: Function,
});

// const { modelValue } = toRefs(props);
console.log(props.value);
// const bindValue = ref<Dayjs>();
const bindValue = computed(() => {
  const date = moment(props.value); // 将 props.value 转换为 moment 对象

  return {
    $D: date.date(),
    $H: date.hours(),
    $L: date.locale(), // locale 可能需要根据你具体需求调整
    $M: date.month() + 1, // 月份是从0开始的，所以加1
    $W: date.week(), // 周数，可能需要根据具体库进行调整
    $d: date.toDate(), // 原生 Date 对象
    $m: date.minutes(),
    $ms: date.milliseconds(),
    $s: date.seconds(),
    $u: undefined, // 这里可以根据需要设置
    $x: new Proxy({}, {}), // 这里是一个空的 Proxy 对象
    $y: date.year(),
  };
});
console.log(bindValue);

const updateValue = value => {
  console.log(value.$d);

  // emit('update:modelValue', value.$d);
};
</script>

<style lang="less" scoped></style>
