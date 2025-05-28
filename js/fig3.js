export function drawFig3(chartDiv, buttonContainer) {
    async function loadAndProcessData() {
        try {
            const processedData = await d3.json('data/fig3_data.json');
            return processedData;
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
        buttonContainer.selectAll('button').classed('selected', false);
        button.classed('selected', true);
    }

    // 主函数
    async function main() {
        const processedData = await loadAndProcessData();
        const cipColumns = ['CIP1', 'CIP2', 'CIP3', 'CIP4', 'CIP5', 'CIP6', 'CIP7', 'CIP8', 'CIP9'];

        // 创建 CIP 按钮
        cipColumns.forEach(cip => {
            const button = buttonContainer.append('button')
               .text(cip)
               .on('click', function () {
                    chartDiv.html(''); // 清空之前的图表
                    drawStackedBarChart(processedData[cip], chartDiv);
                    handleButtonClick(d3.select(this));
                });
        });

        // 默认显示第一个CIP数据
        if (processedData && processedData.CIP1) {
            drawStackedBarChart(processedData.CIP1, chartDiv);
            const firstButton = buttonContainer.select('button');
            handleButtonClick(firstButton);
        }
    }

    // 调用主函数
    main();
}