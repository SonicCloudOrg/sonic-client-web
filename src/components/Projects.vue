<el-main>
<el-alert
    title="欢迎来到Sonic-UI自动化测试平台，请选择项目进入"
    type="info"
    center
    :closable="false"
>
</el-alert>
<el-row style="margin-top: 10px" justify="center" type="flex">
  <el-col
      v-for="project in projectData"
      :key="project"
      :xs="12"
      :sm="8"
      :md="8"
      :lg="4"
      :xl="3"
  >
    <div @click="jump(project)">
      <el-card
          style="margin: 10px 10px; cursor: pointer"
          shadow="hover"
      >
        <div style="text-align: center">
          <el-avatar
              :src="project.projectImg"
              :size="150"
              shape="square"
          ></el-avatar>
        </div>
        <el-form
            label-position="left"
            class="demo-table-expand"
            style="margin-top: 10px"
        >
          <el-form-item style="text-align: center">
            <strong style="font-size: 17px">{{
                project.projectName
              }}</strong>
          </el-form-item>
          <el-form-item>
            <p
                style="
                                text-indent: 2em;
                                line-height: 30px;
                                margin-top: 0px;
                              "
            >
              {{
                project.projectDes.length > 30
                    ? project.projectDes.substring(0, 30) + "..."
                    : project.projectDes
              }}
            </p>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-col>
</el-row>
</el-main>