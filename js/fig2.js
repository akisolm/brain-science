// fig2.js
export function drawFig2() {
  const ctx = document.getElementById('chartContainer').getContext('2d');
  if (window.currentChart) window.currentChart.destroy();
  window.currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['一','二','三','四'],
      datasets: [{ label: 'Fig2', data: [8,15,7,10], fill: false }]
    },
    options: { responsive: true }
  });
}
