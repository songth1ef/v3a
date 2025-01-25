<template>
  <div class="clearfix">
    <a-upload
      v-model:file-list="fileList"
      method="put"
      :action="queryActionPath"
      list-type="picture-card"
      @preview="handlePreview"
      :before-upload="beforeUpload"
      :accept="config.accept"
      :custom-request="customRequest"
      @remove="handleRemove"
      @change="handleChange"
    >
      <div v-if="fileList.length < config.limit">
        <plus-outlined />
        <div style="margin-top: 8px">{{ $t('global.upload.click') }}</div>
      </div>
    </a-upload>
    <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { PlusOutlined } from '@ant-design/icons-vue';
import { inject, ref } from 'vue';
import type { UploadProps } from 'ant-design-vue';

const props = defineProps<{
  fileList: any[];
  action: string;
  limit: number;
  accept: string;
}>();

const config = ref(props);

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const fileList = ref<UploadProps['fileList']>(props.fileList);

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const message: any = inject('message');
import { getUploadUrl } from '@/api/rid/common';
const queryActionPath = ref('');
const beforeUpload = async (file: UploadProps['fileList'][number]) => {
  // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  // if (!isJpgOrPng) {
  //   message.error('You can only upload JPG file!');
  // }
  if (!file.name.includes('.') && file.name.includes('?')) {
    message.error(t('global.upload.type'));
  }

  await getQueryActionPath(file);
  const isLt2M = file.size / 1024 / 1024 < 20;
  if (!isLt2M) {
    message.error(t('global.upload.20mb'));
  }
  // return isJpgOrPng && isLt2M;
  return isLt2M;

  // console.log(file.name);
  // return false;
};

const fileUrl = ref('');
const getQueryActionPath = file => {
  // console.log(file);

  return new Promise((resolve, reject) => {
    getUploadUrl(file.name)
      .then(res => {
        // console.log(res);
        if (res.data) {
          queryActionPath.value = res.data.uploadUrl;
          fileUrl.value = res.data.fileUrl;
          // console.log(queryActionPath.value);
          return resolve(res);
        } else {
          return reject();
        }
      })
      .catch(err => {
        console.log(err);
        message.error(err.message);
      });
  });
};

const emit = defineEmits(['update:fileList', 'response']);
const handleRemove = (file: UploadProps['fileList'][number]) => {
  emit(
    'update:fileList',
    fileList.value.filter((item: any) => item.uid !== file.uid),
  );
};

const token = JSON.parse(sessionStorage.getItem('token'));
const headers = ref({
  Authorization: 'Bearer ' + token.access_token,
});
const response = ref({});
const handleChange = info => {
  // console.log(info);
  // if (!info.fileList.length) {
  //   emit('response', null);
  //   return;
  // }
  // if (info.file.xhr && info.file.xhr.status === 200) {
  //   response.value = fileUrl.value;
  //   emit('response', fileUrl.value);
  //   // console.log(info.file.response.data.url);
  // }
};
const getResponse = () => {
  return response.value;
};

const customRequest = async (options: any) => {
  const { file, onProgress, onSuccess, onError } = options;

  try {
    // 更新上传 URL
    if (!queryActionPath.value) {
      await getQueryActionPath(file);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', queryActionPath.value, true);

    // 可选：添加请求头 (如必要)
    // xhr.setRequestHeader('Content-Type', file.type); // 文件的 MIME 类型

    // 上传进度回调
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress({ percent }); // 更新进度
      }
    };

    // 上传完成回调
    xhr.onload = () => {
      if (xhr.status === 200) {
        emit('response', fileUrl.value);
        onSuccess(xhr.response); // 上传成功
      } else {
        emit('response', null);
        onError(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    // 上传错误回调
    xhr.onerror = () => {
      onError(new Error('Upload failed'));
    };

    // 开始上传
    xhr.send(file); // 直接发送文件二进制数据
  } catch (error) {
    console.error('Custom upload error:', error);
    onError(error);
  }
};

defineExpose({ getResponse });
</script>
<style lang="less" scoped>
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
