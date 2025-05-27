import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

const chartDiv = d3.select('#chart');
const titleEl  = d3.select('#chart-title');
let cipButtonContainer = null; // 用于存储CIP按钮容器的引用

// 清空容器
function clearChart() {
  chartDiv.selectAll('*').remove();
  // 移除CIP按钮容器（如果存在）
  if (cipButtonContainer) {
    cipButtonContainer.remove();
    cipButtonContainer = null;
  }
}

// 绘制 Fig1 的函数
function showFig1() {
  clearChart();
  titleEl.text('Classification Schemes');
  drawFig1(chartDiv);
}

// 绘制 Fig2 的函数
function showFig2() {
  clearChart();
  titleEl.text('Trends in Cross-domain Scholarship in Human Brain Science');
  drawFig2(chartDiv);
}

// 绘制 Fig3 的函数
function showFig3() {
  clearChart();
  titleEl.text('Evolution of SA boundary-crossing within and across disciplinary clusters');
  // 保存CIP按钮容器的引用
  cipButtonContainer = d3.select('body').insert('div', '.chart-area').attr('class', 'cip-button-container');
  cipButtonContainer.style('text-align', 'center');
  drawFig3(chartDiv, cipButtonContainer); // 将容器作为参数传递给fig3
}

// 绘制 Fig4 的函数
function showFig4() {
  clearChart();
  titleEl.text('Evolution of CIP and SA diversity in Human Brain Science research');
  drawFig4(chartDiv);
}

// 绑定按钮
d3.select('#btn1').on('click', showFig1);
d3.select('#btn2').on('click', showFig2);
d3.select('#btn3').on('click', showFig3);
d3.select('#btn4').on('click', showFig4);

// 页面打开时默认展示 Fig1
showFig1();