<template>
  <a-input
    ref="inputRef"
    :value="modelValue"
    :type="type"
    :size="size"
    :maxlength="maxlength"
    :show-count="showCount"
    :placeholder="placeholder"
    @input="updateValue($event.target.value)"
  />
</template>

<script setup lang="ts">
import { XSSDefense } from '@/utils/common/validate';
import { nextTick, ref, toRefs } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  modelValue: {
    type: [String, Number],
  },
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
  noAllowSpace: Boolean,
});

const { modelValue } = toRefs(props);
const inputRef = ref();
const emit = defineEmits(['update:modelValue']);
const updateValue = (value: string) => {
  emit('update:modelValue', sanitize(value));
};
const sanitize = input => {
  if (props.keepNumber) {
    return XSSDefense(input.replace(/[^0-9]/g, '')); // 只保留数字
  }
  if (props.noAllowSpace) {
    return XSSDefense(input.replace(/\s+/g, '')); // 禁止空格
  }
  return XSSDefense(input);
};
const focus = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};
defineExpose({ focus });
</script>

<style lang="less" scoped></style>
