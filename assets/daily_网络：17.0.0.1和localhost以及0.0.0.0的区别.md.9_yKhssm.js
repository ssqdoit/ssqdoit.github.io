import{_ as s,o as a,c as n,R as i}from"./chunks/framework.6kMW32Hq.js";const u=JSON.parse('{"title":"网络：17.0.0.1 和 localhost 以及 0.0.0.0 的区别","description":"","frontmatter":{},"headers":[],"relativePath":"daily/网络：17.0.0.1和localhost以及0.0.0.0的区别.md","filePath":"daily/网络：17.0.0.1和localhost以及0.0.0.0的区别.md","lastUpdated":1708930023000}'),e={name:"daily/网络：17.0.0.1和localhost以及0.0.0.0的区别.md"},l=i(`<h1 id="网络-17-0-0-1-和-localhost-以及-0-0-0-0-的区别" tabindex="-1">网络：17.0.0.1 和 localhost 以及 0.0.0.0 的区别 <a class="header-anchor" href="#网络-17-0-0-1-和-localhost-以及-0-0-0-0-的区别" aria-label="Permalink to &quot;网络：17.0.0.1 和 localhost 以及 0.0.0.0 的区别&quot;">​</a></h1><h2 id="_127-0-0-1" tabindex="-1">127.0.0.1 <a class="header-anchor" href="#_127-0-0-1" aria-label="Permalink to &quot;127.0.0.1&quot;">​</a></h2><p><code>127.0.0.1</code> 是一个 <strong>IPV4</strong> 地址，属于 <strong>本地回环地址</strong></p><blockquote><p><code>127</code> 开头的都是回环地址，即（<code>127.0.0.0</code> - <code>127.255.255.255</code>）</p><p>IPV6 地址表示为: <code>::1</code></p></blockquote><p>在终端可以使用 <strong>ifconfig</strong> 命令查看到该地址</p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ifconfig</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   lo0: flags=8049&lt;UP,LOOPBACK,RUNNING,MULTICAST&gt; mtu 16384</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#	    options=1203&lt;RXCSUM,TXCSUM,TXSTATUS,SW_TIMESTAMP&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#	    inet 127.0.0.1 netmask 0xff000000</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#	    inet6 ::1 prefixlen 128</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#	    inet6 fe80::1%lo0 prefixlen 64 sco</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   ...</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h2 id="localhost" tabindex="-1">localhost <a class="header-anchor" href="#localhost" aria-label="Permalink to &quot;localhost&quot;">​</a></h2><p>是一个特殊的域名，默认指向 <code>127.0.0.1</code></p><p>可以通过指令查看该域名映射关系，</p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /etc/hosts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># --------</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">##</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Host Database</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># localhost is used to configure the loopback interface</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># when the system is booting.  Do not change this entry.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">##</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">127.0.0.1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	localhost</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">255.255.255.255</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">	broadcasthost</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:1             </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">localhost</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h2 id="_0-0-0-0" tabindex="-1">0.0.0.0 <a class="header-anchor" href="#_0-0-0-0" aria-label="Permalink to &quot;0.0.0.0&quot;">​</a></h2><p><code>0.0.0.0</code> 是一个特殊的保留地址，通常用于表示&quot;未指定&quot;或&quot;任意&quot;的意义</p><p>当服务绑定到 <code>0.0.0.0</code> 地址时，表示该服务会在所有可用的网络接口上监听传入的连接，允许从任何接口接收数据。</p><p>例如：服务器 listen 的是 <code>0.0.0.0</code>，那么此时用 <code>127.0.0.1</code> 和 <strong>本机地址</strong> 都可以访问到服务。</p>`,14),p=[l];function t(o,h,r,c,d,k){return a(),n("div",null,p)}const g=s(e,[["render",t]]);export{u as __pageData,g as default};
