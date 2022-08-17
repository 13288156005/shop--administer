<template>
  <el-container class="container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="@/assets/heima.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="quiet">退出</el-button>
    </el-header>
    <!-- 主体区域  -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏导航 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
          unique-opened
          router
          :default-active="activePath"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <!-- 这是一级菜单 -->
          <el-submenu
            v-for="item in menulist"
            :key="item.id"
            :index="item.id + ''"
          >
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 这是二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容区域   -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconsObj: {
        125: "el-icon-user",
        103: "el-icon-lock",
        101: "el-icon-shopping-bag-1",
        102: "el-icon-document-copy",
        145: "el-icon-data-line",
      },
      // 被存的激活链接地址
      activePath: "",
      isCollapse: false,
    };
  },
  created() {
    this.getMenusList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    // 点击退出
    quiet() {
      // 清除token值
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取左侧菜单列表
    async getMenusList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200)
        return this.$message.error("获取左侧菜单失败");
      this.menulist = res.data;
      // console.log(this.menulist);
    },
    //获取path值
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  display: flex;
  padding-left: 0;
  font-size: 20px;
  align-items: center;
  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border: none;
  }
}
.iconfont {
  margin-right: 10px;
}

.toggle_button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.el-main {
  background-color: #eaedf1;
}
</style>