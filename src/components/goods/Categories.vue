<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="tree-table"
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: lightgreen"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-if="scope.row.cat_level === 2"
            >三级</el-tag
          >
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="alertData(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeID(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类名称"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="closeEditCateDialog"
    >
      <!-- 修改分类表单信息 -->
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类名称"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="closeAddCateDialog"
    >
      <!-- 添加分类表单信息 -->
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_name">
          <el-cascader
            :options="parentCateList"
            v-model="selectedKeys"
            :props="cascaderProps"
            @change="parentCateChanged"
            expand-trigger="hover"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      //为table指定列定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示，将当前列定义模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          // 表示，将当前列定义模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "opt",
        },
      ],
      //控制编辑分类名称的显示和隐藏
      editCateDialogVisible: false,
      //编辑分类
      editCateForm: { cat_name: "" },
      editCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      selectId: 0,
      //控制添加分类的显示和隐藏
      addCateDialogVisible: false,
      //提交添加分类的表单
      addCateForm: {},
      //添加分类里的表单规则
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //父级分类列表
      parentCateList: [],
      //选则父级的id
      selectedKeys: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听多少条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听页码数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    async alertData(id) {
      this.selectId = id;
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询商品id失败");
      }
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    //关闭编辑分类名称的对话框
    closeEditCateDialog() {
      this.selectId = 0;
      this.editCateForm = {};
    },
    //点击编辑分类名称确定按钮fenl
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.selectId,
          {
            cat_name: this.editCateForm.cat_name,
          }
        );
        if (res.meta.status !== 200) return this.$message.error("更新分类失败");
        this.$message.success("更新分类成功");
        this.editCateDialogVisible = false;
        this.getCateList();
      });
    },
    // 删除分类
    async removeID(id) {
      //询问是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 如果用户确认删除，则返回字符串confirm
      // 如果用户取消删除，则返回字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getCateList();
    },
    // 添加分类
    addCate() {
      //获取父级分类的数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      this.parentCateList = res.data;
    },
    //级联选择器发生变化触发的函数
    parentCateChanged() {
      //如果selectedKyes的length大于0，证明选中父级分类，反之没有选中任何的父级分类
      if (this.selectedKeys.length > 0) {
        //父级id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //关闭添加分类的对话框监听
    closeAddCateDialog() {
      this.$refs.addCateFormRef.resetFields();
      this.addCateForm = {};
      this.selectedKeys = [];
    },
    //点击确定添加分类
    addCateInfo() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) return this.$message.error("添加分类失败");
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
</style>