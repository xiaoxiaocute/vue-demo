<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <!-- 表格 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!-- 使用自定义插槽的方式自定义格式 -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'">一级权限</el-tag>
            <el-tag type="success" v-if="scope.row.level==='1'">二级权限</el-tag>
            <el-tag type="warning" v-if="scope.row.level==='2'">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created() {
    // 获取权限列表数据
    this.getRightList()
  },
  methods: {
    async getRightList() {
      const { data: res } = await this.$http.get('/rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rightsList = res.data
    }
  }
}
</script>
<style scoped>
</style>
