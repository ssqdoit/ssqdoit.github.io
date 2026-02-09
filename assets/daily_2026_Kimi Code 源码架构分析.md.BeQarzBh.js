import{_ as s,c as n,o as a,a5 as l}from"./chunks/framework.DHgPyqoO.js";const _=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"daily/2026/Kimi Code 源码架构分析.md","filePath":"daily/2026/Kimi Code 源码架构分析.md","lastUpdated":1770626447000}'),e={name:"daily/2026/Kimi Code 源码架构分析.md"},p=l(`<p>Kimi Code 源码架构分析</p><h2 id="项目概述" tabindex="-1">项目概述 <a class="header-anchor" href="#项目概述" aria-label="Permalink to &quot;项目概述&quot;">​</a></h2><p>Kimi Code CLI 是一个基于 AI 的 CLI 代理工具，用于软件工程工作流。支持交互式 Shell UI、ACP 服务器模式（IDE 集成）和 MCP 工具加载。</p><h2 id="技术栈" tabindex="-1">技术栈 <a class="header-anchor" href="#技术栈" aria-label="Permalink to &quot;技术栈&quot;">​</a></h2><ul><li>语言：Python 3.12+（工具配置为 3.14）</li><li>CLI 框架：Typer</li><li>异步运行时：asyncio</li><li>LLM 框架：kosong（统一消息结构、异步工具编排、可插拔聊天提供者）</li><li>MCP 集成：fastmcp</li><li>日志：loguru</li><li>包管理/构建：uv + uv_build；PyInstaller 用于二进制构建</li><li>测试：pytest + pytest-asyncio</li><li>代码质量：ruff（lint/format）、pyright + ty（类型检查）</li></ul><h2 id="核心架构" tabindex="-1">核心架构 <a class="header-anchor" href="#核心架构" aria-label="Permalink to &quot;核心架构&quot;">​</a></h2><h3 id="_1-入口层-cli" tabindex="-1">1. 入口层（CLI） <a class="header-anchor" href="#_1-入口层-cli" aria-label="Permalink to &quot;1. 入口层（CLI）&quot;">​</a></h3><div class="language-12:14:src/kimi_cli/cli/__init__.py vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">12:14:src/kimi_cli/cli/__init__.py</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>cli = typer.Typer(</span></span>
<span class="line"><span>    epilog=&quot;&quot;&quot;\\b\\</span></span>
<span class="line"><span>Documentation:        https://moonshotai.github.io/kimi-cli/\\n</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><ul><li>位置：<code>src/kimi_cli/cli/__init__.py</code></li><li>功能：解析命令行参数，支持多种 UI 模式（shell/print/acp/wire）</li><li>子命令：<code>info</code>、<code>mcp</code>、<code>web</code>、<code>login</code>、<code>logout</code>、<code>acp</code>、<code>term</code></li></ul><h3 id="_2-应用层-app" tabindex="-1">2. 应用层（App） <a class="header-anchor" href="#_2-应用层-app" aria-label="Permalink to &quot;2. 应用层（App）&quot;">​</a></h3><div class="language-54:168:src/kimi_cli/app.py vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">54:168:src/kimi_cli/app.py</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>class KimiCLI:</span></span>
<span class="line"><span>    @staticmethod</span></span>
<span class="line"><span>    async def create(</span></span>
<span class="line"><span>        session: Session,</span></span>
<span class="line"><span>        *,</span></span>
<span class="line"><span>        # Basic configuration</span></span>
<span class="line"><span>        config: Config | Path | None = None,</span></span>
<span class="line"><span>        model_name: str | None = None,</span></span>
<span class="line"><span>        thinking: bool | None = None,</span></span>
<span class="line"><span>        # Run mode</span></span>
<span class="line"><span>        yolo: bool = False,</span></span>
<span class="line"><span>        # Extensions</span></span>
<span class="line"><span>        agent_file: Path | None = None,</span></span>
<span class="line"><span>        mcp_configs: list[MCPConfig] | list[dict[str, Any]] | None = None,</span></span>
<span class="line"><span>        skills_dir: KaosPath | None = None,</span></span>
<span class="line"><span>        # Loop control</span></span>
<span class="line"><span>        max_steps_per_turn: int | None = None,</span></span>
<span class="line"><span>        max_retries_per_step: int | None = None,</span></span>
<span class="line"><span>        max_ralph_iterations: int | None = None,</span></span>
<span class="line"><span>    ) -&gt; KimiCLI:</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><ul><li>位置：<code>src/kimi_cli/app.py</code></li><li>职责： <ul><li>加载配置和模型</li><li>创建 Runtime 和 Agent</li><li>初始化 KimiSoul</li><li>提供多种运行模式（shell/print/acp/wire）</li></ul></li></ul><h3 id="_3-核心代理层-soul" tabindex="-1">3. 核心代理层（Soul） <a class="header-anchor" href="#_3-核心代理层-soul" aria-label="Permalink to &quot;3. 核心代理层（Soul）&quot;">​</a></h3><h4 id="_3-1-kimisoul-主循环" tabindex="-1">3.1 KimiSoul（主循环） <a class="header-anchor" href="#_3-1-kimisoul-主循环" aria-label="Permalink to &quot;3.1 KimiSoul（主循环）&quot;">​</a></h4><div class="language-89:208:src/kimi_cli/soul/kimisoul.py vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">89:208:src/kimi_cli/soul/kimisoul.py</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>class KimiSoul:</span></span>
<span class="line"><span>    &quot;&quot;&quot;The soul of Kimi Code CLI.&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    def __init__(</span></span>
<span class="line"><span>        self,</span></span>
<span class="line"><span>        agent: Agent,</span></span>
<span class="line"><span>        *,</span></span>
<span class="line"><span>        context: Context,</span></span>
<span class="line"><span>    ):</span></span>
<span class="line"><span>        &quot;&quot;&quot;</span></span>
<span class="line"><span>        Initialize the soul.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Args:</span></span>
<span class="line"><span>            agent (Agent): The agent to run.</span></span>
<span class="line"><span>            context (Context): The context of the agent.</span></span>
<span class="line"><span>        &quot;&quot;&quot;</span></span>
<span class="line"><span>        self._agent = agent</span></span>
<span class="line"><span>        self._runtime = agent.runtime</span></span>
<span class="line"><span>        self._denwa_renji = agent.runtime.denwa_renji</span></span>
<span class="line"><span>        self._approval = agent.runtime.approval</span></span>
<span class="line"><span>        self._context = context</span></span>
<span class="line"><span>        self._loop_control = agent.runtime.config.loop_control</span></span>
<span class="line"><span>        self._compaction = SimpleCompaction()  # TODO: maybe configurable and composable</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        for tool in agent.toolset.tools:</span></span>
<span class="line"><span>            if tool.name == SendDMail_NAME:</span></span>
<span class="line"><span>                self._checkpoint_with_user_message = True</span></span>
<span class="line"><span>                break</span></span>
<span class="line"><span>        else:</span></span>
<span class="line"><span>            self._checkpoint_with_user_message = False</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        self._slash_commands = self._build_slash_commands()</span></span>
<span class="line"><span>        self._slash_command_map = self._index_slash_commands(self._slash_commands)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def name(self) -&gt; str:</span></span>
<span class="line"><span>        return self._agent.name</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def model_name(self) -&gt; str:</span></span>
<span class="line"><span>        return self._runtime.llm.chat_provider.model_name if self._runtime.llm else &quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def model_capabilities(self) -&gt; set[ModelCapability] | None:</span></span>
<span class="line"><span>        if self._runtime.llm is None:</span></span>
<span class="line"><span>            return None</span></span>
<span class="line"><span>        return self._runtime.llm.capabilities</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def thinking(self) -&gt; bool | None:</span></span>
<span class="line"><span>        &quot;&quot;&quot;Whether thinking mode is enabled.&quot;&quot;&quot;</span></span>
<span class="line"><span>        if self._runtime.llm is None:</span></span>
<span class="line"><span>            return None</span></span>
<span class="line"><span>        if thinking_effort := self._runtime.llm.chat_provider.thinking_effort:</span></span>
<span class="line"><span>            return thinking_effort != &quot;off&quot;</span></span>
<span class="line"><span>        return None</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def status(self) -&gt; StatusSnapshot:</span></span>
<span class="line"><span>        return StatusSnapshot(</span></span>
<span class="line"><span>            context_usage=self._context_usage,</span></span>
<span class="line"><span>            yolo_enabled=self._approval.is_yolo(),</span></span>
<span class="line"><span>        )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def agent(self) -&gt; Agent:</span></span>
<span class="line"><span>        return self._agent</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def runtime(self) -&gt; Runtime:</span></span>
<span class="line"><span>        return self._runtime</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def context(self) -&gt; Context:</span></span>
<span class="line"><span>        return self._context</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def _context_usage(self) -&gt; float:</span></span>
<span class="line"><span>        if self._runtime.llm is not None:</span></span>
<span class="line"><span>            return self._context.token_count / self._runtime.llm.max_context_size</span></span>
<span class="line"><span>        return 0.0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def wire_file(self) -&gt; WireFile:</span></span>
<span class="line"><span>        return self._runtime.session.wire_file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    async def _checkpoint(self):</span></span>
<span class="line"><span>        await self._context.checkpoint(self._checkpoint_with_user_message)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def available_slash_commands(self) -&gt; list[SlashCommand[Any]]:</span></span>
<span class="line"><span>        return self._slash_commands</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    async def run(self, user_input: str | list[ContentPart]):</span></span>
<span class="line"><span>        # Refresh OAuth tokens on each turn to avoid idle-time expirations.</span></span>
<span class="line"><span>        await self._runtime.oauth.ensure_fresh(self._runtime)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        wire_send(TurnBegin(user_input=user_input))</span></span>
<span class="line"><span>        user_message = Message(role=&quot;user&quot;, content=user_input)</span></span>
<span class="line"><span>        text_input = user_message.extract_text(&quot; &quot;).strip()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if command_call := parse_slash_command_call(text_input):</span></span>
<span class="line"><span>            command = self._find_slash_command(command_call.name)</span></span>
<span class="line"><span>            if command is None:</span></span>
<span class="line"><span>                # this should not happen actually, the shell should have filtered it out</span></span>
<span class="line"><span>                wire_send(TextPart(text=f&#39;Unknown slash command &quot;/{command_call.name}&quot;.&#39;))</span></span>
<span class="line"><span>            else:</span></span>
<span class="line"><span>                ret = command.func(self, command_call.args)</span></span>
<span class="line"><span>                if isinstance(ret, Awaitable):</span></span>
<span class="line"><span>                    await ret</span></span>
<span class="line"><span>        elif self._loop_control.max_ralph_iterations != 0:</span></span>
<span class="line"><span>            runner = FlowRunner.ralph_loop(</span></span>
<span class="line"><span>                user_message,</span></span>
<span class="line"><span>                self._loop_control.max_ralph_iterations,</span></span>
<span class="line"><span>            )</span></span>
<span class="line"><span>            await runner.run(self, &quot;&quot;)</span></span>
<span class="line"><span>        else:</span></span>
<span class="line"><span>            await self._turn(user_message)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        wire_send(TurnEnd())</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br></div></div><ul><li>位置：<code>src/kimi_cli/soul/kimisoul.py</code></li><li>职责： <ul><li>执行代理主循环（<code>_turn</code> → <code>_agent_loop</code> → <code>_step</code>）</li><li>处理工具调用</li><li>管理上下文压缩</li><li>处理斜杠命令和技能</li></ul></li></ul><h4 id="_3-2-runtime-运行时环境" tabindex="-1">3.2 Runtime（运行时环境） <a class="header-anchor" href="#_3-2-runtime-运行时环境" aria-label="Permalink to &quot;3.2 Runtime（运行时环境）&quot;">​</a></h4><div class="language-63:124:src/kimi_cli/soul/agent.py vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">63:124:src/kimi_cli/soul/agent.py</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>@dataclass(slots=True, kw_only=True)</span></span>
<span class="line"><span>class Runtime:</span></span>
<span class="line"><span>    &quot;&quot;&quot;Agent runtime.&quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    config: Config</span></span>
<span class="line"><span>    oauth: OAuthManager</span></span>
<span class="line"><span>    llm: LLM | None  # we do not freeze the \`Runtime\` dataclass because LLM can be changed</span></span>
<span class="line"><span>    session: Session</span></span>
<span class="line"><span>    builtin_args: BuiltinSystemPromptArgs</span></span>
<span class="line"><span>    denwa_renji: DenwaRenji</span></span>
<span class="line"><span>    approval: Approval</span></span>
<span class="line"><span>    labor_market: LaborMarket</span></span>
<span class="line"><span>    environment: Environment</span></span>
<span class="line"><span>    skills: dict[str, Skill]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @staticmethod</span></span>
<span class="line"><span>    async def create(</span></span>
<span class="line"><span>        config: Config,</span></span>
<span class="line"><span>        oauth: OAuthManager,</span></span>
<span class="line"><span>        llm: LLM | None,</span></span>
<span class="line"><span>        session: Session,</span></span>
<span class="line"><span>        yolo: bool,</span></span>
<span class="line"><span>        skills_dir: KaosPath | None = None,</span></span>
<span class="line"><span>    ) -&gt; Runtime:</span></span>
<span class="line"><span>        ls_output, agents_md, environment = await asyncio.gather(</span></span>
<span class="line"><span>            list_directory(session.work_dir),</span></span>
<span class="line"><span>            load_agents_md(session.work_dir),</span></span>
<span class="line"><span>            Environment.detect(),</span></span>
<span class="line"><span>        )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        # Discover and format skills</span></span>
<span class="line"><span>        skills_roots = await resolve_skills_roots(session.work_dir, skills_dir_override=skills_dir)</span></span>
<span class="line"><span>        skills = await discover_skills_from_roots(skills_roots)</span></span>
<span class="line"><span>        skills_by_name = index_skills(skills)</span></span>
<span class="line"><span>        logger.info(&quot;Discovered {count} skill(s)&quot;, count=len(skills))</span></span>
<span class="line"><span>        skills_formatted = &quot;\\n&quot;.join(</span></span>
<span class="line"><span>            (</span></span>
<span class="line"><span>                f&quot;- {skill.name}\\n&quot;</span></span>
<span class="line"><span>                f&quot;  - Path: {skill.skill_md_file}\\n&quot;</span></span>
<span class="line"><span>                f&quot;  - Description: {skill.description}&quot;</span></span>
<span class="line"><span>            )</span></span>
<span class="line"><span>            for skill in skills</span></span>
<span class="line"><span>        )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        return Runtime(</span></span>
<span class="line"><span>            config=config,</span></span>
<span class="line"><span>            oauth=oauth,</span></span>
<span class="line"><span>            llm=llm,</span></span>
<span class="line"><span>            session=session,</span></span>
<span class="line"><span>            builtin_args=BuiltinSystemPromptArgs(</span></span>
<span class="line"><span>                KIMI_NOW=datetime.now().astimezone().isoformat(),</span></span>
<span class="line"><span>                KIMI_WORK_DIR=session.work_dir,</span></span>
<span class="line"><span>                KIMI_WORK_DIR_LS=ls_output,</span></span>
<span class="line"><span>                KIMI_AGENTS_MD=agents_md or &quot;&quot;,</span></span>
<span class="line"><span>                KIMI_SKILLS=skills_formatted or &quot;No skills found.&quot;,</span></span>
<span class="line"><span>            ),</span></span>
<span class="line"><span>            denwa_renji=DenwaRenji(),</span></span>
<span class="line"><span>            approval=Approval(yolo=yolo),</span></span>
<span class="line"><span>            labor_market=LaborMarket(),</span></span>
<span class="line"><span>            environment=environment,</span></span>
<span class="line"><span>            skills=skills_by_name,</span></span>
<span class="line"><span>        )</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br></div></div><ul><li>位置：<code>src/kimi_cli/soul/agent.py</code></li><li>职责： <ul><li>管理配置、OAuth、LLM、会话</li><li>提供内置系统提示参数</li><li>管理技能发现和索引</li><li>管理子代理（LaborMarket）</li></ul></li></ul><h4 id="_3-3-context-上下文管理" tabindex="-1">3.3 Context（上下文管理） <a class="header-anchor" href="#_3-3-context-上下文管理" aria-label="Permalink to &quot;3.3 Context（上下文管理）&quot;">​</a></h4><ul><li>位置：<code>src/kimi_cli/soul/context.py</code></li><li>职责： <ul><li>管理对话历史</li><li>实现检查点机制</li><li>跟踪 token 使用</li></ul></li></ul><h4 id="_3-4-toolset-工具系统" tabindex="-1">3.4 Toolset（工具系统） <a class="header-anchor" href="#_3-4-toolset-工具系统" aria-label="Permalink to &quot;3.4 Toolset（工具系统）&quot;">​</a></h4><ul><li>位置：<code>src/kimi_cli/soul/toolset.py</code></li><li>职责： <ul><li>加载工具（内置 + MCP）</li><li>执行工具调用</li><li>注入依赖</li></ul></li></ul><h3 id="_4-工具系统-tools" tabindex="-1">4. 工具系统（Tools） <a class="header-anchor" href="#_4-工具系统-tools" aria-label="Permalink to &quot;4. 工具系统（Tools）&quot;">​</a></h3><p>内置工具位于 <code>src/kimi_cli/tools/</code>：</p><ul><li>文件操作：<code>file/</code>（read, write, replace, grep, glob）</li><li>Shell 命令：<code>shell/</code>（bash, powershell）</li><li>Web 操作：<code>web/</code>（fetch, search）</li><li>多代理：<code>multiagent/</code>（task, create）</li><li>其他：<code>dmail/</code>、<code>think/</code>、<code>todo/</code></li></ul><h3 id="_5-通信层-wire" tabindex="-1">5. 通信层（Wire） <a class="header-anchor" href="#_5-通信层-wire" aria-label="Permalink to &quot;5. 通信层（Wire）&quot;">​</a></h3><div class="language-18:56:src/kimi_cli/wire/__init__.py vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">18:56:src/kimi_cli/wire/__init__.py</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>class Wire:</span></span>
<span class="line"><span>    &quot;&quot;&quot;</span></span>
<span class="line"><span>    A spmc channel for communication between the soul and the UI during a soul run.</span></span>
<span class="line"><span>    &quot;&quot;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    def __init__(self, *, file_backend: WireFile | None = None):</span></span>
<span class="line"><span>        self._raw_queue = WireMessageQueue()</span></span>
<span class="line"><span>        self._merged_queue = WireMessageQueue()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        self._soul_side = WireSoulSide(self._raw_queue, self._merged_queue)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if file_backend is not None:</span></span>
<span class="line"><span>            # record all complete Wire messages to the file backend</span></span>
<span class="line"><span>            self._recorder = _WireRecorder(file_backend, self._merged_queue.subscribe())</span></span>
<span class="line"><span>        else:</span></span>
<span class="line"><span>            self._recorder = None</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @property</span></span>
<span class="line"><span>    def soul_side(self) -&gt; WireSoulSide:</span></span>
<span class="line"><span>        return self._soul_side</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    def ui_side(self, *, merge: bool) -&gt; WireUISide:</span></span>
<span class="line"><span>        &quot;&quot;&quot;</span></span>
<span class="line"><span>        Create a UI side of the \`Wire\`.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Args:</span></span>
<span class="line"><span>            merge: Whether to merge \`Wire\` messages as much as possible.</span></span>
<span class="line"><span>        &quot;&quot;&quot;</span></span>
<span class="line"><span>        if merge:</span></span>
<span class="line"><span>            return WireUISide(self._merged_queue.subscribe())</span></span>
<span class="line"><span>        else:</span></span>
<span class="line"><span>            return WireUISide(self._raw_queue.subscribe())</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    def shutdown(self) -&gt; None:</span></span>
<span class="line"><span>        self.soul_side.flush()</span></span>
<span class="line"><span>        logger.debug(&quot;Shutting down wire&quot;)</span></span>
<span class="line"><span>        self._raw_queue.shutdown()</span></span>
<span class="line"><span>        self._merged_queue.shutdown()</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br></div></div><ul><li>位置：<code>src/kimi_cli/wire/</code></li><li>职责： <ul><li>在 Soul 和 UI 之间传递消息</li><li>支持消息合并</li><li>支持文件后端记录</li></ul></li></ul><h3 id="_6-ui-层" tabindex="-1">6. UI 层 <a class="header-anchor" href="#_6-ui-层" aria-label="Permalink to &quot;6. UI 层&quot;">​</a></h3><ul><li>Shell UI：<code>src/kimi_cli/ui/shell/</code>（交互式 TUI）</li><li>Print UI：<code>src/kimi_cli/ui/print/</code>（非交互式输出）</li><li>ACP UI：<code>src/kimi_cli/ui/acp/</code>（ACP 协议支持）</li><li>Web UI：<code>src/kimi_cli/web/</code>（Web 界面）</li></ul><h3 id="_7-配置与扩展" tabindex="-1">7. 配置与扩展 <a class="header-anchor" href="#_7-配置与扩展" aria-label="Permalink to &quot;7. 配置与扩展&quot;">​</a></h3><h4 id="_7-1-agent-规范" tabindex="-1">7.1 Agent 规范 <a class="header-anchor" href="#_7-1-agent-规范" aria-label="Permalink to &quot;7.1 Agent 规范&quot;">​</a></h4><ul><li>位置：<code>src/kimi_cli/agents/</code>（YAML 文件）</li><li>功能： <ul><li>定义系统提示</li><li>选择工具</li><li>定义固定子代理</li><li>支持继承（extend）</li></ul></li></ul><h4 id="_7-2-skills-技能" tabindex="-1">7.2 Skills（技能） <a class="header-anchor" href="#_7-2-skills-技能" aria-label="Permalink to &quot;7.2 Skills（技能）&quot;">​</a></h4><ul><li>位置：<code>src/kimi_cli/skills/</code> 和用户目录</li><li>类型： <ul><li>标准技能：<code>/skill:&lt;name&gt;</code></li><li>流程技能：<code>/flow:&lt;name&gt;</code></li></ul></li></ul><h4 id="_7-3-mcp-集成" tabindex="-1">7.3 MCP 集成 <a class="header-anchor" href="#_7-3-mcp-集成" aria-label="Permalink to &quot;7.3 MCP 集成&quot;">​</a></h4><ul><li>位置：<code>src/kimi_cli/mcp.py</code>、<code>src/kimi_cli/cli/mcp.py</code></li><li>功能：加载和管理 MCP 服务器工具</li></ul><h2 id="数据流" tabindex="-1">数据流 <a class="header-anchor" href="#数据流" aria-label="Permalink to &quot;数据流&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>用户输入</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>CLI 解析 (cli/__init__.py)</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>KimiCLI.create() (app.py)</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>Runtime.create() + Agent.load()</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>KimiSoul.run() (soul/kimisoul.py)</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>_turn() → _agent_loop() → _step()</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>LLM 调用 (kosong) + 工具执行</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>Wire 消息 → UI 层</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>用户看到结果</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h2 id="关键特性" tabindex="-1">关键特性 <a class="header-anchor" href="#关键特性" aria-label="Permalink to &quot;关键特性&quot;">​</a></h2><ol><li>多模式运行：Shell/Print/ACP/Wire</li><li>工具扩展：内置工具 + MCP 工具</li><li>技能系统：标准技能和流程技能</li><li>子代理：支持多代理协作</li><li>上下文管理：检查点、压缩、D-Mail</li><li>审批机制：工具调用需要用户批准（可配置 yolo 模式）</li></ol><h2 id="项目组织" tabindex="-1">项目组织 <a class="header-anchor" href="#项目组织" aria-label="Permalink to &quot;项目组织&quot;">​</a></h2><ul><li>Monorepo：使用 uv workspace 管理多个包</li><li>工作区包： <ul><li><code>packages/kosong/</code>：LLM 抽象层</li><li><code>packages/kaos/</code>：操作系统抽象层</li><li><code>packages/kimi-code/</code>：Kimi Code 相关</li><li><code>sdks/kimi-sdk/</code>：SDK</li></ul></li></ul><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>采用分层架构：</p><ul><li>入口层：CLI 参数解析</li><li>应用层：初始化和协调</li><li>核心层：代理循环和运行时</li><li>工具层：可扩展工具系统</li><li>通信层：Soul-UI 消息传递</li><li>UI 层：多种界面实现</li></ul><p>设计强调模块化、可扩展性和异步处理，支持多种运行模式和扩展方式。</p>`,48),i=[p];function r(c,o,t,u,b,m){return a(),n("div",null,i)}const h=s(e,[["render",r]]);export{_ as __pageData,h as default};
