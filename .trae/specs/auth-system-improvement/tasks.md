# PanSou 认证系统改进 - 实现计划

## [ ] 任务 1: 实现密码哈希存储
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 引入 bcrypt 库用于密码哈希
  - 修改配置加载代码，对用户密码进行哈希处理
  - 更新登录验证逻辑，使用哈希比较替代明文比较
- **Acceptance Criteria Addressed**: AC-1, AC-5
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证密码哈希存储功能，确保密码被正确哈希
  - `programmatic` TR-1.2: 验证登录功能，确保使用哈希比较验证密码
  - `programmatic` TR-1.3: 验证向后兼容性，确保现有配置仍然有效
- **Notes**: 需要在 go.mod 中添加 bcrypt 依赖

## [ ] 任务 2: 改进 JWT 密钥生成机制
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 使用 crypto/rand 包生成安全的随机 JWT 密钥
  - 确保密钥长度足够（至少 32 字节）
  - 保持现有环境变量配置方式不变
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证未设置 AUTH_JWT_SECRET 时生成安全的随机密钥
  - `programmatic` TR-2.2: 验证设置 AUTH_JWT_SECRET 时使用用户提供的密钥
- **Notes**: 需要引入 crypto/rand 和 encoding/base64 包

## [ ] 任务 3: 完善认证中间件
- **Priority**: P0
- **Depends On**: 任务 1, 任务 2
- **Description**:
  - 增强认证中间件的错误处理能力
  - 确保C端接口不需要认证，只对管理接口进行认证
  - 优化中间件性能
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证中间件能正确处理无效 Token
  - `programmatic` TR-3.2: 验证中间件能正确处理过期 Token
  - `programmatic` TR-3.3: 验证中间件能正确处理缺失 Token
  - `programmatic` TR-3.4: 验证C端接口不需要认证
- **Notes**: 确保中间件对C端接口和公开接口（如 /api/auth/login）的排除逻辑正确

## [ ] 任务 4: 优化前端认证流程
- **Priority**: P1
- **Depends On**: 任务 1, 任务 2, 任务 3
- **Description**:
  - 优化前端登录状态管理
  - 实现 Token 过期自动处理
  - 提升认证相关的用户体验
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 验证前端登录流程顺畅
  - `human-judgment` TR-4.2: 验证 Token 过期时的处理逻辑
  - `human-judgment` TR-4.3: 验证登出功能正常
- **Notes**: 需要检查前端代码结构，确定需要修改的文件

## [ ] 任务 5: 测试和验证
- **Priority**: P0
- **Depends On**: 任务 1, 任务 2, 任务 3, 任务 4
- **Description**:
  - 编写和运行测试用例
  - 验证所有功能正常工作
  - 确保向后兼容性
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 运行完整的测试套件
  - `human-judgment` TR-5.2: 手动测试认证系统的各种场景
  - `programmatic` TR-5.3: 验证现有部署配置仍然有效
- **Notes**: 确保测试覆盖所有关键场景，包括边界情况