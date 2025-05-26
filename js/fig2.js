// fig2.js
// export 一个绘制函数，接收一个 d3 Selection（容器）
export function drawFig2(container) {
  // 比如画一组随机条形图
  const width = 500, height = 300;
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  // 随机数据
  const data = d3.range(10).map(i => Math.random() * 100);

  const xScale = d3.scaleBand().domain(d3.range(data.length)).range([40, width - 20]).padding(0.1);
  const yScale = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height - 20, 20]);

  // 画轴
  const xAxis = d3.axisBottom(xScale).tickFormat(i => `#${i+1}`);
  const yAxis = d3.axisLeft(yScale);
  svg.append('g').attr('transform', `translate(0, ${height - 20})`).call(xAxis);
  svg.append('g').attr('transform', `translate(40, 0)`).call(yAxis);

  // 画柱
  svg.selectAll('rect')
    .data(data)
    .enter().append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - 20 - yScale(d));
}
