// fig2.js
// export 一个绘制函数，接收一个 d3 Selection（容器）
export async function drawFig2(container) {
  // 自定义加载 JSON 并替换 NaN
  async function loadSafeJson(url) {
    const text = await fetch(url).then(res => res.text());
    const safe = text.replace(/NaN/g, 'null');
    return JSON.parse(safe);
  }

  // 加载并过滤数据（替换 NaN，保留 1980 年及以后）
  let saData = await loadSafeJson('sa_data.json');
  saData = saData.filter(d => d.year >= 1980);
  let cipData = await loadSafeJson('cip_data.json');
  cipData = cipData.filter(d => d.year >= 1980);

  // 公共布局参数
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // 颜色映射: 1–4
  const color = d3.scaleOrdinal()
    .domain([1, 2, 3, 4])
    .range(["#000000", "#888888", "#b070e0", "#5a20a0"]);

  // 线型映射: z=1 实线, z=0 虚线
  const lineStyle = z => (z === 1 ? "" : "4,2");

  // 时间尺度 (年份)
  const x = d3.scaleLinear()
    .domain(d3.extent(saData, d => d.year))
    .range([0, width]);

  // 创建 tooltip
  const tooltip = container.append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('background', 'rgba(255,255,255,0.9)')
    .style('padding', '6px')
    .style('border', '1px solid #ccc')
    .style('border-radius', '4px')
    .style('display', 'none');

  // 创建按钮容器
  const btnContainer = container.append('div').style('margin-bottom', '10px');

  // 注入按钮样式
  btnContainer.append('style').text(`
    .fig-btn {
      background: #2c3e50;
      color: #ecf0f1;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      margin-right: 8px;
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
  `);

  // 创建按钮并绑定交互
  const saBtn = btnContainer.append('button')
    .text('Cross-Topic (SA)')
    .attr('class', 'fig-btn active')
    .on('click', () => {
      render('sa');
      saBtn.classed('active', true);
      cipBtn.classed('active', false);
    });

  const cipBtn = btnContainer.append('button')
    .text('Cross-Discipline (CIP)')
    .attr('class', 'fig-btn')
    .on('click', () => {
      render('cip');
      saBtn.classed('active', false);
      cipBtn.classed('active', true);
    });

  // 主面板区域
  const panel = container.append('div');

  // 渲染函数: prefix = 'sa' or 'cip'
  function render(prefix) {
    panel.selectAll('*').remove();
    const data = prefix === 'sa' ? saData : cipData;
    const title = prefix === 'sa' ? 'Cross-Topic (SA)' : 'Cross-Discipline (CIP)';

    // Y 轴尺度, 初始化覆盖所有类别
    let visibleCats = new Set([1, 2, 3, 4]);
    let yMax = d3.max(data, d => {
      return d3.max([...visibleCats].map(n => d[`${prefix}_${n}`] || 0));
    });
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height, 0]);

    // SVG 画布
    const svg = panel.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // 绘制坐标轴
    const xAxisG = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));
    const yAxisG = svg.append('g')
      .call(d3.axisLeft(y));

    // 标题
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text(title);

    // 生成 line generator
    const lineGen = d3.line()
      .defined(d => d.value != null && !isNaN(d.value))
      .x(d => x(d.year))
      .y(d => y(d.value));

    // 绘制折线和交互点的更新函数
    function updateChart() {
      // 重新计算 y 轴域
      yMax = d3.max(data, d => {
        return d3.max([...visibleCats].map(n => d[`${prefix}_${n}`] || 0));
      });
      y.domain([0, yMax]).nice();
      yAxisG.transition().duration(500).call(d3.axisLeft(y));

      // 更新各折线及点
      [1,2,3,4].forEach(n => {
        [0,1].forEach(z => {
          const key = `${prefix}_${n}`;
          const series = data
            .filter(d => d.z === z)
            .map(d => ({ year: d.year, value: d[key] != null ? d[key] : null }));

          // Update path
          svg.selectAll(`.line-${n}-${z}`)
            .data([series])
            .join('path')
            .attr('class', `line-${n}-${z}`)
            .attr('fill', 'none')
            .attr('stroke', color(n))
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', lineStyle(z))
            .attr('d', lineGen)
            .style('display', visibleCats.has(n) ? null : 'none');

          // Update dots
          const dots = svg.selectAll(`.dot-${n}-${z}`)
            .data(series.filter(d => d.value != null && !isNaN(d.value)));

          dots.join(
            enter => enter.append('circle')
              .attr('class', `dot-${n}-${z}`)
              .attr('cx', d => x(d.year))
              .attr('cy', d => y(d.value))
              .attr('r', 3)
              .attr('fill', color(n))
              .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 6);
                tooltip.style('display', 'block')
                  .html(`<strong>Category ${n}</strong><br>Year: ${d.year}<br>Value: ${d.value.toFixed(3)}`);
              })
              .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                       .style('top', (event.pageY + 10) + 'px');
              })
              .on('mouseout', function() {
                d3.select(this).attr('r', 3);
                tooltip.style('display', 'none');
              }),
            update => update
              .attr('cx', d => x(d.year))
              .attr('cy', d => y(d.value))
              .style('display', visibleCats.has(n) ? null : 'none'),
            exit => exit.remove()
          );
        });
      });
    }

    // 初次绘制所有曲线和点
    updateChart();

    // 交互式图例
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, 10)`);
    [1,2,3,4].forEach((n, i) => {
      const g = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          if (visibleCats.has(n)) visibleCats.delete(n);
          else visibleCats.add(n);
          updateChart();
        });
      g.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(n));
      g.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .text(`${n} 类别`);
    });
  }

  // 初始渲染 SA
  render('sa');
}
