import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

const chartDiv = d3.select('#chart');
const titleEl  = d3.select('#chart-title');
let cipButtonContainer = null; // 用于存储CIP按钮容器的引用

const explan1 = 'A generalizable framework is developed to define and measure convergence science through two key dimensions: cognitive (research topics) and social (researcher disciplines). Using MeSH (Medical Subject Headings) to classify research topics and CIP (Classification of Instructional Programs) to categorize author affiliations, we can distinguish between mono- and cross-domain activity in both areas. This dual-axis classification system allows for a systematic, scalable evaluation of convergence across large datasets, enabling rigorous analysis of its structure and impact in brain science research.'
const explan2 = 'explan 2'
const explan3 = 'CIP1: Neurosciences CIP2: Biology CIP3: Psychology CIP4: Biotech. & Genetics CIP5: Medical Specialty CIP6: Health Sciences CIP7: Pathology & Pharmacology CIP8: Eng. & Informatics CIP9: Chemistry & Physics & Math<br>Fig A illustrates the composition of Subject Areas (SAs) within each disciplinary (CIP) cluster in Human Brain Science (HBS) research. Each subpanel represents articles published by researchers from a specific CIP cluster, showing the proportion of article-level MeSH terms belonging to each SA across 5-year intervals from 1970 to 2018. The results indicate a general decline in research on structure-related topics (SA2) across nearly all disciplines, except for Biotechnology and Genetics (CIP4), which maintained a balanced structure-function composition from the start. Additionally, the increasing prominence of technology and informatics-related topics (SA5 and SA6) in most domains reflects the critical role of informatics capabilities in facilitating biomedical convergence.Fig B displays the difference  between empirical CIP-SA association networks calculated for non-overlapping sets of mono-domain  and cross-domain  articles under the Broad configuration. The mono-domain network identifies the SA most frequently associated with each CIP category by averaging SA distributions in mono-domain articles, while the cross-domain network analyzes articles with both cross-disciplinary and cross-topic features. The figure highlights links in the cross-domain network that are overrepresented relative to the mono-domain network, particularly the integration of structure (SA2) and function (SA3) facilitated by teams from disciplines such as Neuroscience (CIP1), Biology (CIP2), Biotechnology and Genetics (CIP4), and Chemistry/Physics/Math (CIP9). This indicates that cross-disciplinary teams play a key role in advancing the convergence of structure-function research in brain science.'
const explan4 = 'explan 4'

function showExplan(text) {
  const container = d3.select('#explanation');

  // 1. 中断老的所有 transition 并移除旧节点
  container.selectAll('p')
    .interrupt()   // 停掉所有未完成的 transition
    .remove();     // 直接删掉

  // 2. 插入新的 p 并淡入
  container.append('p')
    .style('opacity', 0)
    .html(text)
    .transition()
      .duration(Math.floor(text.length*3))
      .style('opacity', 1);
}

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
  showExplan(explan1);
}

// 绘制 Fig2 的函数
function showFig2() {
  clearChart();
  titleEl.text('Trends in Cross-domain Scholarship in Human Brain Science');
  drawFig2(chartDiv);
  showExplan(explan2);
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
    showExplan(explan3);
}

// 绘制 Fig4 的函数
function showFig4() {
  clearChart();
  titleEl.text('Evolution of CIP and SA diversity in Human Brain Science research');
  drawFig4(chartDiv);
  showExplan(explan4);
}

// 绑定按钮
d3.select('#btn1').on('click', showFig1);
d3.select('#btn2').on('click', showFig2);
d3.select('#btn3').on('click', showFig3);
d3.select('#btn4').on('click', showFig4);

// 页面打开时默认展示 Fig1
showFig1();