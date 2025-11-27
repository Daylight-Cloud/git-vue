<template>
  <el-dialog :title="isEdit ? '编辑图书' : '新增图书'" v-model="visible" width="640px" @close="onClose">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="书名" prop="title">
        <el-input v-model="form.title" autocomplete="off" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" autocomplete="off" />
      </el-form-item>
      <el-form-item label="出版日期" prop="publish_date">
        <el-date-picker v-model="form.publish_date" type="date" placeholder="选择日期" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="定价" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="总库存" prop="stock_total">
        <el-input-number v-model="form.stock_total" :min="0" :step="1" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="可借数量" prop="stock_available">
        <el-input-number v-model="form.stock_available" :min="0" :step="1" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="封面">
        <div class="cover-field">
          <el-upload
            class="cover-upload"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="onCoverChange"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">上传本地图片，支持 jpg/png</div>
            </template>
          </el-upload>
          <div class="cover-preview" v-if="form.cover_preview">
            <img :src="form.cover_preview" alt="cover preview" />
          </div>
        </div>
      </el-form-item>
      <el-form-item label="简介" prop="description">
        <el-input
          type="textarea"
          v-model="form.description"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="180"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  isEdit: Boolean,
  formData: Object
});
const emits = defineEmits(['update:modelValue', 'submit']);

const formRef = ref(null);
const form = ref({
  id: null,
  title: '',
  author: '',
  publish_date: '',
  price: 0,
  stock_total: 0,
  stock_available: 0,
  cover_data: '',
  cover_preview: '',
  description: ''
});
const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  publish_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  price: [{ required: true, message: '请输入定价', trigger: 'blur' }],
  stock_total: [{ required: true, message: '请输入总库存', trigger: 'blur' }],
  stock_available: [{ required: true, message: '请输入可借数量', trigger: 'blur' }]
};

const visible = ref(props.modelValue);

const resetForm = () => {
  Object.assign(form.value, {
    id: null,
    title: '',
    author: '',
    publish_date: '',
    price: 0,
    stock_total: 0,
    stock_available: 0,
    cover_data: '',
    cover_preview: '',
    description: ''
  })
}

watch(() => props.modelValue, (val) => {
  visible.value = val;
});
watch(visible, (val) => {
  emits('update:modelValue', val);
});
watch(
  () => props.formData,
  val => {
    if (val) {
      Object.assign(form.value, {
        id: val.id || null,
        title: val.title || '',
        author: val.author || '',
        publish_date: val.publish_date || '',
        price: Number(val.price ?? 0),
        stock_total: Number(val.stock_total ?? 0),
        stock_available: Number(val.stock_available ?? val.stock_total ?? 0),
        cover_preview: val.cover_url || '',
        cover_data: '',
        description: val.description || ''
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => form.value.stock_total,
  (val) => {
    if (Number(form.value.stock_available) > Number(val)) {
      form.value.stock_available = Number(val) || 0
    }
  }
)

const onClose = () => {
  visible.value = false
}

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const onCoverChange = async (uploadFile) => {
  if (!uploadFile || !uploadFile.raw) return
  const dataUrl = await readFile(uploadFile.raw)
  form.value.cover_preview = dataUrl
  form.value.cover_data = dataUrl
}

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const payload = {
        id: form.value.id,
        title: form.value.title,
        author: form.value.author,
        publish_date: form.value.publish_date,
        description: form.value.description,
        price: Number(form.value.price ?? 0),
        stock_total: Number(form.value.stock_total ?? 0),
        stock_available: Number(form.value.stock_available ?? form.value.stock_total ?? 0),
        cover_data: form.value.cover_data || form.value.cover_preview
      }
      emits('submit', payload)
      onClose()
    }
  })
};
</script>

<style scoped>
.cover-field {
  display: flex;
  align-items: center;
  gap: 16px;
}
.cover-preview img {
  width: 80px;
  height: 110px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e4e7ed;
}
</style>