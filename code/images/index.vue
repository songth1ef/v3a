<template>
  <a-image
    :preview="{ visible: false }"
    :width="width"
    :height="height"
    :src="images[0]"
    @click="visible = true"
  />
  <div style="display: none">
    <a-image-preview-group :preview="{ visible, onVisibleChange: vis => (visible = vis) }">
      <a-image v-for="image in images" :src="image" :key="image" />
    </a-image-preview-group>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
const visible = ref(false);

const props = defineProps<{
  images: string[];
  width?: number;
  height?: number;
}>();

const { images, width, height } = toRefs(props);
</script>

<style lang="less" scoped></style>
