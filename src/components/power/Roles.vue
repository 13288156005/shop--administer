<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- table列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'venter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'venter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              class="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
              >编辑</el-button
            >
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              class="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <!-- 分配权限 -->
            <el-button
              type="warning"
              class="el-icon-setting"
              size="mini"
              @click="selectRole(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="AddRolesDialogVisible"
      width="30%"
      @close="closeDialog"
    >
      <!-- 添加用户表单信息 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesRules"
        ref="addRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="EditRolesDialogVisible"
      width="50%"
      @close="closeEditDialog"
    >
      <!-- 修改用户表单信息 -->
      <el-form
        :model="EditRolesForm"
        :rules="addRolesRules"
        ref="EditRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="主管" prop="roleName">
          <el-input v-model="EditRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="技术负责人" prop="roleDesc">
          <el-input v-model="EditRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="setRightDialogVisible"
      width="30%"
      @close="setRightcloseDialog"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="treeRef"
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRigtInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      //添加角色表单
      addRolesForm: {},
      //控制添加角色表单的显示和隐藏
      AddRolesDialogVisible: false,
      //添加角色表单规则
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      // 编辑角色的表单
      EditRolesForm: {},
      // 控制编辑角色的对话框显示和隐藏
      EditRolesDialogVisible: false,
      //选中的id
      roleID: "",
      //控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      //权限数据的树形结构列表
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      //默认选中的ID值
      defKeys: [],
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    //添加角色按钮
    addRoles() {
      this.AddRolesDialogVisible = true;
    },
    //关闭添加角色的对话框
    closeDialog() {
      this.$refs.addRolesFormRef.resetFields();
    },
    //当点击添加角色对话框的确定
    addRolesInfo() {
      this.$refs.addRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        if (res.meta.status !== 201) return this.$message.error("添加角色失败");
        this.$message.success("添加角色成功");
      });
      this.AddRolesDialogVisible = false;
      this.getRoleList();
    },
    //编辑角色按钮
    async showEditDialog(row) {
      //选中的id
      this.roleID = row.id;
      const { data: res } = await this.$http.get(`roles/${row.id}`);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色信息失败");
      this.EditRolesForm = res.data;

      this.EditRolesDialogVisible = true;
    },
    //关闭编辑角色的对话框
    closeEditDialog() {
      this.roleID = "";
      this.EditRolesForm = {};
    },
    //点击编辑角色按钮的确定
    EditRolesInfo() {
      this.$refs.EditRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(`roles/${this.roleID}`, {
          roleName: this.EditRolesForm.roleName,
          roleDesc: this.EditRolesForm.roleDesc,
        });
        if (res.meta.status !== 200) return this.$message.error("编辑角色失败");
        this.$message.success("更新角色成功");
        this.EditRolesDialogVisible = false;
        this.getRoleList();
      });
    },
    //删除角色
    async removeRolesById(id) {
      const confirmResulr = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //如果用户确认删除，则返回字符串confirm
      //如果用户取消删除，则返回字符串cancel
      if (confirmResulr !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除角色失败");
      this.$message.success("删除角色成功");
      this.getRoleList();
    },
    //点击标签删除权限
    async removeRightById(role, rightId) {
      const confirmResulr = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //如果用户确认删除，则返回字符串confirm
      //如果用户取消删除，则返回字符串cancel
      if (confirmResulr !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      this.$message.success("删除权限成功");
      role.children = res.data;
    },
    //点击分配权限按钮
    async selectRole(role) {
      this.roleID = role.id;
      //获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200)
        return this.$message.error("获取权限数据失败");
      //获取到权限数据保存到data中
      this.rightsList = res.data;
      console.log(this.rightsList);
      //递归获取三级节点的id
      this.getLeadfKey(role, this.defKeys);

      this.setRightDialogVisible = true;
    },
    //获取第三级的权限id
    getLeadfKey(node, arr) {
      //如果当前node节点不包含children属性则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeadfKey(item, arr));
    },
    //关闭分配权限按钮监控
    setRightcloseDialog() {
      this.defKeys = [];
    },
    //点击分配权限对话框内确定按钮
    async setRigtInfo() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleID}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) return this.$message.error("分配权限失败");
      this.$message.success("分配权限成功");
      this.getRoleList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.venter {
  display: flex;
  align-items: center;
}
</style>