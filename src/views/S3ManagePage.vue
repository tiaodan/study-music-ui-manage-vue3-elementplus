<template>
  <div class="container">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="crumbs" separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <span v-if="index === breadcrumbList.length - 1">{{ item }}</span>
        <a v-else @click="navigateToFolder(index)">{{ item }}</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 工具栏 -->
    <div class="handle-box">
      <el-button type="primary" @click="showCreateFolderDialog">新建文件夹</el-button>
      <el-button type="primary" @click="showUploadDialog">上传文件</el-button>
      <el-button type="danger" @click="batchDeleteObjects" :disabled="selectedObjects.length === 0">批量删除 ({{ selectedObjects.length }})</el-button>
      <el-button type="primary" @click="showBatchCopyDialog" :disabled="selectedObjects.length === 0">批量复制 ({{ selectedObjects.length }})</el-button>
      <el-input placeholder="搜索文件夹/文件" v-model="searchWord" style="width: 200px; margin-left: 10px"></el-input>
    </div>

    <!-- 文件夹列表 -->
    <el-table height="300px" border size="small" :data="filteredFolders" v-loading="loadingFolders">
      <el-table-column label="文件夹名称" prop="name" align="left">
        <template v-slot="scope">
          <el-icon><Folder /></el-icon>
          <span style="margin-left: 8px; cursor: pointer" @click="enterFolder(scope.row.path)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路径" prop="path" align="left"></el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template v-slot="scope">
          <el-button size="small" @click="enterFolder(scope.row.path)">进入</el-button>
          <el-button size="small" @click="showFolderInfo(scope.row.path)">详情</el-button>
          <el-button size="small" type="danger" @click="deleteFolder(scope.row.path)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-divider />

    <!-- 文件列表 -->
    <el-table height="300px" border size="small" :data="filteredObjects" v-loading="loadingObjects" @selection-change="handleObjectSelectionChange">
      <el-table-column type="selection" width="40" align="center"></el-table-column>
      <el-table-column label="文件名称" prop="key" align="left">
        <template v-slot="scope">
          <el-icon><Document /></el-icon>
          <span style="margin-left: 8px">{{ getFileName(scope.row.key) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="大小" prop="size" width="120" align="center">
        <template v-slot="scope">
          {{ formatSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="最后修改" prop="lastModified" width="180" align="center">
        <template v-slot="scope">
          {{ formatDate(scope.row.lastModified) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center">
        <template v-slot="scope">
          <el-button size="small" @click="showObjectInfo(scope.row.key)">详情</el-button>
          <el-button size="small" type="primary" @click="downloadObject(scope.row.key)">下载</el-button>
          <el-button size="small" @click="showCopyDialog(scope.row.key)">复制</el-button>
          <el-button size="small" type="danger" @click="deleteObject(scope.row.key)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 新建文件夹对话框 -->
  <el-dialog title="新建文件夹" v-model="createFolderVisible" width="400px">
    <el-form label-width="80px">
      <el-form-item label="文件夹名">
        <el-input v-model="newFolderName" placeholder="输入文件夹名称"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="createFolderVisible = false">取消</el-button>
      <el-button type="primary" @click="handleCreateFolder">确定</el-button>
    </template>
  </el-dialog>

  <!-- 上传文件对话框 -->
  <el-dialog title="上传文件" v-model="uploadVisible" width="400px">
    <el-form label-width="80px">
      <el-form-item label="当前路径">
        <el-input v-model="currentPath" disabled></el-input>
      </el-form-item>
      <el-form-item label="选择文件">
        <el-upload
          :action="uploadUrl"
          :show-file-list="true"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
        >
          <el-button type="primary">选择文件</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="uploadVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 文件夹详情对话框 -->
  <el-dialog title="文件夹详情" v-model="folderInfoVisible" width="500px">
    <el-descriptions :column="1" border v-if="folderInfo">
      <el-descriptions-item label="路径">{{ folderInfo.path }}</el-descriptions-item>
      <el-descriptions-item label="文件数量">{{ folderInfo.objectCount || 0 }}</el-descriptions-item>
      <el-descriptions-item label="总大小">{{ formatSize(folderInfo.totalSize || 0) }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(folderInfo.createdTime) }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="folderInfoVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 文件详情对话框 -->
  <el-dialog title="文件详情" v-model="objectInfoVisible" width="500px">
    <el-descriptions :column="1" border v-if="objectInfo">
      <el-descriptions-item label="文件名">{{ getFileName(objectInfo.key) }}</el-descriptions-item>
      <el-descriptions-item label="路径">{{ objectInfo.key }}</el-descriptions-item>
      <el-descriptions-item label="大小">{{ formatSize(objectInfo.size) }}</el-descriptions-item>
      <el-descriptions-item label="最后修改">{{ formatDate(objectInfo.lastModified) }}</el-descriptions-item>
      <el-descriptions-item label="ETag">{{ objectInfo.etag }}</el-descriptions-item>
      <el-descriptions-item label="存储类型">{{ objectInfo.storageClass }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="objectInfoVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 复制文件对话框 -->
  <el-dialog title="复制文件" v-model="copyVisible" width="500px">
    <el-form label-width="80px">
      <el-form-item label="源文件">
        <el-input v-model="copySourceKey" disabled></el-input>
      </el-form-item>
      <el-form-item label="目标路径">
        <el-input v-model="copyDestKey" placeholder="输入目标文件路径"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="copyVisible = false">取消</el-button>
      <el-button type="primary" @click="handleCopyObject">确定</el-button>
    </template>
  </el-dialog>

  <!-- 批量复制对话框 -->
  <el-dialog title="批量复制文件" v-model="batchCopyVisible" width="600px">
    <el-form label-width="100px">
      <el-form-item label="已选文件数">
        <span>{{ selectedObjects.length }} 个文件</span>
      </el-form-item>
      <el-form-item label="目标文件夹">
        <el-input v-model="batchCopyDestPath" placeholder="输入目标文件夹路径"></el-input>
      </el-form-item>
    </el-form>
    <el-table :data="selectedObjects" max-height="200px" size="small">
      <el-table-column label="文件名" prop="key">
        <template v-slot="scope">
          {{ getFileName(scope.row.key) }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="batchCopyVisible = false">取消</el-button>
      <el-button type="primary" @click="handleBatchCopyObjects">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, getCurrentInstance } from "vue";
import { HttpManager } from "@/api";
import { Folder, Document } from '@element-plus/icons-vue';

interface FolderItem {
  name: string;
  path: string;
}

interface ObjectItem {
  key: string;
  size: number;
  lastModified: string;
}

export default defineComponent({
  components: { Folder, Document },
  setup() {
    const { proxy } = getCurrentInstance() as any;

    const currentPath = ref("");
    const breadcrumbList = ref<string[]>(["根目录"]);
    const folders = ref<FolderItem[]>([]);
    const objects = ref<ObjectItem[]>([]);
    const loadingFolders = ref(false);
    const loadingObjects = ref(false);
    const searchWord = ref("");

    // 新建文件夹
    const createFolderVisible = ref(false);
    const newFolderName = ref("");

    // 上传文件
    const uploadVisible = ref(false);
    const uploadUrl = ref("");

    // 文件夹详情
    const folderInfoVisible = ref(false);
    const folderInfo = ref<any>(null);

    // 文件详情
    const objectInfoVisible = ref(false);
    const objectInfo = ref<any>(null);

    // 复制文件
    const copyVisible = ref(false);
    const copySourceKey = ref("");
    const copyDestKey = ref("");

    // 批量操作
    const selectedObjects = ref<ObjectItem[]>([]);
    const batchCopyVisible = ref(false);
    const batchCopyDestPath = ref("");

    // 过滤后的数据
    const filteredFolders = computed(() => {
      if (!searchWord.value) return folders.value;
      return folders.value.filter(f => f.name.toLowerCase().includes(searchWord.value.toLowerCase()));
    });

    const filteredObjects = computed(() => {
      if (!searchWord.value) return objects.value;
      return objects.value.filter(o => getFileName(o.key).toLowerCase().includes(searchWord.value.toLowerCase()));
    });

    // 加载文件夹和文件
    async function loadData() {
      loadingFolders.value = true;
      loadingObjects.value = true;

      try {
        // 加载文件夹
        const folderResult = await HttpManager.listS3Folders(currentPath.value) as any;
        if (folderResult.success) {
          folders.value = folderResult.data || [];
        }

        // 加载文件
        const objectResult = await HttpManager.listS3Objects(currentPath.value) as any;
        if (objectResult.success) {
          objects.value = objectResult.data || [];
        }
      } catch (error) {
        proxy.$message.error("加载失败");
      } finally {
        loadingFolders.value = false;
        loadingObjects.value = false;
      }
    }

    // 进入文件夹
    function enterFolder(path: string) {
      currentPath.value = path;
      updateBreadcrumb(path);
      loadData();
    }

    // 导航到面包屑指定层级
    function navigateToFolder(index: number) {
      if (index === 0) {
        currentPath.value = "";
        breadcrumbList.value = ["根目录"];
      } else {
        const parts = breadcrumbList.value.slice(1, index + 1);
        currentPath.value = parts.join("/");
        breadcrumbList.value = ["根目录", ...parts];
      }
      loadData();
    }

    // 更新面包屑
    function updateBreadcrumb(path: string) {
      if (!path) {
        breadcrumbList.value = ["根目录"];
      } else {
        const parts = path.split("/").filter(p => p);
        breadcrumbList.value = ["根目录", ...parts];
      }
    }

    // 显示新建文件夹对话框
    function showCreateFolderDialog() {
      newFolderName.value = "";
      createFolderVisible.value = true;
    }

    // 创建文件夹
    async function handleCreateFolder() {
      if (!newFolderName.value) {
        proxy.$message.warning("请输入文件夹名称");
        return;
      }

      const fullPath = currentPath.value ? `${currentPath.value}/${newFolderName.value}` : newFolderName.value;

      try {
        const result = await HttpManager.createS3Folder(fullPath) as any;
        if (result.success) {
          proxy.$message.success("创建成功");
          createFolderVisible.value = false;
          loadData();
        } else {
          proxy.$message.error(result.message || "创建失败");
        }
      } catch (error) {
        proxy.$message.error("创建失败");
      }
    }

    // 删除文件夹
    async function deleteFolder(path: string) {
      try {
        await proxy.$confirm("确定删除该文件夹及其所有内容?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });

        const result = await HttpManager.deleteS3Folder(path) as any;
        if (result.success) {
          proxy.$message.success("删除成功");
          loadData();
        } else {
          proxy.$message.error(result.message || "删除失败");
        }
      } catch (error) {
        // 用户取消
      }
    }

    // 显示文件夹详情
    async function showFolderInfo(path: string) {
      try {
        const result = await HttpManager.getS3FolderInfo(path) as any;
        if (result.success) {
          folderInfo.value = result.data;
          folderInfoVisible.value = true;
        } else {
          proxy.$message.error(result.message || "获取详情失败");
        }
      } catch (error) {
        proxy.$message.error("获取详情失败");
      }
    }

    // 显示上传对话框
    function showUploadDialog() {
      uploadUrl.value = HttpManager.uploadS3File(currentPath.value);
      uploadVisible.value = true;
    }

    // 上传前检查
    function beforeUpload(file: any) {
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        proxy.$message.error("文件大小不能超过50MB!");
      }
      return isLt50M;
    }

    // 上传成功
    function handleUploadSuccess(response: any) {
      if (response.success) {
        proxy.$message.success("上传成功");
        uploadVisible.value = false;
        loadData();
      } else {
        proxy.$message.error(response.message || "上传失败");
      }
    }

    // 上传失败
    function handleUploadError() {
      proxy.$message.error("上传失败");
    }

    // 删除文件
    async function deleteObject(key: string) {
      try {
        await proxy.$confirm("确定删除该文件?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });

        const result = await HttpManager.deleteS3Object(key) as any;
        if (result.success) {
          proxy.$message.success("删除成功");
          loadData();
        } else {
          proxy.$message.error(result.message || "删除失败");
        }
      } catch (error) {
        // 用户取消
      }
    }

    // 显示文件详情
    async function showObjectInfo(key: string) {
      try {
        const result = await HttpManager.getS3ObjectInfo(key) as any;
        if (result.success) {
          objectInfo.value = result.data;
          objectInfoVisible.value = true;
        } else {
          proxy.$message.error(result.message || "获取详情失败");
        }
      } catch (error) {
        proxy.$message.error("获取详情失败");
      }
    }

    // 下载文件
    async function downloadObject(key: string) {
      try {
        const result = await HttpManager.getS3DownloadUrl(key) as any;
        if (result.success && result.data?.url) {
          window.open(result.data.url, "_blank");
        } else {
          proxy.$message.error(result.message || "获取下载链接失败");
        }
      } catch (error) {
        proxy.$message.error("获取下载链接失败");
      }
    }

    // 显示复制对话框
    function showCopyDialog(key: string) {
      copySourceKey.value = key;
      copyDestKey.value = key; // 默认相同路径
      copyVisible.value = true;
    }

    // 复制文件
    async function handleCopyObject() {
      if (!copyDestKey.value) {
        proxy.$message.warning("请输入目标路径");
        return;
      }

      try {
        const result = await HttpManager.copyS3Object(copySourceKey.value, copyDestKey.value) as any;
        if (result.success) {
          proxy.$message.success("复制成功");
          copyVisible.value = false;
          loadData();
        } else {
          proxy.$message.error(result.message || "复制失败");
        }
      } catch (error) {
        proxy.$message.error("复制失败");
      }
    }

    // 文件选择变化
    function handleObjectSelectionChange(selection: ObjectItem[]) {
      selectedObjects.value = selection;
    }

    // 批量删除文件
    async function batchDeleteObjects() {
      if (selectedObjects.value.length === 0) {
        proxy.$message.warning("请选择要删除的文件");
        return;
      }

      try {
        await proxy.$confirm(`确定删除选中的 ${selectedObjects.value.length} 个文件?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });

        const keys = selectedObjects.value.map(obj => obj.key);
        const result = await HttpManager.batchDeleteS3Objects(keys) as any;
        if (result.success) {
          proxy.$message.success("批量删除成功");
          loadData();
        } else {
          proxy.$message.error(result.message || "批量删除失败");
        }
      } catch (error) {
        // 用户取消
      }
    }

    // 显示批量复制对话框
    function showBatchCopyDialog() {
      if (selectedObjects.value.length === 0) {
        proxy.$message.warning("请选择要复制的文件");
        return;
      }
      batchCopyDestPath.value = currentPath.value;
      batchCopyVisible.value = true;
    }

    // 批量复制文件
    async function handleBatchCopyObjects() {
      if (!batchCopyDestPath.value) {
        proxy.$message.warning("请输入目标文件夹路径");
        return;
      }

      try {
        const items = selectedObjects.value.map(obj => {
          const fileName = getFileName(obj.key);
          const destKey = batchCopyDestPath.value ? `${batchCopyDestPath.value}/${fileName}` : fileName;
          return { sourceKey: obj.key, destKey };
        });

        const result = await HttpManager.batchCopyS3Objects(items) as any;
        if (result.success) {
          proxy.$message.success("批量复制成功");
          batchCopyVisible.value = false;
          loadData();
        } else {
          proxy.$message.error(result.message || "批量复制失败");
        }
      } catch (error) {
        proxy.$message.error("批量复制失败");
      }
    }

    // 格式化文件名
    function getFileName(key: string) {
      const parts = key.split("/");
      return parts[parts.length - 1] || key;
    }

    // 格式化文件大小
    function formatSize(size: number) {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
      if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
      return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }

    // 格式化日期
    function formatDate(dateStr: string) {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString("zh-CN");
    }

    onMounted(() => {
      loadData();
    });

    return {
      currentPath,
      breadcrumbList,
      folders,
      objects,
      loadingFolders,
      loadingObjects,
      searchWord,
      filteredFolders,
      filteredObjects,
      createFolderVisible,
      newFolderName,
      uploadVisible,
      uploadUrl,
      folderInfoVisible,
      folderInfo,
      objectInfoVisible,
      objectInfo,
      copyVisible,
      copySourceKey,
      copyDestKey,
      selectedObjects,
      batchCopyVisible,
      batchCopyDestPath,
      loadData,
      enterFolder,
      navigateToFolder,
      showCreateFolderDialog,
      handleCreateFolder,
      deleteFolder,
      showFolderInfo,
      showUploadDialog,
      beforeUpload,
      handleUploadSuccess,
      handleUploadError,
      deleteObject,
      showObjectInfo,
      downloadObject,
      showCopyDialog,
      handleCopyObject,
      handleObjectSelectionChange,
      batchDeleteObjects,
      showBatchCopyDialog,
      handleBatchCopyObjects,
      getFileName,
      formatSize,
      formatDate
    };
  }
});
</script>

<style scoped>
.container {
  padding: 20px;
}
.crumbs {
  margin-bottom: 20px;
}
.handle-box {
  margin-bottom: 20px;
}
.handle-box .el-input {
  margin-left: 10px;
}
</style>