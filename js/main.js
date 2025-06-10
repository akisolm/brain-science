import { drawFig1 } from './fig1.js';
import { drawFig2 } from './fig2.js';
import { drawFig3 } from './fig3.js';
import { drawFig4 } from './fig4.js';

const chartDiv = d3.select('#chart');
const chartArea = d3.select('.chart-area');
const fig4Section = d3.select('#fig4-section');
const globalStats = d3.select('.stats'); // Reference to the global stats div

const explan1 = 'A generalizable framework is developed to define and measure convergence science through two key dimensions: cognitive (research topics) and social (researcher disciplines). Using MeSH (Medical Subject Headings) to classify research topics and CIP (Classification of Instructional Programs) to categorize author affiliations, we can distinguish between mono- and cross-domain activity in both areas. This dual-axis classification system allows for a systematic, scalable evaluation of convergence across large datasets, enabling rigorous analysis of its structure and impact in brain science research.'
const explan2 = 'explan 2'
const explan4 = 'The Diversity chartvisualizes how the topical diversity of brain‐science research has evolved from 1980 through 2020 across six MeSH‐based domains—<strong>Psychiatry & Psychology, Anatomy & Organisms, Phenomena & Processes, Health, Techniques & Equipment, and Technology & Information Science</strong>—in three regions (North America, Europe, and Australasia). Using a Blau‐evenness index, the chart shows how major funding programs such as the U.S. BRAIN Initiative and the Human Brain Project have shifted the balance between focused expertise and cross‐domain integration.</p><p>To experiment with your own topic mixes, select any combination of the six domain buttons and click <strong>Create Combination</strong>. The chart will immediately update to show how your bespoke fusion scheme affects regional diversity trajectories. Press <strong>Clear</strong> to reset all selections and start a new exploration.'
const explan3 = 'CIP1: Neurosciences CIP2: Biology CIP3: Psychology CIP4: Biotech. & Genetics CIP5: Medical Specialty CIP6: Health Sciences CIP7: Pathology & Pharmacology CIP8: Eng. & Informatics CIP9: Chemistry & Physics & Math<br>Fig A illustrates the composition of Subject Areas (SAs) within each disciplinary (CIP) cluster in Human Brain Science (HBS) research. Each subpanel represents articles published by researchers from a specific CIP cluster, showing the proportion of article-level MeSH terms belonging to each SA across 5-year intervals from 1970 to 2018. The results indicate a general decline in research on structure-related topics (SA2) across nearly all disciplines, except for Biotechnology and Genetics (CIP4), which maintained a balanced structure-function composition from the start. Additionally, the increasing prominence of technology and informatics-related topics (SA5 and SA6) in most domains reflects the critical role of informatics capabilities in facilitating biomedical convergence.Fig B displays the difference  between empirical CIP-SA association networks calculated for non-overlapping sets of mono-domain  and cross-domain  articles under the Broad configuration. The mono-domain network identifies the SA most frequently associated with each CIP category by averaging SA distributions in mono-domain articles, while the cross-domain network analyzes articles with both cross-disciplinary and cross-topic features. The figure highlights links in the cross-domain network that are overrepresented relative to the mono-domain network, particularly the integration of structure (SA2) and function (SA3) facilitated by teams from disciplines such as Neuroscience (CIP1), Biology (CIP2), Biotechnology and Genetics (CIP4), and Chemistry/Physics/Math (CIP9). This indicates that cross-disciplinary teams play a key role in advancing the convergence of structure-function research in brain science.'

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

