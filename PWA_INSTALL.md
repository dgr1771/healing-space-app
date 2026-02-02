# 疗愈空间 - PWA 安装指南

## 📱 将应用安装到手机

### 第一步：生成应用图标

1. 在浏览器中打开：`http://localhost:3001/generate-icons.html`
2. 点击"生成所有图标"按钮
3. 下载所有生成的图标到 `public/icons/` 目录
4. 确保文件名正确：
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png
   - icon-maskable-192x192.png
   - icon-maskable-512x512.png

5. 重启开发服务器

### 第二步：在 iPhone 上安装

1. 在 Safari 浏览器中打开应用：`http://你的服务器IP:3001`
2. 点击底部的"分享"按钮（方框向上箭头）
3. 向下滚动，点击"添加到主屏幕"
4. 点击"添加"按钮

应用将出现在主屏幕上，图标就像原生应用一样！

### 第三步：在 Android 上安装

1. 在 Chrome 浏览器中打开应用
2. 点击浏览器菜单（三个点）
3. 点击"添加到主屏幕"或"安装应用"
4. 点击"添加"或"安装"

应用将出现在主屏幕上！

## 🌐 部署到生产环境

### 方案 1: 使用 Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 方案 2: 使用 Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod
```

### 方案 3: 使用自己的服务器

```bash
# 构建生产版本
npm run build

# 将 dist 目录上传到服务器
# 配置 nginx 或 apache 指向 dist 目录
```

## 📦 打包成原生应用（可选）

### 使用 Capacitor 打包

```bash
# 安装 Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# 添加平台
npx cap add ios
npx cap add android

# 构建
npm run build

# 同步
npx cap sync

# 打开项目
npx cap open ios    # 需要 macOS 和 Xcode
npx cap open android # 需要 Android Studio
```

## ✅ PWA 功能清单

- ✅ 可添加到主屏幕
- ✅ 离线工作
- ✅ 全屏模式
- ✅ 应用图标
- ✅ 启动画面
- ✅ 主题颜色
- ✅ 应用快捷方式
- ✅ 安全区域适配（刘海屏）

## 🔧 常见问题

### Q: iOS 上提示"无法添加到主屏幕"？

A: 确保使用 HTTPS 或 localhost。iOS 不允许从 HTTP 网站添加 PWA。

### Q: 图标不显示？

A: 检查图标文件是否正确放置在 `public/icons/` 目录，文件名是否正确。

### Q: Service Worker 不工作？

A: 确保 HTTPS 连接。Service Worker 只能在安全上下文中运行。

## 📱 二维码下载

您可以使用在线工具生成二维码，方便手机扫码安装：

1. 访问 https://www.qr-code-generator.com/
2. 输入您的应用 URL
3. 下载二维码图片
4. 用户扫码即可直接访问应用

## 🎨 自定义图标

如果想要自定义图标：

1. 使用 512x512 像素的 PNG 图片
2. 使用工具（如 https://realfavicongenerator.net/）生成所有尺寸
3. 替换 `public/icons/` 目录中的图标文件

## 📊 应用预览

- **应用名称**: 疗愈空间
- **主题颜色**: #007AFF（iOS 蓝色）
- **分类**: 健康、健身
- **功能**: 盆底肌训练、睡眠监测、冥想练习
