// fig1.js
// export 一个绘制函数，接收一个 d3 Selection（容器）
export function drawFig1(container) {
  // 比如画一条正弦曲线
  const width = 500, height = 300;
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  // 构造数据
  const data = d3.range(0, 10, 0.1).map(x => ({ x, y: Math.sin(x) }));

  // 比例尺
  const xScale = d3.scaleLinear().domain(d3.extent(data, d => d.x)).range([40, width - 20]);
  const yScale = d3.scaleLinear().domain([-1, 1]).range([height - 20, 20]);

  // 画轴
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  svg.append('g').attr('transform', `translate(0, ${height - 20})`).call(xAxis);
  svg.append('g').attr('transform', `translate(40, 0)`).call(yAxis);

  // 画线
  const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', line);
}
