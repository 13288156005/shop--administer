<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 输入框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- table列表 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="95px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="upd_time" width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px ">
          <template>
            <el-button
              type="primary"
              class="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              class="el-icon-delete"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品列表
      goodsList: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
    };
  },
  created() {
    this.getGoodList();
  },
  methods: {
    async getGoodList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      console.log(this.goodsList);
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodList();
    },
    //监听分页的页数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodList();
    },
    //添加按钮
    addGoods() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style lang="less" scoped>
</style>