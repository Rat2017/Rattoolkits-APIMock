const { createApp, ref, reactive, onMounted, onUnmounted } = Vue;

const APP_PORT = 8899;

const app = createApp({
  setup() {
    const serverRunning = ref(false);
    const endpoints = ref([]);
    const logs = ref([]);
    const editingId = ref('');
    const eventSource = ref(null);

    const formData = reactive({
      method: 'GET',
      path: '',
      statusCode: 200,
      delay: 0,
      response: ''
    });

    const toast = reactive({
      show: false,
      message: '',
      type: 'info'
    });

    const API_BASE = `http://localhost:${APP_PORT}/api`;

    const showToast = (message, type = 'info') => {
      toast.message = message;
      toast.type = type;
      toast.show = true;
      setTimeout(() => {
        toast.show = false;
      }, 3000);
    };

    const fetchEndpoints = async () => {
      try {
        const res = await fetch(`${API_BASE}/endpoints`);
        endpoints.value = await res.json();
      } catch (e) {
        console.error('Failed to fetch endpoints:', e);
      }
    };

    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/logs`);
        logs.value = await res.json();
      } catch (e) {
        console.error('Failed to fetch logs:', e);
      }
    };

    const checkServerStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/server/status`);
        const data = await res.json();
        serverRunning.value = data.running;
      } catch (e) {
        serverRunning.value = false;
      }
    };

    const toggleServer = async () => {
      try {
        const endpoint = serverRunning.value ? 'server/stop' : 'server/start';
        await fetch(`${API_BASE}/${endpoint}`, { method: 'POST' });
        serverRunning.value = !serverRunning.value;
        showToast(serverRunning.value ? '服务已启动' : '服务已停止', 'success');
        await checkServerStatus();
      } catch (e) {
        showToast('操作失败: ' + e.message, 'error');
      }
    };

    const submitEndpoint = async () => {
      const data = {
        method: formData.method,
        path: formData.path,
        statusCode: formData.statusCode || 200,
        delay: formData.delay || 0,
        response: formData.response || '{}'
      };

      try {
        if (editingId.value) {
          await fetch(`${API_BASE}/endpoints/${editingId.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          showToast('端点已更新', 'success');
        } else {
          await fetch(`${API_BASE}/endpoints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          showToast('端点已创建', 'success');
        }
        cancelEdit();
        await fetchEndpoints();
      } catch (e) {
        showToast('操作失败: ' + e.message, 'error');
      }
    };

    const editEndpoint = (ep) => {
      editingId.value = ep.id;
      formData.method = ep.method;
      formData.path = ep.path;
      formData.statusCode = ep.statusCode;
      formData.delay = ep.delay || 0;
      formData.response = typeof ep.response === 'object' ? JSON.stringify(ep.response, null, 2) : ep.response;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
      editingId.value = '';
      formData.method = 'GET';
      formData.path = '';
      formData.statusCode = 200;
      formData.delay = 0;
      formData.response = '';
    };

    const deleteEndpoint = async (id) => {
      if (!confirm('确定要删除这个端点吗？')) return;

      try {
        await fetch(`${API_BASE}/endpoints/${id}`, { method: 'DELETE' });
        await fetchEndpoints();
        showToast('端点已删除', 'success');
      } catch (e) {
        showToast('删除失败: ' + e.message, 'error');
      }
    };

    const toggleEndpoint = async (id, enabled) => {
      try {
        const res = await fetch(`${API_BASE}/endpoints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled })
        });
        const data = await res.json();
        if (res.ok) {
          await fetchEndpoints();
          showToast(enabled ? '端点已启用' : '端点已禁用', 'success');
        } else {
          showToast(data.error || '操作失败', 'error');
        }
      } catch (e) {
        showToast('操作失败: ' + e.message, 'error');
      }
    };

    const copyUrl = async (path) => {
      const fullUrl = `http://localhost:${APP_PORT}${path}`;
      try {
        await navigator.clipboard.writeText(fullUrl);
        showToast('URL 已复制到剪贴板', 'success');
      } catch (e) {
        showToast('复制失败', 'error');
      }
    };

    const formatJson = (response) => {
      if (typeof response === 'object') {
        return JSON.stringify(response, null, 2);
      }
      return response || '{}';
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const connectLogStream = () => {
      if (eventSource.value) {
        eventSource.value.close();
      }

      eventSource.value = new EventSource(`${API_BASE}/logs/stream`);

      eventSource.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          logs.value = data.logs || [];
        } else {
          logs.value.unshift(data);
          if (logs.value.length > 100) logs.value.pop();
        }
      };

      eventSource.value.onerror = () => {
        eventSource.value.close();
        setTimeout(connectLogStream, 5000);
      };
    };

    onMounted(() => {
      checkServerStatus();
      fetchEndpoints();
      fetchLogs();
      connectLogStream();

      setInterval(async () => {
        await checkServerStatus();
        await fetchEndpoints();
        await fetchLogs();
      }, 5000);
    });

    onUnmounted(() => {
      if (eventSource.value) {
        eventSource.value.close();
      }
    });

    return {
      serverRunning,
      endpoints,
      logs,
      editingId,
      formData,
      toast,
      toggleServer,
      submitEndpoint,
      editEndpoint,
      cancelEdit,
      deleteEndpoint,
      toggleEndpoint,
      copyUrl,
      formatJson,
      formatTime
    };
  }
});

app.mount('#app');
