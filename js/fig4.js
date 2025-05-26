// fig4.js
export function drawFig4() {
  const ctx = document.getElementById('chartContainer').getContext('2d');
  if (window.currentChart) window.currentChart.destroy();
  window.currentChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['A','B','C','D'],
      datasets: [{ label: 'Fig4', data: [20,10,15,3] }]
    },
    options: { responsive: true }
  });
}
