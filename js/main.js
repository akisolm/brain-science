import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

const chartDiv = d3.select('#chart');
const titleEl = d3.select('#chart-title');

// 清空容器
function clearChart() {
  chartDiv.selectAll('*').remove();
  d3.selectAll('.ab-button-container, .cip-button-container, .sankey-button-container').remove();
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
    
    // 在title前面插入A、B按钮容器
    const abButtonContainer = d3.select('.chart-area').insert('div', '#chart-title').attr('class', 'ab-button-container');
    abButtonContainer.style('text-align', 'left');
    
    // 创建CIP按钮容器
    const cipButtonContainer = d3.select('.chart-area').insert('div', '#chart').attr('class', 'cip-button-container');
    cipButtonContainer.style('text-align', 'center');
    
    drawFig3(chartDiv, abButtonContainer, cipButtonContainer); // 将容器作为参数传递给fig3
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