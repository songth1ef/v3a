<template>
  <div class="flex flex-col flex-grow" v-loading="tableSet.loading">
    <a-table
      class="flex flex-col flex-grow relative"
      ref="tableRef"
      :dataSource="tableData"
      :columns="
        tableSet.columns.filter(
          item =>
            (item.resizable =
              true && item.width
                ? item.width
                : (item.width = 120) && item.minWidth
                ? item.minWidth
                : (item.minWidth = 60)),
        )
      "
      :pagination="false"
      :scroll="{ x: 800, y: tableSet.height }"
      :row-selection="rowSelection"
      @resizeColumn="handleResizeColumn"
      @change="onTableChange"
      :rowClassName="rowClassName"
      :customRow="onRowClick"
    >
      <!-- 自定义表头 -->
      <template #headerCell="{ column }">
        <slot name="headerCell" :column="column"></slot>
        <template v-if="column.title">
          {{ $t(column.title) }}
        </template>
        <template v-if="column.key === 'asdf'"></template>
      </template>
      <!-- 自定义表体 -->
      <template #bodyCell="{ column, record, index }">
        <slot name="bodyCell" :record="record" :column="column"></slot>
        <!-- 占位 -->
        <template v-if="column.key === 'asdf'">
          <a>
            {{ record.name }}
          </a>
        </template>
        <!-- 操作列 -->
        <template v-else-if="column.key === 'operationColumn'">
          <div class="flex items-center justify-center flex-wrap gap-[8px]">
            <span
              class="m-[8px] cursor-pointer"
              :style="`color:` + operation.color"
              v-for="(operation, operationIndex) in column.operationList"
              :key="operationIndex"
              @click="operation.click(record, index)"
            >
              <span v-if="operation.showOrHidden(record, index)">
                <div v-if="operation.type === 'popConfirm'">
                  <!-- 注意 为了区分操作 会给该行数据添加 operation.type + operationIndex字段 -->
                  <a-popconfirm
                    :title="$t(operation.popConfirmTitle)"
                    @confirm="operation.popConfirm(record, index)"
                    :open="record[operation.type + operationIndex]"
                    @openChange="
                      record[operation.type + operationIndex] =
                        !record[operation.type + operationIndex]
                    "
                  >
                    <template #icon><question-circle-outlined style="color: red" /></template>
                    {{ $t(operation.text) }}
                  </a-popconfirm>
                </div>
                <div v-else-if="operation.type === 'more'">
                  <a-dropdown :trigger="['click']" :placement="'bottomRight'">
                    <span>{{ $t(operation.text) }}</span>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item
                          v-for="(child, childIndex) in operation.children"
                          :key="childIndex + 1"
                          @click="child.click(record, index)"
                          class="p-0!"
                        >
                          <div v-if="child.type === 'popConfirm'">
                            <!-- 注意 为了区分操作 会给该行数据添加 child.type + childIndex -->
                            <a-popconfirm
                              class="flex"
                              :title="$t(child.popConfirmTitle)"
                              @confirm="child.popConfirm(record, index)"
                              :open="record[child.type + childIndex]"
                              @openChange="
                                record[child.type + childIndex] = !record[child.type + childIndex]
                              "
                            >
                              <template #icon>
                                <question-circle-outlined style="color: red" />
                              </template>
                              <span
                                class="p-[6px] hover:bg-[#f5f5f5] cursor-pointer rounded-[4px] hover:text-[var(--primary-color)]!"
                              >
                                <span class="flex-1">
                                  {{ $t(child.text) }}
                                </span>
                              </span>
                            </a-popconfirm>
                          </div>
                          <div
                            v-else
                            :style="`color:` + child.color"
                            class="p-[6px] hover:bg-[#f5f5f5] cursor-pointer rounded-[4px] hover:text-[var(--primary-color)]!"
                          >
                            {{ $t(child.text) }}
                          </div>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
                <span v-else>
                  {{ $t(operation.text) }}
                </span>
              </span>
            </span>
          </div>
        </template>
        <template v-else>
          <span v-if="!column.noRenderInner" class="p-[8px]">
            <!-- <span class="text-nowrap">
              {{ record[column.key] }}
            </span> -->
            <span class="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
              <a-popover v-if="record[column.key]">
                <template #content>
                  <div class="max-w-[500px] break-all">
                    <div v-if="Array.isArray(record[column.key])">
                      {{ record[column.key].join(',') }}
                    </div>
                    <div v-else>
                      {{ record[column.key] }}
                    </div>
                  </div>
                </template>
                <slot
                  v-if="column.slotEllipsis"
                  name="ellipsis"
                  :record="record"
                  :column="column"
                ></slot>
                <span v-else class="text-nowrap overflow-hidden text-ellipsis px-[8px]">
                  {{ record[column.key] }}
                </span>
              </a-popover>
              <span v-else>--</span>
            </span>
          </span>
          <span v-else>
            <slot name="noRenderInner" :record="record" :column="column"></slot>
          </span>
        </template>
      </template>
    </a-table>
    <div class="w-full flex items-center justify-end pt-[16px] table-pagination">
      <span class="text-[#999] px-[16px]">
        {{ $t('table.page.total') }} {{ pageDate.total }} {{ $t('table.page.centet') }}
        {{ pageDate.currentPage }}/ {{ totalPages }} {{ $t('table.page.page') }}
      </span>
      <a-pagination
        v-model:current="pageCfg.currentPage"
        :total="pageDate.total"
        :page-size-options="pageSizeOptions"
        show-quick-jumper
        show-size-changer
        @showSizeChange="onShowSizeChange"
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, unref, watch, onUnmounted } from 'vue';
import { Table } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { throttle } from 'lodash';
const props = defineProps({
  tableData: Array,
  tableSetting: Object,
  pageDate: Object,
});

