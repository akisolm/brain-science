// fig3.js
export function drawFig3() {
  const ctx = document.getElementById('chartContainer').getContext('2d');
  if (window.currentChart) window.currentChart.destroy();
  window.currentChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['红','绿','蓝','黄'],
      datasets: [{ label: 'Fig3', data: [5,6,12,9] }]
    },
    options: { responsive: true }
  });
}
