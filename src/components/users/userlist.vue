<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域  -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 输入框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserlist"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserlist"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- table列表 -->
    <el-table :data="userlist" stripe style="width: 100%" border>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="username" label="姓名" width="180">
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
      <el-table-column prop="mobile" label="电话" width="180">
      </el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column prop="mg_state" label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="change_state(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            class="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row)"
          ></el-button>
          <el-button
            type="danger"
            class="el-icon-delete"
            size="mini"
            @click="removeUserById(scope.row.id)"
          ></el-button>
          <el-button
            type="warning"
            class="el-icon-setting"
            size="mini"
            @click="selectRole(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页功能 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="AddUserDialogVisible"
      width="30%"
      @close="closeDialog"
    >
      <!-- 添加用户表单信息 -->
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addUserFormRef"
        label-width="100px"
        class="login_form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="EditUserDialogVisible"
      width="50%"
      @close="closeEditDialog"
    >
      <!-- 修改用户表单信息 -->
      <el-form
        :model="EditUserForm"
        :rules="EditUserRules"
        ref="EditUserFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="EditUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="EditUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="EditUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setUserDialogVisible"
      width="50%"
      @close="resetID"
    >
      <div>
        <p>用户名的名称：{{ userInfo.username }}</p>
        <p>用户的角色：{{ userInfo.role_name }}</p>
        <p>
          分配新的角色：
          <el-select v-model="setRoleID" placeholder="请选择">
            <el-option
              v-for="item in roseList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }

      cb(new Error("请输入合法的邮箱"));
    };

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        return cb();
      }

      cb(new Error("请输入合法的手机号"));
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      //用户列表信息
      userlist: [],
      total: 0,
      //控制添加用户对话框的显示和隐藏
      AddUserDialogVisible: false,
      //添加用户的表单
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //添加用户的规则
      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      //修改用户表单
      EditUserForm: {},
      EditUserRules: {},
      //控制修改用户表单的显示和隐藏
      EditUserDialogVisible: false,
      //控制角色的对话框显示和隐藏
      setUserDialogVisible: false,
      //需要被分配角色的信息
      userInfo: {},
      //角色列表
      roseList: [],
      setRoleID: "",
    };
  },
  created() {
    this.getUserlist();
  },
  methods: {
    //获取用户列表信息
    async getUserlist() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(this.userlist);
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserlist();
    },
    //监听分页的页数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserlist();
    },
    //按钮状态开关
    async change_state(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200)
        return this.$message.error("修改用户状态失败");
      this.$message.success("修改用户状态成功");
    },
    //添加用户列表
    addUser() {
      this.AddUserDialogVisible = true;
    },
    //监听对话框
    closeDialog() {
      this.$refs.addUserFormRef.resetFields();
    },
    //添加用户的确定按钮
    addUserInfo() {
      this.$refs.addUserFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addUserForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
      });
      this.getUserlist();
      this.AddUserDialogVisible = false;
    },
    //修改用户的对话框
    async showEditDialog(row) {
      const { data: res } = await this.$http.get(`users/${row.id}`);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户信息失败");
      this.EditUserForm = res.data;
      this.EditUserDialogVisible = true;
    },
    // 关闭修改用户的对话框
    closeEditDialog() {},
    EditUserInfo() {
      this.$refs.EditUserFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `users/${this.EditUserForm.id}`,
          {
            email: this.EditUserForm.email,
            mobile: this.EditUserForm.mobile,
          }
        );
        if (res.meta.status !== 200) return this.$message.error("修改用户失败");
        this.$message.success("修改用户成功");
        this.EditUserDialogVisible = false;
        this.getUserlist();
      });
    },
    //删除用户
    async removeUserById(id) {
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
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getUserlist();
    },
    //分配角色
    async selectRole(userInfo) {
      this.userInfo = userInfo;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roseList = res.data;
      this.setUserDialogVisible = true;
    },
    async setUserInfo() {
      if (!this.setRoleID) {
        return this.$message.error("请选择要分配的角色");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.setRoleID,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败");
      }
      this.$message.success("更新角色成功");
      this.getUserlist();
      this.setUserDialogVisible = false;
    },
    // 关闭角色对话框
    resetID() {
      this.setRoleID = "";
      this.userInfo = {};
    },
  },
};
</script>

<style lang="less" scoped>
</style>