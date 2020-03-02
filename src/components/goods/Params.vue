<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意:只允许为第三级参数设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col class="goods_text">
          <span>选择商品分类:</span>
          <!-- 级联选择商品分类 -->
          <el-cascader
            v-model="selectedKeys"
            :options="categoryList"
            :props="cascaderProps"
            expand-trigger="hover"
            clearable
            change-on-select
            @change="categoryChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数的面板 -->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisiable=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable>{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showDialogEdit(scope.row.attr_id)"
                >编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisiable=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showDialogEdit(scope.row.attr_id)"
                >编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加参数的对话框 -->
        <el-dialog
          :title="'添加' + this.calculateTitle"
          :visible.sync="addDialogVisiable"
          width="50%"
          @close="addDialogClose"
        >
          <!-- 添加参数的对话框 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="calculateTitle" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisiable = false">取 消</el-button>
            <el-button type="primary" @click="addParamsClick">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog
          :title="'修改' + this.calculateTitle"
          :visible.sync="editDialogVisiable"
          width="50%"
          @close="editDialogClose"
        >
          <!-- 修改参数的对话框 -->
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="calculateTitle" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisiable = false">取 消</el-button>
            <el-button type="primary" @click="editParamsClick">确 定</el-button>
          </span>
        </el-dialog>
      </el-tabs>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表数据
      categoryList: [],
      // 级联选择框配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框选中中数组
      selectedKeys: [],
      // tab标签页 ,默认选中第一个
      activeName: 'many',
      // 动态参数数据
      manyTabData: [],
      // 静态属性的数据
      onlyTabData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisiable: false,
      // 控制修改对话框的显示与隐藏
      editDialogVisiable: false,
      // 添加表单的验证规则对象
      addForm: {
        attr_name: ''
      },
      // 修改表单的对象
      editForm: {},
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.categoryList = res.data
    },
    // 获取参数的列表数据
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return this.$message.error('请选中三级分类')
      }
      // 根据所选分类的Id和所选面板
      const { data: res } = await this.$http.get(
        `categories/${this.calculateCatId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取动态参数失败')
      }
      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals
          ? element.attr_vals.split(' ')
          : []
        // 为每个循环项添加一个变量来控制独有的一个项
        element.inputVisible = false
        // 文本框中输入的值
        element.inputValue = ''
      })
    },
    async categoryChange() {
      this.getParamsData()
    },
    // Tab标签点击事件
    handleTabClick() {
      this.getParamsData()
    },
    // 监听对话框的关闭事件
    addDialogClose() {
      // 重置表单的验证
      this.$refs.addFormRef.resetFields()
    },
    // 重置修改的表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    addParamsClick() {
      // 对表单进行预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post(
          `categories/${this.calculateCatId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.getParamsData()
        this.addDialogVisiable = false
        this.$message.success('添加参数成功')
      })
    },
    // 编辑
    async showDialogEdit(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.calculateCatId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisiable = true
    },
    // 确认编辑保存
    editParamsClick() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put(
          `categories/${this.calculateCatId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisiable = false
      })
    },
    // 文本框失去了焦点或者是按下了enter都会触发
    handleInputConfirm() {},
    // 控制文本框的和按钮的交替显示
    showInput(row) {
      row.inputVisible = true
    }
  },
  computed: {
    // 判断按钮的禁用与隐藏
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 计算当前选择的三级分类的id
    calculateCatId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    calculateTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style scoped>
.goods_text {
  margin: 10px 0;
  font-weight: 600;
}
.el-cascader {
  margin-left: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