// 表结构配置
const tableSet = ref(props.tableSetting);

watch(
  () => props.tableSetting,
  newV => {
    tableSet.value = newV; // 监听 prop 变化
    console.log(tableSet.value);
  },
);

// 分页配置
const pageCfg = ref(props.pageDate);
watch(
  () => props.pageDate,
  newV => {
    pageCfg.value = newV; // 监听 prop 变化
    console.log(pageCfg.value);
  },
);

// 暂无数据居中显示
watch(
  () => props.tableData,
  () => {
    if (props.tableData.length === 0) {
      nextTick(() => {
        const ATERF: any = document.querySelector('.ant-table-expanded-row-fixed');
        if (ATERF) {
          if (typeof tableSet.value.height === 'number') {
            ATERF.style.minHeight = `${tableSet.value.height - 1}px`;
          } else {
            ATERF.style.minHeight = `calc(${tableSet.value.height} - 1px)`;
          }
          ATERF.style.display = `flex`;
          ATERF.style.aligniItems = `center`;
          ATERF.style.justifyContent = `center`;
        }
      });
    }
  },
  { deep: true, immediate: true },
);

const tableRef = ref();
onMounted(() => {
  // 解决高度自适应问题
  if (tableRef.value) {
    const tableElement = tableRef.value.$el; // 访问组件的根 DOM 元素
    // 在tableElement中找'.ant-table-body'
    const tableBody = tableElement.querySelector('.ant-table-body');
    if (tableBody) {
      if (typeof tableSet.value.height === 'number') {
        tableBody.style.minHeight = `${tableSet.value.height}px`;
      } else {
        tableBody.style.minHeight = `${tableSet.value.height}`;
      }
    }
    //加定时器为了防止rect为渲染完成
    setTimeout(() => {
      let tableElementHeight = 0;
      const rect = tableElement.getBoundingClientRect(); // 获取元素的边界矩形
      tableElementHeight = rect.height; // 获取高度
      tableSet.value.height = tableElementHeight - 39;
      if (tableBody) {
        tableBody.style.minHeight = `${tableSet.value.height}px`;
      }
    }, 100);
    // 添加鼠标位置监听
    if (tableBody) {
      tableBody.addEventListener('mousemove', event => {
        throttleCountMouseElementPopover(tableBody, event);
      });
    }
  }
});

// 文字是否超出
const isTextOverflowing = element => {
  if (!element) return false;
  return element.scrollWidth > element.clientWidth;
};

// 鼠标移过元素
const countMouseElementPopover = (tableBody, event) => {
  if (!event.target.classList.contains('text-ellipsis')) return; // 非目标元素直接返回

  const isOverflowing = isTextOverflowing(event.target);
  const targetContent = event.target.innerHTML.trim(); // 缓存目标内容

  // 动态查找相关的 ant-popover 元素并处理
  const popoverDivs = Array.from(document.querySelectorAll('div.ant-popover'));
  popoverDivs.forEach(div => {
    if (div.innerHTML.includes(targetContent)) {
      if (isOverflowing) {
        if (!div.classList.contains('visible')) {
          div.classList.add('visible'); // 仅当未设置时添加
        }
      } else {
        if (div.classList.contains('visible')) {
          div.classList.remove('visible'); // 仅当设置时移除
        }
      }
    }
  });
};

// 节流后的鼠标移入处理函数
const throttleCountMouseElementPopover = throttle((tableBody, event) => {
  countMouseElementPopover(tableBody, event);
}, 200);

onUnmounted(() => {
  // 在销毁时移除事件监听
  if (tableRef.value) {
    const tableElement = tableRef.value.$el;
    const tableBody = tableElement.querySelector('.ant-table-body');
    if (tableBody) {
      tableBody.removeEventListener('mousemove');
    }
  }
});

const emit = defineEmits(['changeSelection', 'changePage', 'filterChange', 'rowClick']);

// 计算总页数，处理总数为零的情况
const totalPages = computed(() => {
  if (props.pageDate.pageSize === 0) return 0; // 处理页大小为零的情况
  return Math.ceil(props.pageDate.total / props.pageDate.pageSize);
});
const pageSizeOptions = ref<string[]>(['10', '20', '30', '40', '50']);
// 分页
const pageSizeChanging = ref(false);
const onShowSizeChange = (current: number, pageSize: number) => {
  pageChangeBack(current, pageSize);
  pageSizeChanging.value = true;
  setTimeout(() => {
    pageSizeChanging.value = false;
  }, 225);
};
const onPageChange = (pageNumber: number) => {
  pageChangeBack(pageNumber);
};
const pageChangeBack = (page: number, pageSize?: number) => {
  if (pageSizeChanging.value) return;
  emit('changePage', page, pageSize);
};

