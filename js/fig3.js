export function drawFig3(chartDiv, abButtonContainer, cipButtonContainer) {
   async function loadAndProcessData() {
      try {
         const starkbarData = await d3.json('data/fig3_data.json');
         return starkbarData;
      } catch (error) {
         console.error('Error loading or processing data:', error);
      }
   }

   // 绘制堆叠柱状图
   function drawStackedBarChart(data, container) {
      const svgWidth = 1000;
      const svgHeight = 400;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const width = svgWidth - margin.left - margin.right;
      const height = svgHeight - margin.top - margin.bottom;

      const svg = container
         .append('svg')
         .attr('width', svgWidth)
         .attr('height', svgHeight);

      const g = svg.append('g')
         .attr('transform', `translate(${margin.left},${margin.top})`);

      const saColumns = Object.keys(data[0]).filter(key => key !== 'year');

      const xScale = d3.scaleBand()
         .domain(data.map(d => d.year))
         .range([0, width - 100])
         .padding(0.2);

      const yScale = d3.scaleLinear()
         .domain([0, 1])
         .range([height, 0]);

      const customColors = ['#d90202', '#ff8247', '#2af768', '#0f730b', '#030303', '#9e9e9e'];
      const colorScale = d3.scaleOrdinal()
         .domain(saColumns)
         .range(customColors || d3.schemeCategory10);

      const stack = d3.stack()
         .keys(saColumns);

      const layers = stack(data);

      g.selectAll('.layer')
         .data(layers)
         .join('g')
         .attr('class', 'layer')
         .attr('fill', d => colorScale(d.key))
         .selectAll('rect')
         .data(d => d)
         .join('rect')
         .attr('x', d => xScale(d.data.year))
         .attr('y', d => yScale(d[1]))
         .attr('height', d => yScale(d[0]) - yScale(d[1]))
         .attr('width', xScale.bandwidth());

      g.append('g')
         .attr('class', 'axis x-axis')
         .attr('transform', `translate(0,${height})`)
         .call(d3.axisBottom(xScale));

      g.append('g')
         .attr('class', 'axis y-axis')
         .call(d3.axisLeft(yScale));

      const legend = g.append('g')
         .attr('transform', `translate(${width - 80}, 0)`);

      const legendItems = legend.selectAll('.legend-item')
         .data(saColumns)
         .join('g')
         .attr('class', 'legend-item')
         .attr('transform', (d, i) => `translate(0, ${i * 20})`);

      legendItems.append('rect')
         .attr('width', 15)
         .attr('height', 15)
         .attr('fill', d => colorScale(d));

      legendItems.append('text')
         .attr('x', 20)
         .attr('y', 12)
         .text(d => d);
   }

   // 处理按钮选中效果
   function handleButtonClick(button) {
      button.classed('selected', true);
   }

   // 绘制桑基图
   function drawSankeyDiagrams(chartDiv) {
      const width = 800;
      const height = 400;
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };

      const svgMono = chartDiv
         .append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", `translate(${margin.left},${margin.top})`);

      const svgCross = chartDiv
         .append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", `translate(${margin.left},${margin.top})`);

      const svgDiff = chartDiv
         .append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform", `translate(${margin.left},${margin.top})`);

      const colorMap = {
         // CIP 颜色
         "CIP1": "#1f77b4",
         "CIP2": "#ff7f0e",
         "CIP3": "#2ca02c",
         "CIP4": "#d62728",
         "CIP5": "#9467bd",
         "CIP6": "#8c564b",
         "CIP7": "#e377c2",
         "CIP8": "#7f7f7f",
         "CIP9": "#bcbd22",

         // SA 颜色
         "SA1": "#aec7e8",
         "SA2": "#ffbb78",
         "SA3": "#98df8a",
         "SA4": "#ff9896",
         "SA5": "#c5b0d5",
         "SA6": "#c49c94",
      };

      const sankey = d3.sankey()
         .nodeWidth(15)
         .nodePadding(0)
         .extent([[1, 1], [width - 1, height - 6]]);

      function drawSankey(svg, data) {
         const cipOrder = ["CIP3", "CIP1", "CIP4", "CIP2", "CIP6", "CIP7", "CIP5", "CIP8", "CIP9"];
         const saOrder = ["SA1", "SA2", "SA3", "SA4", "SA5", "SA6"];

         const nodes = [];
         cipOrder.forEach(cip => {
            nodes.push({ name: cip });
         });
         saOrder.forEach(sa => {
            nodes.push({ name: sa });
         });

         const links = [];
         Object.keys(data).forEach(cip => {
            Object.keys(data[cip]).forEach(sa => {
               const value = data[cip][sa];
               if (value > 0) {
                  links.push({
                     source: nodes.findIndex(node => node.name === cip),
                     target: nodes.findIndex(node => node.name === sa),
                     value: value
                  });
               }
            });
         });

         // 构建节点连接映射，用于判断节点是否有连接
         const nodeConnections = new Map();
         nodes.forEach((node, index) => {
            const hasIncoming = links.some(link => link.target === index);
            const hasOutgoing = links.some(link => link.source === index);
            nodeConnections.set(index, hasIncoming || hasOutgoing);
         });

         const graph = { nodes: nodes, links: links };
         sankey
            .nodeSort(null)
            .nodeAlign(d3.sankeyLeft)
            (graph);

         svg.append("g")
            .selectAll("rect")
            .data(graph.nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => colorMap[d.name]);

         svg.append("g")
            .selectAll("path")
            .data(graph.links)
            .join("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width))
            .attr("class", "link")
            .attr("stroke", d => colorMap[d.source.name])
            .attr("stroke-opacity", 0.7);

         // 只渲染有连接的节点的标签
         svg.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .join("text")
            .filter((d, i) => nodeConnections.get(i)) // 过滤掉没有连接的节点
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name);
      }

      // 加载mono_domain_matrix.json
      d3.json("data/mono_domain_matrix.json").then(data => {
         drawSankey(svgMono, data);
      });

      // 加载cross_domain_matrix.json
      d3.json("data/cross_domain_matrix.json").then(data => {
         drawSankey(svgCross, data);
      });

      // 加载difference_matrix.json
      d3.json("data/difference_matrix.json").then(data => {
         drawSankey(svgDiff, data);
      });

      // 添加桑基图切换按钮
      const sankeyButtonContainer = d3.select('.chart-area').insert('div', '#chart').attr('class', 'sankey-button-container');
      sankeyButtonContainer.style('text-align', 'center');

      const sankeyButtons = ['mono-domain', 'cross-domain', 'difference'];
      sankeyButtons.forEach((buttonText, index) => {
         const button = sankeyButtonContainer.append('button')
            .text(buttonText)
            .on('click', function () {
               chartDiv.selectAll('svg').style('display', 'none');
               chartDiv.selectAll('svg').filter((d, i) => i === index).style('display', 'block');
               sankeyButtonContainer.selectAll('button').classed('selected', false);
               d3.select(this).classed('selected', true);
            });
         if (index === 0) {
            button.classed('selected', true);
         }
      });

      chartDiv.selectAll('svg').filter((d, i) => i > 0).style('display', 'none');
   }

   // 主函数
   async function main() {
      const processedData = await loadAndProcessData();
      const cipColumns = ['CIP1', 'CIP2', 'CIP3', 'CIP4', 'CIP5', 'CIP6', 'CIP7', 'CIP8', 'CIP9'];

      // 创建 A 和 B 按钮 (在abButtonContainer中)
      const buttonA = abButtonContainer.append('button')
         .text('A')
         .on('click', function () {
            chartDiv.html(''); // 清空之前的图表
            // 移除Sankey按钮容器（如果存在）
            const sankeyButtonContainer = d3.select('.sankey-button-container');
            if (!sankeyButtonContainer.empty()) {
               sankeyButtonContainer.remove();
            }
            // 清空并重新创建CIP按钮
            cipButtonContainer.html('');
            cipColumns.forEach(cip => {
               const button = cipButtonContainer.append('button')
                  .text(cip)
                  .on('click', function () {
                     chartDiv.select('svg').remove();
                     drawStackedBarChart(processedData[cip], chartDiv);
                     cipButtonContainer.selectAll('button').classed('selected', false);
                     handleButtonClick(d3.select(this));
                  });
            });

            // 默认显示第一个CIP数据
            if (processedData && processedData.CIP1) {
               drawStackedBarChart(processedData.CIP1, chartDiv);
               const firstButton = cipButtonContainer.select('button');
               handleButtonClick(firstButton);
            }
         });

      const buttonB = abButtonContainer.append('button')
         .text('B')
         .on('click', function () {
            chartDiv.html(''); // 清空之前的图表
            cipButtonContainer.html(''); // 清空CIP按钮
            drawSankeyDiagrams(chartDiv);
         });

      // 默认显示 A 图表
      buttonA.dispatch('click');
   }

   // 调用主函数
   main();
}