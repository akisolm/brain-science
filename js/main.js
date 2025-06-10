import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

const chartDiv = d3.select('#chart');
const chartArea = d3.select('.chart-area');
const globalStats = d3.select('.stats'); // fig4

const explan1 = 'A generalizable framework is developed to define and measure convergence science through two key dimensions: cognitive (research topics) and social (researcher disciplines). Using MeSH (Medical Subject Headings) to classify research topics and CIP (Classification of Instructional Programs) to categorize author affiliations, we can distinguish between mono- and cross-domain activity in both areas. This dual-axis classification system allows for a systematic, scalable evaluation of convergence across large datasets, enabling rigorous analysis of its structure and impact in brain science research.'
const explan2 = "Figure 2A (SA): When articles are classified by Subject Area (SA), the share of mono‐domain publications falls steadily from 1970 through 2018, with a particularly sharp decline among high‐impact articles (zp > 0). At the same time, cross‐domain research has become increasingly prevalent—especially two‐topic combinations, which consistently outnumber mixtures of three or four SAs—indicating that integrating multiple research topics into a single study has grown both more common and more citation‐effective over time . \n Figure 2A (CIP): In contrast, when articles are grouped by authors’ home departments (CIP), the proportion of mono‐disciplinary work also decreases but at a considerably gentler pace. Two‐discipline collaborations still dominate the cross‐domain landscape, while mixtures of three or four disciplines remain rare, suggesting that organizational and communication barriers make disciplinary integration slower to evolve than topical integration—even though higher‐impact papers tend to favor cross‐disciplinary combinations "
const explan3 = 'CIP1: Neurosciences CIP2: Biology CIP3: Psychology CIP4: Biotech. & Genetics CIP5: Medical Specialty CIP6: Health Sciences CIP7: Pathology & Pharmacology CIP8: Eng. & Informatics CIP9: Chemistry & Physics & Math<br>Fig A illustrates the composition of Subject Areas (SAs) within each disciplinary (CIP) cluster in Human Brain Science (HBS) research. Each subpanel represents articles published by researchers from a specific CIP cluster, showing the proportion of article-level MeSH terms belonging to each SA across 5-year intervals from 1970 to 2018. The results indicate a general decline in research on structure-related topics (SA2) across nearly all disciplines, except for Biotechnology and Genetics (CIP4), which maintained a balanced structure-function composition from the start. Additionally, the increasing prominence of technology and informatics-related topics (SA5 and SA6) in most domains reflects the critical role of informatics capabilities in facilitating biomedical convergence.Fig B displays the difference  between empirical CIP-SA association networks calculated for non-overlapping sets of mono-domain  and cross-domain  articles under the Broad configuration. The mono-domain network identifies the SA most frequently associated with each CIP category by averaging SA distributions in mono-domain articles, while the cross-domain network analyzes articles with both cross-disciplinary and cross-topic features. The figure highlights links in the cross-domain network that are overrepresented relative to the mono-domain network, particularly the integration of structure (SA2) and function (SA3) facilitated by teams from disciplines such as Neuroscience (CIP1), Biology (CIP2), Biotechnology and Genetics (CIP4), and Chemistry/Physics/Math (CIP9). This indicates that cross-disciplinary teams play a key role in advancing the convergence of structure-function research in brain science.'
const explan4 = 'The Diversity chartvisualizes how the topical diversity of brain‐science research has evolved from 1980 through 2020 across six MeSH‐based domains—<strong>Psychiatry & Psychology, Anatomy & Organisms, Phenomena & Processes, Health, Techniques & Equipment, and Technology & Information Science</strong>—in three regions (North America, Europe, and Australasia). Using a Blau‐evenness index, the chart shows how major funding programs such as the U.S. BRAIN Initiative and the Human Brain Project have shifted the balance between focused expertise and cross‐domain integration.</p><p>To experiment with your own topic mixes, select any combination of the six domain buttons and click <strong>Create Combination</strong>. The chart will immediately update to show how your bespoke fusion scheme affects regional diversity trajectories. Press <strong>Clear</strong> to reset all selections and start a new exploration.'

function showExplan(containerSelection, text) {
  const container = containerSelection;

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

function clearChart() {
  chartArea.style('display', 'none');
  globalStats.style('display', 'none');
  console.log('globalStats after hiding:', globalStats.style('display'));
  chartDiv.selectAll('*').remove();

  d3.selectAll('.ab-button-container, .cip-button-container, .sankey-button-container').remove();

  d3.select('#chart-title').text('');
  d3.select('#explanation').selectAll('p').remove();

  d3.select('#fig4-title').text('').style('display', 'none');
  d3.select('#fig4-viz-wrapper').style('display', 'none');
  d3.select('#fig4-story-block').selectAll('p').remove();
  d3.select('#fig4-story-block').style('display', 'none');
}

// 绘制 Fig1 的函数
function showFig1() {
  clearChart();
  chartArea.style('display', 'block');
  chartDiv.style('display', 'block');
  globalStats.style('display', 'flex');
  d3.select('#chart-title').text('Classification Schemes').style('display', 'block');
  d3.select('#explanation').style('display', 'block');
  drawFig1(chartDiv);
  showExplan(d3.select('#explanation'), explan1);
}

// 绘制 Fig2 的函数
function showFig2() {
  clearChart();
  chartArea.style('display', 'block');
  chartDiv.style('display', 'block');
  globalStats.style('display', 'flex');
  d3.select('#chart-title').text('Trends in Cross-domain Scholarship in Human Brain Science').style('display', 'block');
  d3.select('#explanation').style('display', 'block');
  drawFig2(chartDiv);
  showExplan(d3.select('#explanation'), explan2);
}

// 绘制 Fig3 的函数
function showFig3() {
  clearChart();
  chartArea.style('display', 'block');
  chartDiv.style('display', 'block');
  globalStats.style('display', 'flex');
  d3.select('#chart-title').text('Evolution of SA boundary-crossing within and across disciplinary clusters').style('display', 'block');
  d3.select('#explanation').style('display', 'block');
    
  const abButtonContainer = chartArea.insert('div', '#chart-title').attr('class', 'ab-button-container');
  abButtonContainer.style('text-align', 'left');
    
  const cipButtonContainer = chartArea.insert('div', '#chart').attr('class', 'cip-button-container');
  cipButtonContainer.style('text-align', 'center');
    
  drawFig3(chartDiv, abButtonContainer, cipButtonContainer);
  showExplan(d3.select('#explanation'), explan3);
}

// 绘制 Fig4 的函数
function showFig4() {
  clearChart();
  chartArea.style('display', 'block');
  chartDiv.style('display', 'none');
  globalStats.style('display', 'flex');

  d3.select('#fig4-title').text('How Do Topic-Fusion Strategies Shape Brain-Science Diversity?').style('display', 'block');
  
  // Apply fade-in animation to fig4-viz-wrapper
  d3.select('#fig4-viz-wrapper')
    .style('opacity', 0)
    .style('display', 'flex')
    .transition()
    .duration(500)
    .style('opacity', 1);

  d3.select('#fig4-story-block').style('display', 'block');
  showExplan(d3.select('#fig4-story-block'), explan4);

  d3.select('#chart-title').style('display', 'none');
  d3.select('#explanation').style('display', 'none');

  drawFig4();
}

// 绑定按钮
d3.select('#btn1').on('click', showFig1);
d3.select('#btn2').on('click', showFig2);
d3.select('#btn3').on('click', showFig3);
d3.select('#btn4').on('click', showFig4);

// 页面打开时默认展示 Fig1
showFig1();