// 框选
interface DataType {
  key: string | number;
}
const selectedRowKeys = ref<DataType['key'][]>([]);
const onSelectChange = (changableRowKeys: string[]) => {
  // console.log('selectedRowKeys changed: ', changableRowKeys);
  selectedRowKeys.value = changableRowKeys;
  emit('changeSelection', changableRowKeys);
};
const rowSelection = computed(() => {
  if (tableSet.value.showSelection) {
    return {
      selectedRowKeys: unref(selectedRowKeys),
      onChange: onSelectChange,
      hideDefaultSelections: true,
      selections: [
        Table.SELECTION_ALL,
        Table.SELECTION_INVERT,
        Table.SELECTION_NONE,
        // {
        //   key: 'odd',
        //   text: 'Select Odd Row',
        //   onSelect: changableRowKeys => {
        //     let newSelectedRowKeys = [];
        //     newSelectedRowKeys = changableRowKeys.filter((_key, index) => {
        //       if (index % 2 !== 0) {
        //         return false;
        //       }
        //       return true;
        //     });
        //     selectedRowKeys.value = newSelectedRowKeys;
        //   },
        // },
        // {
        //   key: 'even',
        //   text: 'Select Even Row',
        //   onSelect: changableRowKeys => {
        //     let newSelectedRowKeys = [];
        //     newSelectedRowKeys = changableRowKeys.filter((_key, index) => {
        //       if (index % 2 !== 0) {
        //         return true;
        //       }
        //       return false;
        //     });
        //     selectedRowKeys.value = newSelectedRowKeys;
        //   },
        // },
      ],
    };
  } else {
    return null;
  }
});

const clearSelectedRowKeys = () => {
  selectedRowKeys.value = [];
};

// 列宽调整
const handleResizeColumn = (width: number, column: any) => {
  column.width = width;
};

const onTableChange = (page: number, pageSize: number, filters: any, sorter: any) => {
  // console.log(page, pageSize, filters, sorter);
  emit('filterChange', filters, sorter);
};

// 保存当前高亮的行 key
const highlightedRowKey = ref<string | null>(null);
const onRowClick = (row: any, index: number) => {
  if (tableSet.value.rowClick) {
    return {
      onClick: () => {
        emit('rowClick', row, index);
        highlightedRowKey.value = row.key; // 设置高亮的行 key
      },
    };
  } else {
    return;
  }
};
// 根据行 key 动态设置行类名
const rowClassName = (row: any) => {
  return row.key === highlightedRowKey.value ? 'ant-table-row-selected' : '';
};

// 手动触发点击行的方法
const triggerRowClick = (row: any) => {
  highlightedRowKey.value = row.key; // 设置高亮行

  // 解决高度自适应问题并滚动到对应行
  if (tableRef.value) {
    const tableElement = tableRef.value.$el; // 获取表格根 DOM 元素
    const tableBody = tableElement.querySelector('.ant-table-body'); // 表格内容容器
    const rowElement = tableBody?.querySelector(`tr[data-row-key="${row.key}"]`); // 找到对应行

    if (rowElement && tableBody) {
      const rowOffsetTop = rowElement.offsetTop; // 行的垂直位置
      const rowHeight = rowElement.offsetHeight; // 行的高度
      const tableBodyScrollTop = tableBody.scrollTop; // 当前滚动位置
      const tableBodyHeight = tableBody.offsetHeight; // 表格容器的高度

      // 判断行是否在当前可见范围内
      if (
        rowOffsetTop < tableBodyScrollTop || // 行在可视区域上方
        rowOffsetTop + rowHeight > tableBodyScrollTop + tableBodyHeight // 行在可视区域下方
      ) {
        // 滚动到行的位置
        tableBody.scrollTo({
          top: rowOffsetTop - tableBodyHeight / 2 + rowHeight / 2, // 居中显示该行
          behavior: 'smooth', // 平滑滚动
        });
      }
    }
  }
};

defineExpose({
  clearSelectedRowKeys,
  triggerRowClick,
});
</script>

<style lang="less" scoped>
// 空数据
:deep(.ant-empty) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
// 换行
:deep(.ant-table-cell) {
  text-wrap: wrap;
  text-align: center !important;
  padding: 8px !important;
}
:deep(.css-dev-only-do-not-override-1e3wid6.ant-spin-nested-loading > div > .ant-spin) {
  max-height: max-content;
}
:deep(.ant-table-body) {
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}
// 去掉最后一行边框 暂无数据行
:deep(
    .ant-table-wrapper
      .ant-table:not(.ant-table-bordered)
      .ant-table-tbody
      > tr:last-child.ant-table-placeholder
      > td
  ) {
  border-bottom: transparent !important;
}
</style>
