// fig2.js
// import * as d3 from 'd3';

export async function drawFig2(container) {
  //—— 加载 JSON 并把 "NaN" 替成 null ——//
  async function loadSafeJson(url) {
    const text = await fetch(url).then(res => res.text());
    const safe = text.replace(/NaN/g, 'null');
    return JSON.parse(safe);
  }

  //—— 读取并过滤数据 （1980 年及以后） ——//
  let saData = await loadSafeJson('data/fig2a_sa_data.json');
  saData = saData.filter(d => d.year >= 1980);
  let cipData = await loadSafeJson('data/fig2a_cip_data.json');
  cipData = cipData.filter(d => d.year >= 1980);

  //—— 公共布局参数 ——//
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const width  = 600 - margin.left - margin.right;
  const height = 300 - margin.top  - margin.bottom;

  //—— 颜色 和 线型 映射 ——//
  const color = d3.scaleOrdinal()
    .domain([1,2,3,4])
    .range(["#000000", "#888888", "#b070e0", "#5a20a0"]);
  const lineStyle = z => (z === 1 ? "" : "4,2");

  //—— X 轴（年份）尺度 ——//
  const x = d3.scaleLinear()
    .domain(d3.extent(saData, d => d.year))
    .range([0, width]);

  //—— Tooltip ——//
  const tooltip = container.append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('background', 'rgba(255,255,255,0.9)')
    .style('padding', '6px')
    .style('border', '1px solid #ccc')
    .style('border-radius', '4px')
    .style('display', 'none');

  //—— 顶部 SA/CIP 切换 按钮 ——//
  const btnContainer = container.append('div')
    .style('text-align', 'center')
    .style('margin-bottom', '16px');

  btnContainer.append('style').text(`
    .fig-btn {
      background: #2c3e50;
      color: #ecf0f1;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      margin: 0 8px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .fig-btn:hover {
      background: #34495e;
    }
    .fig-btn.active {
      background: #1abc9c;
      color: #fff;
    }
    .legend-btn {
      border: none;
      border-radius: 4px;
      padding: 4px 12px;
      margin: 0 8px;
      font-size: 12px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
  `);

  const saBtn = btnContainer.append('button')
    .text('Cross-Topic (SA)')
    .attr('class', 'fig-btn active');

  const cipBtn = btnContainer.append('button')
    .text('Cross-Discipline (CIP)')
    .attr('class', 'fig-btn');

  //—— 主面板 ——//
  const panel = container.append('div');

  //—— 渲染函数 ——//
  function render(prefix) {
    panel.selectAll('*').remove();

    const data = prefix === 'sa' ? saData : cipData;
    let visibleCats = new Set([1,2,3,4]);

    // Y 轴尺度（初始，后续在 updateChart 里会基于 visibleCats 重新计算）
    let yMax0 = d3.max(data, d =>
      d3.max([1,2,3,4].map(n => d[`${prefix}_${n}`] || 0))
    );
    const y = d3.scaleLinear()
      .domain([0, yMax0]).nice()
      .range([height, 0]);

    //—— 图表 SVG ——//
    const chartDiv = panel.append('div')
      .style('text-align', 'center')
      .style('position', 'relative');

    const svg = chartDiv.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('display', 'block')
      .style('margin', '0 auto')
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // 坐标轴
    const xAxisG = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));
    const yAxisG = svg.append('g')
      .call(d3.axisLeft(y));

    // 轴标签
    svg.append('text')
      .attr('transform', `translate(${width/2},${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Year');

    svg.append('text')
      .attr('transform', `translate(${-margin.left + 15},${height/2}) rotate(-90)`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Percentage (%)');

    // 折线生成器
    const lineGen = d3.line()
      .defined(d => d.value != null && !isNaN(d.value))
      .x(d => x(d.year))
      .y(d => y(d.value));

    // 更新函数：动态淡入淡出 & Y 轴缩放
    function updateChart() {
      // —— 基于 visibleCats 重新计算 Y 轴最大值 —— //
      const yMax = d3.max(data, d =>
        d3.max([...visibleCats].map(n => d[`${prefix}_${n}`] || 0))
      ) || 0;
      y.domain([0, yMax]).nice();
      yAxisG.transition().duration(500).call(d3.axisLeft(y));

      [1,2,3,4].forEach(n => {
        [0,1].forEach(z => {
          const key = `${prefix}_${n}`;
          const series = data
            .filter(d => d.z === z)
            .map(d => ({ year: d.year, value: d[key] ?? null }));

          // 折线：join/enter/update/exit
          svg.selectAll(`.line-${n}-${z}`)
            .data([series])
            .join(
              enter => enter.append('path')
                .attr('class', `line-${n}-${z}`)
                .attr('fill', 'none')
                .attr('stroke', color(n))
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', lineStyle(z))
                .attr('d', lineGen)
                .attr('opacity', 0),
              update => update
                .attr('d', lineGen)
                .attr('stroke', color(n))
                .attr('stroke-dasharray', lineStyle(z)),
              exit => exit.remove()
            )
            .transition().duration(500)
              .attr('opacity', visibleCats.has(n) ? 1 : 0);

          // 圆点：join/enter/update/exit
          svg.selectAll(`.dot-${n}-${z}`)
            .data(series.filter(d => d.value != null && !isNaN(d.value)), d => d.year)
            .join(
              enter => enter.append('circle')
                .attr('class', `dot-${n}-${z}`)
                .attr('cx', d => x(d.year))
                .attr('cy', d => y(d.value))
                .attr('r', 3)
                .attr('fill', color(n))
                .attr('opacity', 0)
                .on('mouseover', function(event, d) {
                  d3.select(this).attr('r', 6);
                  tooltip.style('display', 'block')
                    .html(`<strong>Category ${n}</strong><br>Year: ${d.year}<br>Value: ${d.value.toFixed(3)}`);
                })
                .on('mousemove', function(event) {
                  tooltip
                    .style('left',  (event.pageX + 10) + 'px')
                    .style('top',   (event.pageY + 10) + 'px');
                })
                .on('mouseout', function() {
                  d3.select(this).attr('r', 3);
                  tooltip.style('display', 'none');
                }),
              update => update
                .attr('cx', d => x(d.year))
                .attr('cy', d => y(d.value)),
              exit => exit.remove()
            )
            .transition().duration(500)
              .attr('opacity', visibleCats.has(n) ? 1 : 0);
        });
      });
    }

    // 首次绘制
    updateChart();

    // —— Legend：下方横向 —— //
    const legendDiv = panel.append('div')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('align-items', 'center')
      .style('margin-top', '12px');

    [1,2,3,4].forEach(n => {
      const btn = legendDiv.append('button')
        .attr('class', 'legend-btn')
        .style('background-color', color(n))
        .style('color', '#fff')
        .style('opacity', 1)
        .text(`#${n}`)
        .on('click', () => {
          if (visibleCats.has(n)) visibleCats.delete(n);
          else visibleCats.add(n);
          updateChart();
          btn.style('opacity', visibleCats.has(n) ? 1 : 0.3);
        });
    });
  }

  // SA/CIP 切换
  saBtn.on('click', () => {
    render('sa');
    saBtn.classed('active', true);
    cipBtn.classed('active', false);
  });
  cipBtn.on('click', () => {
    render('cip');
    saBtn.classed('active', false);
    cipBtn.classed('active', true);
  });

  // 初始渲染
  render('sa');
}
