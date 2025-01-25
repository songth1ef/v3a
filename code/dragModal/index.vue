<template>
  <div>
    <a-modal
      :class="modalId"
      v-model:open="modelValue.open"
      :confirm-loading="modelValue.loading"
      :width="modelValue.width"
      @ok="emit('sure')"
      centered
      :footer="modelValue.noFooter ? null : undefined"
    >
      <template #title>
        <div
          class="border-b border-[#d7d7d7] border-solid border-x-0 border-t-0 py-[8px] w-full cursor-move"
          ref="modalTitleRef"
          :style="modelValue.disableDrag ? 'pointer-events: none' : ''"
        >
          {{ modelValue.titleText }}
        </div>
      </template>
      <template #modalRender="{ originVNode }">
        <div :style="transformStyle">
          <component :is="originVNode" />
        </div>
      </template>
      <div>
        <div class="h-[0]! opacity-0 overflow-hidden">
          <a-input ref="fakeInput" class="h-[0]"></a-input>
        </div>
        <slot></slot>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { useDraggable } from '@vueuse/core';
import type { CSSProperties } from 'vue';
import { computed, ref, watch, watchEffect, toRefs, nextTick, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
  },
});
const { modelValue } = toRefs(props);

const modalId = ref(`drag-modal-${Math.random().toString(36).substr(2, 9)}`);

const emit = defineEmits(['update:modelValue', 'sure']);
// const showModal = () => {
//   modelValue.value.open = true;
//   emit('update:modelValue', modelValue.value);
// };

const fakeInput = ref(null);
watch(
  () => modelValue.value.open,
  isOpen => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (fakeInput.value) {
        nextTick(() => {
          fakeInput.value.focus();
        });
      } else {
        setTimeout(() => {
          fakeInput.value.focus();
        }, 0);
      }
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  },
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && modelValue.value.open) {
    modelValue.value.open = false;
    emit('update:modelValue', modelValue.value); // 执行关闭弹窗逻辑
  }
};

// 拖拽
const modalTitleRef = ref<HTMLElement>(null);
const { x, y, isDragging } = useDraggable(modalTitleRef);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startedDrag = ref(false);
const transformX = ref(0);
const transformY = ref(0);
const preTransformX = ref(0);
const preTransformY = ref(0);
const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
watch([x, y], () => {
  if (!startedDrag.value) {
    startX.value = x.value;
    startY.value = y.value;
    const bodyRect = document.body.getBoundingClientRect();
    const titleRect = modalTitleRef.value.getBoundingClientRect();
    dragRect.value.right = bodyRect.width - titleRect.width;
    dragRect.value.bottom = bodyRect.height - titleRect.height;
    preTransformX.value = transformX.value;
    preTransformY.value = transformY.value;
  }
  startedDrag.value = true;
});
watch(isDragging, () => {
  if (!isDragging) {
    startedDrag.value = false;
  }
});
watchEffect(() => {
  if (startedDrag.value) {
    transformX.value =
      preTransformX.value +
      Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
      startX.value;
    transformY.value =
      preTransformY.value +
      Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
      startY.value;
  }
});
const transformStyle = computed<CSSProperties>(() => {
  return {
    transform: `translate(${transformX.value}px, ${transformY.value}px)`,
  };
});

defineExpose({ modalId });
</script>
<style lang="less" scoped></style>
