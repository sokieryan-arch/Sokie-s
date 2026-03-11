\# BaziWriter - AI 故事生成器



基于八字命理的AI驱动故事生成工具。输入八字自动生成人物设定，再根据大运、流年、节点和背景自动生成故事情节。



\## 功能特性



\- 📋 \*\*八字输入\*\* - 输入出生日期和时辰

\- 🎭 \*\*人设生成\*\* - 自动生成详细的人物性格和命运特征

\- 📖 \*\*故事生成\*\* - 基于大运、流年、背景等要素自动生成连贯的故事情节

\- 🔄 \*\*双引擎支持\*\* - 支持 Google Gemini 和 Deepseek 两种AI模型



\## 版本说明



\- \*\*Gemini版本\*\* (`gemini\_version/`) - 使用Google Gemini 3.1 Pro

\- \*\*Deepseek版本\*\* (`deepseek\_version/`) - 使用Deepseek模型（更适合中国用户）



\## 安装



\### 要求

\- Python 3.8+

\- pip



\### 步骤



1\. 克隆仓库

```bash

git clone https://github.com/sokieryan-arch/baziwriter.git

cd baziwriter

```



2\. 创建虚拟环境

```bash

python -m venv venv

source venv/bin/activate  # Linux/Mac

\# 或

venv\\Scripts\\activate  # Windows

```



3\. 安装依赖

```bash

pip install -r requirements.txt

```



4\. 配置API密钥

```bash

cp .env.example .env

\# 编辑 .env 文件，填入你的API密钥

```



\## 使用方法



\### Gemini 版本

```bash

cd gemini\_version

python main.py

```



\### Deepseek 版本

```bash

cd deepseek\_version

python main.py

```



\### 使用流程



1\. 输入八字信息（年月日时）

2\. 系统生成人物设定

3\. 输入大运、流年、节点信息

4\. 输入故事背景设定

5\. AI自动生成故事情节



\## 项目结构



```

baziwriter/

├── gemini\_version/    # Gemini API 实现

├── deepseek\_version/  # Deepseek API 实现

├── docs/             # 文档

└── README.md         # 本文件

```



\## API 密钥获取



\### Gemini API

1\. 访问 \[Google AI Studio](https://aistudio.google.com)

2\. 创建新的API密钥

3\. 复制密钥到 `.env` 文件



\### Deepseek API

1\. 访问 \[Deepseek Platform](https://platform.deepseek.com)

2\. 注册并获取API密钥

3\. 复制密钥到 `.env` 文件



\## 示例



输入：

```

八字：1990年10月15日 14:30

大运流年：2024年 甲辰

背景：现代都市 财务工作者

```



输出：

```

人设：

\- 姓名建议：李琛

\- 性格特征：谨慎、理性、有责任感

\- 命运特征：财运亨通，但感情需要修为

\- ...



故事情节：

第一章：初入职场

李琛毕业后进入一家投资公司...

```



\## 许可证



MIT License - 详见 \[LICENSE](LICENSE) 文件



\## 贡献



欢迎提交 Issues 和 Pull Requests！



\## 免责声明



本项目仅为娱乐和创意写作之用。八字命理仅供参考，不构成任何预测或建议的保证。



\## 联系方式



如有问题或建议，欢迎提交 Issue 或 Discussion。

