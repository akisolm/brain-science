export function drawFig3() {
  async function loadAndProcessData() {
    try {
        const data = await d3.csv('../data/ArticleLevelData_quanli.csv');

        // 定义年份分组函数
        const yearGroup = (year) => {
            if (year >= 1970 && year <= 1974) return '1970 - 1974';
            if (year >= 1975 && year <= 1979) return '1975 - 1979';
            if (year >= 1980 && year <= 1984) return '1980 - 1984';
            if (year >= 1985 && year <= 1989) return '1985 - 1989';
            if (year >= 1990 && year <= 1994) return '1990 - 1994';
            if (year >= 1995 && year <= 1999) return '1995 - 1999';
            if (year >= 2000 && year <= 2004) return '2000 - 2004';
            if (year >= 2005 && year <= 2009) return '2005 - 2009';
            if (year >= 2010 && year <= 2014) return '2010 - 2014';
            if (year >= 2015 && year <= 2018) return '2015 - 2018';
            return 'Other';
        };

        // 定义 CIP 列和 SA 列
        const cipColumns = ['CIP1', 'CIP2', 'CIP3', 'CIP4', 'CIP5', 'CIP6', 'CIP7', 'CIP8', 'CIP9'];
        const saColumns = ['SA1', 'SA2', 'SA3', 'SA4', 'SA5', 'SA6'];

        // 按 CIP 列和年份分组计算 SA 比例
        const processedData = {};
        cipColumns.forEach(cip => {
            const cipData = data.filter(d => d[cip] === '1');
            const groupedByYear = d3.group(cipData, d => yearGroup(+d.Yp));
            const yearGroupData = [];
            groupedByYear.forEach((group, year) => {
                // 过滤掉年份分组为 'Other' 的数据
                if (year!== 'Other') {
                    const saTotals = {};
                    saColumns.forEach(sa => {
                        saTotals[sa] = d3.sum(group, d => +d[sa]);
                    });
                    const total = d3.sum(Object.values(saTotals));
                    const percentages = {};
                    saColumns.forEach(sa => {
                        percentages[sa] = total > 0? saTotals[sa] / total : 0;
                    });
                    yearGroupData.push({ year, ...percentages });
                }
            });
            // 对每个 CIP 的年份分组数据按年份顺序排序
            const yearOrder = [
                '1970 - 1974', '1975 - 1979', '1980 - 1984',
                '1985 - 1989', '1990 - 1994', '1995 - 1999',
                '2000 - 2004', '2005 - 2009', '2010 - 2014',
                '2015 - 2018'
            ];
            yearGroupData.sort((a, b) => yearOrder.indexOf(a.year) - yearOrder.indexOf(b.year));

            processedData[cip] = yearGroupData;
        });

        return processedData;
    } catch (error) {
        console.error('Error loading or processing data:', error);
    }
}

// 绘制堆叠柱状图
function drawStackedBarChart(data, containerId) {
    const svgWidth = 1000;
    const svgHeight = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(containerId)
       .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const saColumns = Object.keys(data[0]).filter(key => key!== 'year');

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

// 主函数
async function main() {
    const processedData = await loadAndProcessData();
    const cipColumns = ['CIP1', 'CIP2', 'CIP3', 'CIP4', 'CIP5', 'CIP6', 'CIP7', 'CIP8', 'CIP9'];

    // 创建 CIP 按钮
    const buttonContainer = d3.select('body').insert('div', '.chart-area').attr('class', 'cip-button-container');
    buttonContainer.style('text-align','center'); // 使按钮居中显示
    cipColumns.forEach(cip => {
        buttonContainer.append('button')
           .text(cip)
           .on('click', () => {
                d3.select('#chart').html(''); // 清空之前的图表
                drawStackedBarChart(processedData[cip], '#chart');
            });
    });
}

// 调用主函数
main();
}
