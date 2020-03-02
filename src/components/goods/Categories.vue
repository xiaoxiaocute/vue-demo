<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
        :show-row-hover="false"
        class="tree-table"
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 添加分类的对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCategoryDialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <el-form :model="addCateForm" :rules="addCateRules" label-width="100px" ref="addCateRef">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类" prop="cat_name">
            <el-cascader
              v-model="selectedKeys"
              :options="parentCategoryList"
              :props="cascaderProps"
              expand-trigger="hover"
              clearable
              change-on-select
              @change="parentCategoryChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategoryClick">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类的数据列表
      categoryList: [],
      //    总数据条数
      total: 0,
      //   查询条件
      queryInfo: {
        pagenum: 1,
        pagesize: 5,
        type: 3
      },
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   选中的父子id
      selectedKeys: [],
      parentCategoryList: [],
      //   控制添加分类的显示与隐藏
      addCategoryDialogVisible: false,
      //   添加表单的数据对象
      addCateForm: {
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类的等级:默认要添加的是一级分类
        cat_level: 0
      },
      //   添加表单验证规则的对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      },
      //    定义表格中的列
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ]
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取商品类别数据列表
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品类别数据失败')
      }
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategoryList()
    },
    // 添加分类点击事件
    addCategoryDialog() {
      // 先获取父级的数据列表
      this.getParentList()
      this.addCategoryDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类失败')
      }
      this.parentCategoryList = res.data
    },
    // 选择项发生变化之后触发
    parentCategoryChange() {
      // 如果selectKeys.length > 0 选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 获取表单中父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    },
    // 添加分类
    addCategoryClick() {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品类别失败')
        }
        this.$message.success('添加商品类别成功')
        this.getCategoryList()
        this.addCategoryDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表达那
    addDialogClose() {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>
<style scoped>
.tree-table {
  margin-top: 15px;
}
</style>
