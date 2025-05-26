// fig1.js
// 负责“图表 1”的绘制逻辑
export function drawFig1() {
  const ctx = document.getElementById('chartContainer').getContext('2d');
  // 如果已有 chart，先销毁
  if (window.currentChart) window.currentChart.destroy();
  // 新建并保存到全局
  window.currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['一月','二月','三月','四月'],
      datasets: [{ label: 'Fig1', data: [12,19,3,5] }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}
