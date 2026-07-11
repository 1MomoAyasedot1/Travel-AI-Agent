// src/utils/request.js

/**
 * 处理流式接口请求 (SSE)
 * @param {string} url - 接口路径，例如 'chat'
 * @param {object} data - 发送给后端的参数，例如 { message: '你好' }
 * @param {function} onChunk - 收到每段内容的回调函数 (用于更新页面UI)
 * @param {function} onComplete - 流结束时的回调函数
 * @param {function} onError - 发生错误时的回调函数
 */
export async function fetchStream(url, data, onChunk, onComplete, onError) {
    // 1. 创建中止控制器，用于随时取消请求
    const controller = new AbortController();

    try {
        // 2. 发送 POST 请求
        // 【关键注意】这里不要写 http://127.0.0.1:3200，
        // 直接写 /api 开头，让 vite.config.js 里的 proxy 替你做转发！
        const response = await fetch(`/api/travel/${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }

        // 3. 获取响应体的流式读取器
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // 4. 不断循环读取后端流式返回的数据
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                // 如果后端流发送完毕，触发完成回调
                if (onComplete) onComplete();
                break;
            }

            // 将二进制数据解码为字符串
            const chunk = decoder.decode(value, { stream: true });
            
            // 按换行符切分，过滤掉空行
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                // 判断是否符合 SSE 协议标准：以 data: 开头
                if (line.startsWith('data:')) {
                    const jsonStr = line.substring(5).trim(); // 去掉 'data:'，并去掉前后空格
                    
                    if (jsonStr === '[DONE]') {
                        // 如果遇到 [DONE]，表示大模型回答结束
                        if (onComplete) onComplete(); 
                        return;
                    }
                    
                    try {
                        // 解析后端传来的 JSON 数据
                        const parsedData = JSON.parse(jsonStr);
                        // 触发回调，把文字传给 Vue 组件
                        if (onChunk) onChunk(parsedData);
                    } catch (parseError) {
                        console.warn("解析JSON片段失败:", parseError, jsonStr);
                    }
                }
            }
        }
    } catch (error) {
        // 捕获异常，触发错误回调
        if (onError) onError(error);
    }
}