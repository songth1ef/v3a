<template>
  <div>
    <a-cascader
      size="large"
      class="h-[40px] search-multiple"
      v-model:value="localValue"
      v-loading="loading"
      :multiple="multiple"
      :placeholder="$t('pages.site.search.street.placeholder')"
      :options="streetOptions"
      @change="streetHandleChange"
      :show-search="{ streetFilter }"
      max-tag-count="responsive"
    >
      <template #tagRender="data">
        <a-tag :key="data.value" color="blue">{{ data.label }}</a-tag>
      </template>
    </a-cascader>
  </div>
</template>

<script setup lang="ts">
import { queryCityTreeThree } from '@/api/rid/sys/street';
import { inject, onMounted, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
  },
  multiple: Boolean,
});

// const { modelValue } = toRefs(props);

const streetOptions: any = ref([]);
const streetFilter: any = (inputValue, path) => {
  return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
};
const streetHandleChange = value => {
  if (value) {
    flatValueAndApart(value);
  }
};

onMounted(() => {
  getOptions();
});

const message: any = inject('message');
const loading = ref(true);
const localValue = ref(null);
const getOptions = () => {
  streetOptions.value = [];
  queryCityTreeThree('?name=')
    .then(res => {
      res.data.forEach(city => {
        // 构建城市层级数据
        const cityNode = {
          level: 'city',
          label: city.cityName,
          value: city.cityId,
          children: city.districts && city.districts.length ? [] : null,
        };
        streetOptions.value.push(cityNode);

        // 如果存在区级数据
        if (city.districts) {
          city.districts.forEach(district => {
            const districtNode = {
              level: 'district',
              label: district.districtName,
              value: district.districtId,
              children: district.streets && district.streets.length ? [] : null,
            };
            cityNode.children.push(districtNode);

            // 如果存在街道数据
            if (district.streets) {
              district.streets.forEach(street => {
                const streetNode = {
                  level: 'street',
                  label: street.streetName,
                  value: street.streetId,
                };
                districtNode.children.push(streetNode);
              });
            }
          });
        }
      });
      console.log(props.multiple);

      if (!props.multiple) {
        // 去除没有街道选项的
        for (let cIndex = streetOptions.value.length - 1; cIndex >= 0; cIndex--) {
          const city = streetOptions.value[cIndex];
          if (!city.children || city.children.length == 0) {
            streetOptions.value.splice(cIndex, 1);
          } else {
            for (let dIndex = city.children.length - 1; dIndex >= 0; dIndex--) {
              const districts = city.children[dIndex];
              if (!districts.children || districts.children.length == 0) {
                city.children.splice(dIndex, 1);
              }
            }
          }
        }
        // 执行两次防止市空值
        for (let cIndex = streetOptions.value.length - 1; cIndex >= 0; cIndex--) {
          const city = streetOptions.value[cIndex];
          if (!city.children || city.children.length == 0) {
            streetOptions.value.splice(cIndex, 1);
          } else {
            for (let dIndex = city.children.length - 1; dIndex >= 0; dIndex--) {
              const districts = city.children[dIndex];
              if (!districts.children || districts.children.length == 0) {
                city.children.splice(dIndex, 1);
              }
            }
          }
        }
      }
    })
    .catch(err => {
      console.log(err);
      message.error(err.message);
    })
    .finally(() => {
      loading.value = false;
    });
};

const emit = defineEmits(['update:modelValue']);

const flatValueAndApart = value => {
  const flatValue = new Set(JSON.parse(JSON.stringify(value)).flat());
  // console.log(flatValue);
  const target = {
    cityId: [],
    districtId: [],
    streetId: [],
  };
  flatValue.forEach(item => {
    streetOptions.value.forEach(city => {
      if (city.value === item) {
        target.cityId.push(item);
      }
      if (city.children) {
        city.children.forEach(district => {
          if (district.value === item) {
            target.districtId.push(item);
          }
          if (district.children) {
            district.children.forEach(street => {
              if (street.value === item) {
                target.streetId.push(item);
              }
            });
          }
        });
      }
    });
  });
  if (props.multiple) {
    emit('update:modelValue', target);
    console.log(target);
  } else {
    emit('update:modelValue', target.streetId[0]);
    console.log(target.streetId);
  }
};

defineExpose({ getOptions });
</script>

<style lang="less" scoped></style>
