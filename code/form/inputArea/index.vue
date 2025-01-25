<template>
  <a-textarea
    :value="modelValue"
    :type="type"
    :size="size"
    :autoSize="autoSize"
    :maxlength="maxlength"
    :show-count="showCount"
    :placeholder="placeholder"
    @input="updateValue($event.target.value)"
  />
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  modelValue: String,
  type: String,
  size: String,
  placeholder: String,
  maxlength: {
    type: Number,
    default: 999999999999,
  },
  showCount: {
    type: Boolean,
    default: false,
  },
  keepNumber: Boolean,
  minRows: Number,
  maxRows: Number,
});

const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue']);
const updateValue = (value: string) => {
  emit('update:modelValue', sanitize(value));
};
const sanitize = input => {
  if (props.keepNumber) {
    return input.replace(/[^0-9]/g, ''); // 只保留数字
  }
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // 基本的 HTML 转义
};
const autoSize = reactive({
  minRows: props.minRows,
  maxRows: props.maxRows,
});
</script>

<style lang="less" scoped></style>