// Clear all chart specific elements and hide both main content areas
function clearChart() {
  // Hide all main visualization sections
  chartArea.style('display', 'none');
  // Remove fig4Section.style('display', 'none'); as it's no longer the main container
  globalStats.style('display', 'none'); // Hide the global stats div
  console.log('globalStats after hiding:', globalStats.style('display'));

  // Clear contents of the general chart div
  chartDiv.selectAll('*').remove();
  
  // Remove dynamically added button containers (e.g., for Fig3)
  d3.selectAll('.ab-button-container, .cip-button-container, .sankey-button-container').remove();

  // Clear global chart title and explanation text explicitly
  d3.select('#chart-title').text('');
  d3.select('#explanation').selectAll('p').remove();

  // Clear and hide Fig4's elements explicitly (as they are now in chart-area)
  d3.select('#fig4-title').text('').style('display', 'none');
  d3.select('#fig4-viz-wrapper').style('display', 'none');
  d3.select('#fig4-story-block').selectAll('p').remove();
  d3.select('#fig4-story-block').style('display', 'none');
}

// 绘制 Fig1 的函数
function showFig1() {
  clearChart();
  chartArea.style('display', 'block'); // Show the general chart area
  chartDiv.style('display', 'block'); // Ensure #chart is visible for Fig1
  globalStats.style('display', 'flex'); // Show the global stats div
  d3.select('#chart-title').text('Classification Schemes').style('display', 'block'); // Update specific title and show it
  d3.select('#explanation').style('display', 'block'); // Show explanation container
  drawFig1(chartDiv);
  showExplan(d3.select('#explanation'), explan1); // Update specific explanation
}

// 绘制 Fig2 的函数
function showFig2() {
  clearChart();
  chartArea.style('display', 'block'); // Show the general chart area
  chartDiv.style('display', 'block'); // Ensure #chart is visible for Fig2
  globalStats.style('display', 'flex'); // Show the global stats div
  d3.select('#chart-title').text('Trends in Cross-domain Scholarship in Human Brain Science').style('display', 'block'); // Update specific title and show it
  d3.select('#explanation').style('display', 'block'); // Show explanation container
  drawFig2(chartDiv);
  showExplan(d3.select('#explanation'), explan2); // Update specific explanation
}

// 绘制 Fig3 的函数
function showFig3() {
  clearChart();
  chartArea.style('display', 'block'); // Show the general chart area
  chartDiv.style('display', 'block'); // Ensure #chart is visible for Fig3
  globalStats.style('display', 'flex'); // Show the global stats div
  d3.select('#chart-title').text('Evolution of SA boundary-crossing within and across disciplinary clusters').style('display', 'block'); // Update specific title and show it
  d3.select('#explanation').style('display', 'block'); // Show explanation container
    
  const abButtonContainer = chartArea.insert('div', '#chart-title').attr('class', 'ab-button-container');
  abButtonContainer.style('text-align', 'left');
    
  const cipButtonContainer = chartArea.insert('div', '#chart').attr('class', 'cip-button-container');
  cipButtonContainer.style('text-align', 'center');
    
  drawFig3(chartDiv, abButtonContainer, cipButtonContainer);
  showExplan(d3.select('#explanation'), explan3); // Update specific explanation
}

// 绘制 Fig4 的函数
function showFig4() {
  clearChart();
  chartArea.style('display', 'block'); // Show the general chart area
  chartDiv.style('display', 'none'); // Hide the general chart div for Fig4
  globalStats.style('display', 'flex'); // Ensure global stats are visible for Fig4

  // Show Fig4's specific elements and update their content
  d3.select('#fig4-title').text('How Do Topic-Fusion Strategies Shape Brain-Science Diversity?').style('display', 'block');
  d3.select('#fig4-viz-wrapper').style('display', 'flex');
  d3.select('#fig4-story-block').style('display', 'block');
  showExplan(d3.select('#fig4-story-block'), explan4); // Update Fig4's specific explanation

  // Hide other figures' elements that are now also in chart-area
  d3.select('#chart-title').style('display', 'none');
  d3.select('#explanation').style('display', 'none');

  // drawFig4 does not take chartDiv as a parameter, it directly selects #fig4-chart-svg.
  drawFig4();
}

// 绑定按钮
d3.select('#btn1').on('click', showFig1);
d3.select('#btn2').on('click', showFig2);
d3.select('#btn3').on('click', showFig3);
d3.select('#btn4').on('click', showFig4);

// 页面打开时默认展示 Fig1
showFig1();