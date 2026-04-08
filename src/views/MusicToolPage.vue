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
          <el-form-item label="歌手/专辑路径">
            <el-input
              v-model="formatForm.path"
              placeholder="例如: \\100.86.118.11\音乐\周杰伦\依然范特西"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFormat" :loading="formatLoading">
              开始格式化
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="formatLoading" title="正在处理中，请稍候..." type="info" show-icon :closable="false" />
        <el-divider v-if="formatLoading" />
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
              placeholder="例如: \\100.86.118.11\hdd\周杰伦\八度空间"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleMove" :loading="moveLoading">
              开始移动
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="moveLoading" title="正在处理中，请稍候..." type="info" show-icon :closable="false" />
        <el-divider v-if="moveLoading" />
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
        <el-alert v-if="importLoading" title="正在处理中，请稍候..." type="info" show-icon :closable="false" />
        <el-divider v-if="importLoading" />
        <div v-if="importResult" class="result-box">
          <el-alert :title="importResult.message" :type="importResult.success ? 'success' : 'error'" show-icon />
          <el-divider />
          <el-descriptions v-if="importResult.data" title="导入详情" :column="2" border>
            <el-descriptions-item label="导入歌曲">{{ importResult.data.imported?.length || 0 }}</el-descriptions-item>
            <el-descriptions-item label="总文件数">{{ importResult.data.total || 0 }}</el-descriptions-item>
            <el-descriptions-item label="失败数">{{ (importResult.data.failed?.length) || 0 }}</el-descriptions-item>
            <el-descriptions-item label="跳过数">{{ (importResult.data.total || 0) - (importResult.data.imported?.length || 0) - ((importResult.data.failed?.length) || 0) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>

      <!-- 一键导入-单专辑 -->
      <el-tab-pane label="一键导入-单专辑" name="oneClick">
        <el-form label-width="140px">
          <el-form-item label="源路径">
            <el-input
              v-model="oneClickForm.fromPath"
              placeholder="例如: C:/下载/音乐/周杰伦/八度空间"
              style="width: 600px"
            />
          </el-form-item>
          <el-form-item label="目标路径">
            <el-input
              v-model="oneClickForm.toPath"
              placeholder="例如: \\100.86.118.11\hdd\周杰伦\八度空间"
              style="width: 600px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="handleOneClickImport" :loading="oneClickLoading">
              开始一键导入
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="oneClickLoading" :title="oneClickStep" type="info" show-icon :closable="false" />
        <el-divider v-if="oneClickLoading" />
        <div v-if="oneClickResult" class="result-box">
          <el-alert :title="oneClickResult.message" :type="oneClickResult.success ? 'success' : 'error'" show-icon />
          <el-divider />
          <el-descriptions v-if="oneClickResult.data" title="导入详情" :column="2" border>
            <el-descriptions-item label="导入歌曲">{{ oneClickResult.data.imported?.length || 0 }}</el-descriptions-item>
            <el-descriptions-item label="总文件数">{{ oneClickResult.data.total || 0 }}</el-descriptions-item>
            <el-descriptions-item label="失败数">{{ (oneClickResult.data.failed?.length) || 0 }}</el-descriptions-item>
            <el-descriptions-item label="跳过数">{{ (oneClickResult.data.total || 0) - (oneClickResult.data.imported?.length || 0) - ((oneClickResult.data.failed?.length) || 0) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>

      <!-- 一键导入-单歌手-所有专辑 -->
      <el-tab-pane label="一键导入-单歌手-所有专辑" name="singerAlbums">
        <el-form label-width="140px">
          <el-form-item label="源路径">
            <el-input
              v-model="singerAlbumsForm.fromPath"
              placeholder="例如: C:/下载/音乐/周杰伦"
              style="width: 600px"
            />
          </el-form-item>
          <el-form-item label="目标路径">
            <el-input
              v-model="singerAlbumsForm.toPath"
              placeholder="例如: \\100.86.118.11\hdd\周杰伦"
              style="width: 600px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="warning" @click="handleSingerAlbums" :loading="singerAlbumsLoading">
              开始一键导入
            </el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="singerAlbumsLoading" :title="singerAlbumsStep || '正在处理中，请稍候...'" type="info" show-icon :closable="false" />
        <el-divider v-if="singerAlbumsLoading" />
        <div v-if="singerAlbumsResult" class="result-box">
          <el-alert :title="singerAlbumsResult.message" :type="singerAlbumsResult.success ? 'success' : 'error'" show-icon />
          <el-divider />
          <el-descriptions v-if="singerAlbumsResult.data" title="导入详情" :column="2" border>
            <el-descriptions-item label="总专辑">{{ singerAlbumsResult.data.total_albums || 0 }}</el-descriptions-item>
            <el-descriptions-item label="成功专辑">{{ singerAlbumsResult.data.success || 0 }}</el-descriptions-item>
            <el-descriptions-item label="总歌曲">{{ singerAlbumsResult.data.total_songs || 0 }}</el-descriptions-item>
            <el-descriptions-item label="失败">{{ singerAlbumsResult.data.failed || 0 }}</el-descriptions-item>
          </el-descriptions>
          <el-divider v-if="singerAlbumsResult.data?.results?.length" />
          <div v-if="singerAlbumsResult.data?.results?.length">
            <div v-for="(item, index) in singerAlbumsResult.data.results" :key="index" style="margin-bottom: 8px;">
              <el-tag :type="item.success ? 'success' : 'danger'" size="small">{{ item.album }}</el-tag>
              <span style="margin-left: 8px;">{{ item.songs }}首歌 - {{ item.message }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { HttpManager } from "@/api";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const store = useStore();
    const breadcrumbList = computed(() => store.getters.breadcrumbList);

    const activeTab = ref("format");

    // 名字重新格式化
    const formatForm = ref({ path: "" });
    const formatLoading = ref(false);
    const formatResult = ref<any>(null);

    // 去除路径末尾的 / \ 以及它们的连续组合
    function trimPathTrailingSlash(path: string): string {
      return path.replace(/[/\\]+$/, "");
    }

    async function handleFormat() {
      if (!formatForm.value.path) {
        proxy.$message.warning("请输入路径");
        return;
      }
      // 预处理：去除末尾的 / \ 以及它们的连续组合
      const processedPath = trimPathTrailingSlash(formatForm.value.path);
      formatLoading.value = true;
      formatResult.value = null;
      try {
        const result = await HttpManager.formatFileNames(processedPath) as ResponseBody;
        formatResult.value = result;
        proxy.$message({
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
        proxy.$message.warning("请输入源路径和目标路径");
        return;
      }
      moveLoading.value = true;
      moveResult.value = null;
      try {
        const result = await HttpManager.moveFiles(moveForm.value.fromPath, moveForm.value.toPath) as ResponseBody;
        moveResult.value = result;
        proxy.$message({
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
        proxy.$message.warning("请输入路径");
        return;
      }
      importLoading.value = true;
      importResult.value = null;
      try {
        const result = await HttpManager.importToDatabase(importForm.value.path) as ResponseBody;
        importResult.value = result;
        proxy.$message({
          message: result.message,
          type: result.type,
        });
      } catch (error) {
        importResult.value = { success: false, message: "请求失败，请检查后端服务" };
      } finally {
        importLoading.value = false;
      }
    }

    // 一键导入
    const oneClickForm = ref({ fromPath: "", toPath: "" });
    const oneClickLoading = ref(false);
    const oneClickStep = ref("");
    const oneClickResult = ref<any>(null);

    async function handleOneClickImport() {
      if (!oneClickForm.value.fromPath || !oneClickForm.value.toPath) {
        proxy.$message.warning("请输入源路径和目标路径");
        return;
      }
      oneClickLoading.value = true;
      oneClickResult.value = null;

      try {
        // 步骤1: 格式化文件名
        oneClickStep.value = "步骤 1/3: 正在格式化文件名...";
        const processedPath = trimPathTrailingSlash(oneClickForm.value.fromPath);
        const formatResult = await HttpManager.formatFileNames(processedPath) as ResponseBody;
        if (!formatResult.success) {
          throw new Error(formatResult.message);
        }

        // 步骤2: 移动文件
        oneClickStep.value = "步骤 2/3: 正在移动文件到目标路径...";
        const moveResult = await HttpManager.moveFiles(oneClickForm.value.fromPath, oneClickForm.value.toPath) as ResponseBody;
        if (!moveResult.success) {
          throw new Error(moveResult.message);
        }

        // 步骤3: 导入数据库
        oneClickStep.value = "步骤 3/3: 正在导入数据库...";
        // 目标路径已包含歌手/专辑名，直接传给后端
        const importResultData = await HttpManager.importToDatabase(oneClickForm.value.toPath) as ResponseBody;

        oneClickResult.value = importResultData;
        proxy.$message({
          message: importResultData.message,
          type: importResultData.type,
        });
      } catch (error: any) {
        oneClickResult.value = { success: false, message: error.message || "请求失败，请检查后端服务" };
      } finally {
        oneClickLoading.value = false;
        oneClickStep.value = "";
      }
    }

    // 一键导入-单歌手-所有专辑
    const singerAlbumsForm = ref({ fromPath: "", toPath: "" });
    const singerAlbumsLoading = ref(false);
    const singerAlbumsStep = ref("");
    const singerAlbumsResult = ref<any>(null);

    async function handleSingerAlbums() {
      if (!singerAlbumsForm.value.fromPath || !singerAlbumsForm.value.toPath) {
        proxy.$message.warning("请输入源路径和目标路径");
        return;
      }
      singerAlbumsLoading.value = true;
      singerAlbumsResult.value = null;
      singerAlbumsStep.value = "正在处理中，请稍候...";

      try {
        const result = await HttpManager.importSingerAlbums(
          trimPathTrailingSlash(singerAlbumsForm.value.fromPath),
          trimPathTrailingSlash(singerAlbumsForm.value.toPath)
        ) as ResponseBody;
        singerAlbumsResult.value = result;
        proxy.$message({
          message: result.message,
          type: result.type,
        });
      } catch (error: any) {
        singerAlbumsResult.value = { success: false, message: error.message || "请求失败，请检查后端服务" };
      } finally {
        singerAlbumsLoading.value = false;
        singerAlbumsStep.value = "";
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
      // oneClick
      oneClickForm,
      oneClickLoading,
      oneClickStep,
      oneClickResult,
      handleOneClickImport,
      // singerAlbums
      singerAlbumsForm,
      singerAlbumsLoading,
      singerAlbumsStep,
      singerAlbumsResult,
      handleSingerAlbums,
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
