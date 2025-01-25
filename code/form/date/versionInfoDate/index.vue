<template>
  <div class="w-[164px]" v-loading="loading">
    <a-date-picker
      :value="modelValue ? dayjs(modelValue) : null"
      :size="size"
      :placeholder="placeholder"
      :disabled-date="disabledDate"
      format="YYYY-MM-DD"
      :showToday="false"
      :allowClear="allowClear"
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
              class="ant-picker-cell-inner border-solid border-1 border-[var(--primary-color)] rounded-[50%]!"
            >
              {{ current.date() }}
            </div>
          </a-popover>
          <div
            v-else
            class="ant-picker-cell-inner border-solid border-1 border-[var(--primary-color)] rounded-[50%]!"
          >
            {{ current.date() }}
          </div>
        </span>
        <span class="ant-picker-cell-inner" v-else>
          {{ current.date() }}
        </span>
      </template>
    </a-date-picker>
  </div>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { ref, toRefs } from 'vue';
const props = defineProps({
  modelValue: String,
  size: String,
  placeholder: String,
  showInfo: Boolean,
  allowClear: Boolean,
});
const { modelValue } = toRefs(props);

const disabledDate = () => {
  // 不能选择今天及之前的日期
  // return current && current < new Date();
};
const emit = defineEmits(['update:modelValue']);
const expirationDateChange = value => {
  if (value) {
    // console.log(value);
    // console.log(hasTimezone(value));

    // const timezoneOffsetMinutes = value.utcOffset(); // 获取时区偏移量，单位为分钟
    // const timezoneOffsetHours = timezoneOffsetMinutes / 60; // 转换为小时
    // console.log(`当前时区偏移量：UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours}`);

    emit('update:modelValue', value.format('YYYY-MM-DD'));
  } else {
    emit('update:modelValue', null); // 处理清空日期的情况
  }
};

const panelChange = value => {
  console.log(value.format('YYYY-MM'));
  getVersionInfo(value);
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
});
</script>

<style lang="less" scoped></style>
