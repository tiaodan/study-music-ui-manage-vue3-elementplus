<template>
  <el-breadcrumb class="crumbs" separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.name" :to="{ path: item.path }">
      {{ item.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>

  <div class="container">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 名字重新格式化 -->
      <el-tab-pane label="名字重新格式化" name="format">
        <el-form label-width="140px">
          <el-form-item label="歌手-专辑路径">
            <el-input
              v-model="formatForm.path"
              placeholder="例如: D:/音乐/周杰伦-依然范特西"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFormat" :loading="formatLoading">
              开始格式化
            </el-button>
          </el-form-item>
        </el-form>
        <el-divider />
        <div v-if="formatResult" class="result-box">
          <el-alert :title="formatResult.message" :type="formatResult.success ? 'success' : 'error'" show-icon />
        </div>
      </el-tab-pane>

      <!-- 移动到HDD -->
      <el-tab-pane label="移动到HDD" name="move">
        <el-form label-width="140px">
          <el-form-item label="源路径">
            <el-input
              v-model="moveForm.fromPath"
              placeholder="例如: D:/下载/新音乐"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item label="目标路径">
            <el-input
              v-model="moveForm.toPath"
              placeholder="例如: E:/音乐/硬盘"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleMove" :loading="moveLoading">
              开始移动
            </el-button>
          </el-form-item>
        </el-form>
        <el-divider />
        <div v-if="moveResult" class="result-box">
          <el-alert :title="moveResult.message" :type="moveResult.success ? 'success' : 'error'" show-icon />
        </div>
      </el-tab-pane>

      <!-- 规整进数据库 -->
      <el-tab-pane label="规整进数据库" name="import">
        <el-form label-width="140px">
          <el-form-item label="音乐文件路径">
            <el-input
              v-model="importForm.path"
              placeholder="例如: E:/音乐/硬盘/周杰伦-依然范特西"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleImport" :loading="importLoading">
              开始导入
            </el-button>
          </el-form-item>
        </el-form>
        <el-divider />
        <div v-if="importResult" class="result-box">
          <el-alert :title="importResult.message" :type="importResult.success ? 'success' : 'error'" show-icon />
          <el-divider />
          <el-descriptions v-if="importResult.data" title="导入详情" :column="2" border>
            <el-descriptions-item label="新增歌手">{{ importResult.data.newSingers || 0 }}</el-descriptions-item>
            <el-descriptions-item label="新增歌曲">{{ importResult.data.newSongs || 0 }}</el-descriptions-item>
            <el-descriptions-item label="更新歌曲">{{ importResult.data.updatedSongs || 0 }}</el-descriptions-item>
            <el-descriptions-item label="跳过歌曲">{{ importResult.data.skippedSongs || 0 }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { HttpManager } from "@/api";

export default defineComponent({
  setup() {
    const store = useStore();
    const breadcrumbList = computed(() => store.getters.breadcrumbList);

    const activeTab = ref("format");

    // 名字重新格式化
    const formatForm = ref({ path: "" });
    const formatLoading = ref(false);
    const formatResult = ref<any>(null);

    async function handleFormat() {
      if (!formatForm.value.path) {
        (window as any).$message.warning("请输入路径");
        return;
      }
      formatLoading.value = true;
      formatResult.value = null;
      try {
        const result = await HttpManager.formatFileNames(formatForm.value.path) as ResponseBody;
        formatResult.value = result;
        (window as any).$message({
          message: result.message,
          type: result.type,
        });
      } catch (error) {
        formatResult.value = { success: false, message: "请求失败，请检查后端服务" };
      } finally {
        formatLoading.value = false;
      }
    }

    // 移动到HDD
    const moveForm = ref({ fromPath: "", toPath: "" });
    const moveLoading = ref(false);
    const moveResult = ref<any>(null);

    async function handleMove() {
      if (!moveForm.value.fromPath || !moveForm.value.toPath) {
        (window as any).$message.warning("请输入源路径和目标路径");
        return;
      }
      moveLoading.value = true;
      moveResult.value = null;
      try {
        const result = await HttpManager.moveFiles(moveForm.value.fromPath, moveForm.value.toPath) as ResponseBody;
        moveResult.value = result;
        (window as any).$message({
          message: result.message,
          type: result.type,
        });
      } catch (error) {
        moveResult.value = { success: false, message: "请求失败，请检查后端服务" };
      } finally {
        moveLoading.value = false;
      }
    }

    // 规整进数据库
    const importForm = ref({ path: "" });
    const importLoading = ref(false);
    const importResult = ref<any>(null);

    async function handleImport() {
      if (!importForm.value.path) {
        (window as any).$message.warning("请输入路径");
        return;
      }
      importLoading.value = true;
      importResult.value = null;
      try {
        const result = await HttpManager.importToDatabase(importForm.value.path) as ResponseBody;
        importResult.value = result;
        (window as any).$message({
          message: result.message,
          type: result.type,
        });
      } catch (error) {
        importResult.value = { success: false, message: "请求失败，请检查后端服务" };
      } finally {
        importLoading.value = false;
      }
    }

    return {
      breadcrumbList,
      activeTab,
      // format
      formatForm,
      formatLoading,
      formatResult,
      handleFormat,
      // move
      moveForm,
      moveLoading,
      moveResult,
      handleMove,
      // import
      importForm,
      importLoading,
      importResult,
      handleImport,
    };
  },
});
</script>

<style scoped>
.crumbs {
  margin-bottom: 20px;
}
.container {
  padding: 20px;
}
.result-box {
  margin-top: 20px;
}
</style>
