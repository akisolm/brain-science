import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

const chartDiv = d3.select('#chart');
const titleEl  = d3.select('#chart-title');

// 清空容器
function clearChart() {
  chartDiv.selectAll('*').remove();
}

// 绘制 Fig1 的函数（内部也可修改标题，视需求而定）
function showFig1() {
  clearChart();
  titleEl.text('y = sin(x)');   // 更新标题
  drawFig1(chartDiv);
}

// 绘制 Fig2 的函数
function showFig2() {
  clearChart();
  titleEl.text('Trends in cross-domain scholarship in Human Brain Science');   // 更新标题
  drawFig2(chartDiv);
}

// 绘制 Fig3 的函数
function showFig3() {
  clearChart();
  titleEl.text('Fig3：随机条形图');   // 更新标题
  drawFig3(chartDiv);
}

// 绘制 Fig4 的函数
function showFig4() {
  clearChart();
  titleEl.text('Fig4：随机条形图');   // 更新标题
  drawFig4(chartDiv);
}

// 绑定按钮
d3.select('#btn1').on('click', showFig1);
d3.select('#btn2').on('click', showFig2);
d3.select('#btn3').on('click', showFig3);
d3.select('#btn4').on('click', showFig4);

// 页面打开时默认展示 Fig1
showFig1();
