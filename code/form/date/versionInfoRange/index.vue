<template>
  <div v-loading="loading">
    <a-range-picker
      :value="arrayValue"
      :size="size"
      :placeholder="placeholder"
      :disabled-date="disabledDate"
      format="YYYY-MM-DD"
      :showToday="false"
      @change="expirationDateChange"
      @panelChange="panelChange"
    >
      <template #dateRender="{ current }">
        <span v-if="versionInfo.some(item => item.date === current.format('YYYY-MM-DD'))">
          <a-popover placement="topLeft" v-if="showInfo">
            <template #content>
              <p>站名：</p>
              <p>经纬度：</p>
            </template>
            <template #title>
              <span>{{ $t('global.date.versionInfo') }}</span>
            </template>
            <div
              class="ant-picker-cell-inner border-solid border-1 border-[var(--green-6)] rounded-[50%]!"
            >
              {{ current.date() }}
            </div>
          </a-popover>
          <div
            v-else
            class="ant-picker-cell-inner border-solid border-1 border-[var(--green-6)] rounded-[50%]!"
          >
            {{ current.date() }}
          </div>
        </span>
        <span class="ant-picker-cell-inner" v-else>
          {{ current.date() }}
        </span>
      </template>
    </a-range-picker>
  </div>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ref, toRefs, watch } from 'vue';
const props = defineProps({
  modelValue: Array,
  size: String,
  placeholder: Array,
  showInfo: Boolean,
});
const { modelValue, placeholder } = toRefs(props);

const arrayValue = ref([]);
watch(modelValue, () => {
  arrayValue.value = modelValue.value
    ? [dayjs(modelValue.value[0]), dayjs(modelValue.value[1])]
    : ['', ''];
});

const disabledDate = () => {
  // 不能选择今天及之前的日期
  // return current && current < new Date();
};
const emit = defineEmits(['update:modelValue']);
const expirationDateChange = value => {
  if (value) {
    console.log(value);

    emit('update:modelValue', [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]);
  } else {
    emit('update:modelValue', null); // 处理清空日期的情况
  }
};
const panelChange = value => {
  getVersionInfo(value[0]);
};

const versionInfo = ref([]);
//获取版本详细 根据中间年月 查询近三月
const loading = ref(false);
const getVersionInfo = (centerDate: Dayjs) => {
  //获取centerDate的近三月
  const startDate = centerDate.subtract(1, 'month');
  const endDate = centerDate.add(1, 'month');
  console.log(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  //从startDate到endDate 中随机选10天 不都是一个月的
  versionInfo.value.push(
    ...Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      date: dayjs(startDate)
        .add(Math.floor(Math.random() * 10), 'day')
        .format('YYYY-MM-DD'),
    })),
  );
  versionInfo.value.push(
    ...Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      date: dayjs(centerDate)
        .add(Math.floor(Math.random() * 10), 'day')
        .format('YYYY-MM-DD'),
    })),
  );
  versionInfo.value.push(
    ...Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      date: dayjs(endDate)
        .add(Math.floor(Math.random() * 10), 'day')
        .format('YYYY-MM-DD'),
    })),
  );

  console.log(versionInfo.value);
  setTimeout(() => {
    if (loading.value) {
      loading.value = false;
    }
  }, 225);
};
defineExpose({
  loading,
  panelChange,
  getVersionInfo,
});
</script>

<style lang="less" scoped></style>
