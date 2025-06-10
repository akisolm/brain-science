// fig4.js

// Import D3 (if not already globally available or if using modules)
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Global variables for data and state
let rawData; // To store the loaded structured data
let currentGroups = []; // Stores selected SA codes as groups, e.g., [['SA1', 'SA2'], ['SA3']]
let selectedPendingTopics = new Set(); // For topics clicked but not yet grouped
let activePreset = null; // Tracks the currently active preset (e.g., 'broad', 'neighbor', 'distant')

// Constants
const ALL_CODES = ['SA1', 'SA2', 'SA3', 'SA4', 'SA5', 'SA6'];

const TOPICS = [
    { code: 'SA1', name: 'Psychiatry & Psychology' },
    { code: 'SA2', name: 'Anatomy & Organisms' },
    { code: 'SA3', name: 'Phenomena & Processes' },
    { code: 'SA4', name: 'Health' },
    { code: 'SA5', name: 'Techniques & Equipment' },
    { code: 'SA6', name: 'Distant Fusion' }
];

const CATEGORY_COLORS = [
    "#8da0cb", // Changed from #8da0cb (Purple) to #ffd92f (Yellow)
    "#e78ac3", // Pink (unchanged)
    "#ffd92f", // Changed from #ffd92f (Yellow) to #8da0cb (Purple)
    "#a6d854", // Light Green
    "#e5c494", // Brown
    "#b3b3b3"  // Gray
];

const PRESET_DEFINITIONS = {
    broad: {
        label: 'Broad Fusion',
        groups: ALL_CODES.map(d => [d]).sort(), // Each SA code as its own group, sorted
        text: 'Broad Fusion keeps all six domains separate, serving as a baseline of pure specialization.'
    },
    neighbor: {
        label: 'Neighboring Fusion',
        groups: [['SA1', 'SA2', 'SA3', 'SA4'].sort()], // Grouped and sorted
        text: 'Neighboring Fusion merges the four life‐science domains—<strong>Psychiatry & Psychology, Anatomy & Organisms, Phenomena & Processes, and Health</strong>—to emulate structure–function integration at the heart of modern neuroscience.'
    },
    distant: {
        label: 'Distant Fusion',
        groups: [['SA1', 'SA2', 'SA3', 'SA4'].sort(), ['SA5', 'SA6'].sort()].sort((a,b) => a[0].localeCompare(b[0])),
        text: 'Distant Fusion further combines those four life‐science domains with the two technology‐oriented domains—<strong>Techniques & Equipment and Technology & Information Science</strong>—to illustrate deep cross‐disciplinary convergence under mega‐project funding.'
    }
};

const LINE_COLORS = {
    'NorthAmerica': '#1f77b4',
    'Europe': '#ff7f0e',
    'Australasia': '#2ca02c'
};


// D3 chart setup (global for easier access within render function)
let svg, x, y, line;
let tooltip;
const margin = { top: 20, right: 120, bottom: 30, left: 60 };
const width = 650 - margin.left - margin.right; // Matches CSS .fig4-chart-container width
const height = 450 - margin.top - margin.bottom; // Matches CSS .fig4-chart-container height


/**
 * Main function to draw Figure 4. Called by main.js.
 */
export function drawFig4() {
    // 1. 数据加载
    d3.json('data/fig4_structured.json').then(data => {
        rawData = data;
        console.log('Fig 4: Data loaded:', rawData);

        // 初始化图表和控制面板
        initializeChart();
        initializeControlPanel();

        // Set initial state to 'Broad Fusion'
        activePreset = 'broad';
        currentGroups = PRESET_DEFINITIONS.broad.groups;
        
        updateAllUI(); // Initial UI update and chart render
    }).catch(error => {
        console.error('Error loading fig4.json:', error);
        // Display an error message in the chart container
        d3.select('#fig4-chart-svg')
            .append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .text('Failed to load data.');
    });
}

/**
 * Initializes the D3 chart SVG and scales.
 */
function initializeChart() {
    // Select the SVG element within the dedicated container
    const chartSvgElement = d3.select('#fig4-chart-svg');

    // Clear any existing SVG content if redrawing
    chartSvgElement.selectAll('*').remove();

    svg = chartSvgElement
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialize scales
    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    // Initialize line generator
    line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .defined(d => !isNaN(d.value) && d.value !== null);

    // Initialize tooltip - ensuring it uses the correct class from CSS
    tooltip = d3.select("body").append("div")
        .attr("class", "fig4-tooltip") // Use the class defined in CSS
        .style("opacity", 0)
        .style("position", "absolute")
        .style("pointer-events", "none"); // Ensure it doesn't block mouse events
}

/**
 * Initializes the control panel with buttons and binds event listeners.
 */
function initializeControlPanel() {
    // 安全的统计计算
    const numPublications = rawData.length;
    
    // 安全地处理可能不存在的字段
    const allAuthors = new Set();
    const allJournals = new Set();
    
    console.log("Debugging Authors and Journals data...");
    rawData.slice(0, 50).forEach((d, i) => { // Log for first 50 records to avoid excessive output
        console.log(`Record ${i}: Authors type: ${typeof d.Authors}, Journal type: ${typeof d.Journal}`);
        console.log(`Record ${i}: Authors value:`, d.Authors);
        console.log(`Record ${i}: Journal value:`, d.Journal);

        // 检查Authors字段是否存在且为数组
        if (d.Authors && Array.isArray(d.Authors)) {
            d.Authors.forEach(author => allAuthors.add(author));
        } else if (d.Authors && typeof d.Authors === 'string') {
            // 如果是字符串，尝试分割
            d.Authors.split(',').forEach(author => allAuthors.add(author.trim()));
        }
        
        // 检查Journal字段
        if (d.Journal && typeof d.Journal === 'string') {
            allJournals.add(d.Journal);
        }
    });
    
    const numAuthors = allAuthors.size || 'N/A';
    const numJournals = allJournals.size || 'N/A';
    
    console.log("Calculated numAuthors:", numAuthors);
    console.log("Calculated numJournals:", numJournals);

    // 更新统计显示
    // d3.select('#fig4-stats-pubs').html(`<h2>${numPublications}</h2><p>Publications</p>`);
    // d3.select('#fig4-stats-auth').html(`<h2>${numAuthors}</h2><p>Authors</p>`);
    // d3.select('#fig4-stats-journ').html(`<h2>${numJournals}</h2><p>Journals</p>`);


    // 3. 控制面板初始化
    // 向 #fig4-topic-grid 动态添加六个 <button>
    const topicGrid = d3.select('#fig4-topic-grid');
    topicGrid.selectAll('*').remove(); // Clear previous buttons if any

    TOPICS.forEach(topic => {
        topicGrid.append('button')
            .attr('id', `fig4-topic-${topic.code}`)
            .attr('class', 'fig4-topic-btn')
            .attr('data-sa', topic.code)
            .text(topic.name)
            .on('click', function () {
                // 点击 topic 按钮：toggle class pending
                const saCode = d3.select(this).attr('data-sa');
                
                // Check if the SA code is part of any active group
                let isAlreadyGrouped = false;
                currentGroups.forEach(group => {
                    if (group.includes(saCode)) {
                        isAlreadyGrouped = true;
                    }
                });

                // If already grouped, do not allow selection for new grouping or remove it from existing group
                if (isAlreadyGrouped && !selectedPendingTopics.has(saCode)) {
                    // If it's part of a *formed* group and not just pending, don't let it be selected.
                    // This prevents ungrouping directly from the topic button.
                    return; 
                }

                if (selectedPendingTopics.has(saCode)) {
                    selectedPendingTopics.delete(saCode);
                } else {
                    selectedPendingTopics.add(saCode);
                }
                activePreset = null; // Deactivate any active preset when manually selecting topics
                updateAllUI(); // Update UI after topic selection
            });
    });

    // 为 #fig4-create-btn、#fig4-clear-btn 添加事件监听
    d3.select('#fig4-create-btn').on('click', function () {
        // CREATE 组合：把所有 .pending 的按钮对应 code 组成一个 sub-array，push 到 groups
        if (selectedPendingTopics.size > 0) {
            const newGroup = Array.from(selectedPendingTopics).sort();
            currentGroups.push(newGroup);
            selectedPendingTopics.clear(); // Clear pending selections after grouping
            activePreset = null; // Deactivate any active preset
            updateAllUI(); // Update UI after creating a group
        }
    });

    d3.select('#fig4-clear-btn').on('click', function () {
        // CLEAR：清空 groups，重置按钮状态
        currentGroups = [];
        selectedPendingTopics.clear();
        activePreset = null;
        updateAllUI(); // Update UI after clearing
    });

    // 为三大 preset 按钮添加 id=fig4-preset-broad… 并绑定事件
    const presetGrid = d3.select('#fig4-preset-grid');
    presetGrid.selectAll('*').remove(); // Clear previous buttons if any

    Object.keys(PRESET_DEFINITIONS).forEach(presetId => {
        const preset = PRESET_DEFINITIONS[presetId];
        presetGrid.append('button')
            .attr('id', `fig4-preset-${presetId}`)
            .attr('class', 'fig4-preset-btn')
            .attr('data-preset', presetId)
            .text(preset.label)
            .on('click', function () {
                // 点击同一个 preset：toggle on/off；同时更新按钮高亮和 #fig4-story-block
                if (activePreset === presetId) {
                    activePreset = null;
                    currentGroups = []; // Reset to broad fusion implicitly
                } else {
                    activePreset = presetId;
                    currentGroups = PRESET_DEFINITIONS[presetId].groups;
                }
                selectedPendingTopics.clear(); // Clear any pending selections
                updateAllUI(); // Update UI after preset selection
            });
    });

    // 预设按钮 beneath 动态说明段落（StoryBlock）保持空白
    updateStoryBlock(); // Call with no arguments to show only abstract
}

/**
 * Updates all UI elements including button states, story block, and rerenders the chart.\
 * It also triggers the chart rendering.
 */
function updateAllUI() {
    updateButtonStates();
    renderChart();
    // Update story block based on active preset, if any
    updateStoryBlock(activePreset ? PRESET_DEFINITIONS[activePreset].text : '');
}

/**
 * Updates the visual state of topic, create, clear, and preset buttons.
 */
function updateButtonStates() {
    // Reset all topic buttons first
    d3.selectAll('.fig4-topic-btn')
        .classed('pending', false)
        .classed('active', false) // Also remove general active class
        .each(function () {
            // Remove all groupN classes
            this.className = this.className.split(' ').filter(c => !c.startsWith('group')).join(' ');
        })
        .style('background-color', '') // Reset inline styles
        .style('color', '')
        .style('border-color', '');

    // Apply 'pending' class for currently selected pending topics
    selectedPendingTopics.forEach(saCode => {
        d3.select(`#fig4-topic-${saCode}`).classed('pending', true);
    });

    // Apply 'groupX' classes and colors for grouped topics
    currentGroups.forEach((group, i) => {
        const groupClass = `group${i % CATEGORY_COLORS.length}`;
        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
        group.forEach(saCode => {
            d3.select(`#fig4-topic-${saCode}`)
                .classed(groupClass, true)
                .classed('active', true) // Set active for grouped items
                .style('background-color', color)
                .style('color', 'white')
                .style('border-color', color);
        });
    });

    // Update preset button active states
    d3.selectAll('.fig4-preset-btn')
        .classed('active', false);
    if (activePreset) {
        d3.select(`#fig4-preset-${activePreset}`).classed('active', true);
    }
}


/**
 * Generates the PartGroups token for filtering data.
 * @param {Array<Array<string>>} groups The current groups (e.g., [['SA1', 'SA2'], ['SA3']])
 * @returns {Array<string>} A sorted array of group strings and single SA codes, representing the token.
 */
function generatePartGroupsToken(groups) {
    // 处理分组：将每个组内的SA代码排序，然后整体排序
    const processedGroups = groups.map(group => group.slice().sort());
    
    // 处理未分组的单独SA代码
    const groupedSaCodes = new Set(groups.flat());
    const singles = ALL_CODES.filter(code => !groupedSaCodes.has(code))
                             .map(code => [code]); // 转换为数组格式保持一致
    
    // 合并并排序所有组
    const allGroups = [...processedGroups, ...singles];
    allGroups.sort((a, b) => {
        // 先按组大小排序，再按首个元素排序
        if (a.length !== b.length) return a.length - b.length;
        return a[0].localeCompare(b[0]);
    });
    
    console.log("Generated token groups:", allGroups);
    return allGroups;
}

/**
 * Renders the line chart based on the current data and group selection.
 */
function renderChart() {
    svg.selectAll('*').remove();

    // 生成当前的分组token
    let currentTokenGroups;
    if (activePreset) {
        currentTokenGroups = generatePartGroupsToken(PRESET_DEFINITIONS[activePreset].groups);
    } else {
        currentTokenGroups = generatePartGroupsToken(currentGroups);
    }
    
    console.log("Current token groups:", currentTokenGroups);
    
    // 修复后的数据过滤逻辑
    const filteredData = rawData.filter(row => {
        // 标准化数据中的PartGroups
        const rowPartGroups = row.PartGroups.map(group => {
            // 确保每个组是数组并且已排序
            if (Array.isArray(group)) {
                return group.slice().sort();
            } else {
                console.warn("Unexpected PartGroup format:", group);
                return [String(group)].sort();
            }
        });
        
        // 对所有组进行排序以确保一致的比较
        rowPartGroups.sort((a, b) => {
            if (a.length !== b.length) return a.length - b.length;
            return a[0].localeCompare(b[0]);
        });
        
        // 使用深度比较
        const matches = JSON.stringify(rowPartGroups) === JSON.stringify(currentTokenGroups);
        
        if (matches) {
            console.log("Match found:", {
                rowPartGroups,
                currentTokenGroups,
                year: row.Year,
                region: row.Region
            });
        }
        
        return matches;
    });

    console.log(`Filtered ${filteredData.length} records from ${rawData.length} total`);

    // 检查是否有数据
    if (filteredData.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("No data available for this grouping combination.");
        return;
    }

    // 处理数据
    const processedData = [];
    const regions = [...new Set(filteredData.map(d => d.Region))];
    
    console.log("Available regions:", regions);
    console.log("Sample of filtered data:", filteredData.slice(0, 2));
    
    regions.forEach(region => {
        const regionData = filteredData.filter(d => d.Region === region);
        console.log(`Processing region ${region}:`, {
            dataPoints: regionData.length,
            sample: regionData.slice(0, 2),
            diversityValues: regionData.map(d => d.Diversity)
        });
        
        const values = regionData.map(d => {
            const year = new Date(d.Year, 0);
            const value = parseFloat(d.Diversity);
            console.log(`Processing data point:`, {
                year: d.Year,
                parsedYear: year,
                diversity: d.Diversity,
                parsedValue: value
            });
            return {
                year: year,
                value: value
            };
        }).filter(d => !isNaN(d.value)).sort((a, b) => a.year - b.year);
        
        console.log(`Processed values for ${region}:`, {
            count: values.length,
            sample: values.slice(0, 2),
            hasValidValues: values.some(v => !isNaN(v.value)),
            yearRange: values.length > 0 ? [values[0].year, values[values.length - 1].year] : null,
            valueRange: values.length > 0 ? [d3.min(values, d => d.value), d3.max(values, d => d.value)] : null
        });
        
        if (values.length > 0) {
            processedData.push({
                name: region,
                values: values
            });
        }
    });

    console.log("Final processed data:", processedData);

    // 检查是否有有效数据
    if (processedData.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("No valid data points available for this grouping combination.");
        return;
    }

    // 设置坐标轴域
    const allYears = processedData.flatMap(s => s.values).map(d => d.year);
    const allValues = processedData.flatMap(s => s.values).map(d => d.value);

    console.log("Axis domains:", {
        years: allYears.length,
        values: allValues.length,
        yearRange: [d3.min(allYears), d3.max(allYears)],
        valueRange: [d3.min(allValues), d3.max(allValues)]
    });

    if (allYears.length === 0 || allValues.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("No valid data points for axis domains.");
        return;
    }

    x.domain(d3.extent(allYears));
    // Adjust Y-axis domain to focus on the data. Add a small buffer.
    const yMin = d3.min(allValues);
    const yMax = d3.max(allValues);
    const yBuffer = (yMax - yMin) * 0.1; // 10% buffer
    y.domain([yMin - yBuffer < 0 ? 0 : yMin - yBuffer, yMax + yBuffer]);

    // 添加坐标轴
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%Y"))
            .ticks(d3.timeYear.every(3)));

    // Add X-axis title
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom + 15})`)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d3.format(".2f")));

    // Add Y-axis title
    svg.append("text")
        .attr("class", "y-axis-title")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15) // Position to the left of the y-axis
        .attr("x", -height / 2)
        .text("Diversity");

    // 添加线条的组（为每个区域创建一个组）
    const regionGroups = svg.selectAll(".region-group")
        .data(processedData)
        .enter()
        .append("g")
        .attr("class", d => `region-group region-${d.name.replace(/\s/g, '')}`)
        .attr("data-region", d => d.name);

    // 定义线条生成器
    const lineGenerator = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // 在每个区域组中添加折线
    regionGroups.append("path")
        .attr("class", "fig4-line")
        .attr("d", d => lineGenerator(d.values))
        .style("stroke", d => LINE_COLORS[d.name])
        .style("fill", "none")
        .style("stroke-width", 2.5)
        .style("opacity", 0.8)
        .on("mouseover", function(event, d_region) {
            d3.select(this).style('stroke-width', 3.5); // 鼠标悬停在线条上时加粗
            showTooltip(event, d_region); // 调用统一的 showTooltip，dataPoint 为空
        })
        .on("mousemove", function(event, d_region) {
            moveTooltip(event, d_region); // 调用统一的 moveTooltip，dataPoint 为空
        })
        .on("mouseout", function() {
            d3.select(this).style('stroke-width', 2.5); // 鼠标移出线条时恢复粗细
            hideTooltip();
        });

    // 在每个区域组中添加数据点
    regionGroups.selectAll(".fig4-data-point")
        .data(d => d.values)
        .enter()
        .append("circle")
        .attr("class", "fig4-data-point")
        .attr("cx", d_point => x(d_point.year))
        .attr("cy", d_point => y(d_point.value))
        .attr("r", 4)
        .style("fill", function() {
            // 从父级g元素中获取区域名称
            return LINE_COLORS[d3.select(this.parentNode).datum().name];
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1.5)
        .on("mouseover", function(event, d_point) {
            d3.select(this).attr("r", 6); // 鼠标悬停在点上时放大
            const d_region = d3.select(this.parentNode).datum(); // 获取父级g元素绑定的区域数据
            showTooltip(event, d_region, d_point); // Pass both region and data point
        })
        .on("mousemove", function(event, d_point) {
            const d_region = d3.select(this.parentNode).datum(); // 获取父级g元素绑定的区域数据
            moveTooltip(event, d_region, d_point); // Pass both region and data point
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 4); // 鼠标移出点时恢复大小
            hideTooltip();
        });

    // 添加图例
    const legend = svg.append("g")
        .attr("class", "fig4-legend-box")
        .attr("transform", `translate(20, 0)`);

    // 添加图例背景
    const legendBackground = legend.append("rect")
        .attr("x", -5)
        .attr("y", -5)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "white")
        .style("opacity", 0.9)
        .style("stroke", "#ccc")
        .style("stroke-width", 0.5);

    // 创建图例项
    const legendItems = legend.selectAll(".legend-item")
        .data(processedData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        .style("cursor", "pointer");

    // 添加颜色框
    legendItems.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => LINE_COLORS[d.name])
        .style("stroke", "none");

    // 添加标签
    legendItems.append("text")
        .attr("x", 25) // Adjusted x for text, allowing space for rect
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .style("text-anchor", "start") // Ensured text is left-aligned with rect
        .text(d => d.name)
        .style("alignment-baseline", "middle")
        .style("font-size", "12px")
        .style("fill", "#333");

    // 调整图例背景大小
    const legendBBox = legend.node().getBBox();
    legendBackground
        .attr("width", legendBBox.width + 10)
        .attr("height", legendBBox.height + 10);

    // Add click event for legend items to toggle line and data point visibility
    legendItems.on("click", function(event, d) {
        const regionName = d; // 'd' is the region name directly
        const regionGroupName = regionName.replace(/\s/g, ''); // Get cleaned region name for class
        const targetGroup = svg.select(`.region-group.region-${regionGroupName}`);
        
        // Check the current opacity to determine if it's hidden (opacity 0)
        const isCurrentlyHidden = targetGroup.style("opacity") === "0";

        if (isCurrentlyHidden) {
            // If currently hidden, show it
            targetGroup.style("display", null); // Make sure it's visible for transition
            targetGroup.transition()
                .duration(200)
                .style("opacity", 0.8); // Fade in to its default opacity
            d3.select(this).classed("active", false); // Remove 'active' class from legend item
        } else {
            // If currently visible, hide it
            targetGroup.transition()
                .duration(200)
                .style("opacity", 0) // Fade out
                .on("end", function() {
                    d3.select(this).style("display", "none"); // Once faded, set display to 'none'
                });
            d3.select(this).classed("active", true); // Add 'active' class to legend item (to make it faded)
        }
    });
}

/**
 * Updates the #fig4-story-block with the abstract and optional preset text.
 * @param {string} presetText Optional text to append from active preset.
 */
function updateStoryBlock(presetText = '') {
    const storyBlock = d3.select('#fig4-story-block');
    const abstract = `The Diversity chartvisualizes how the topical diversity of brain‐science research has evolved from 1980 through 2020 across six MeSH‐based domains—<strong>Psychiatry & Psychology, Anatomy & Organisms, Phenomena & Processes, Health, Techniques & Equipment, and Technology & Information Science</strong>—in three regions (North America, Europe, and Australasia). Using a Blau‐evenness index, the chart shows how major funding programs such as the U.S. BRAIN Initiative and the Human Brain Project have shifted the balance between focused expertise and cross‐domain integration.</p><p>To experiment with your own topic mixes, select any combination of the six domain buttons and click <strong>Create Combination</strong>. The chart will immediately update to show how your bespoke fusion scheme affects regional diversity trajectories. Press <strong>Clear</strong> to reset all selections and start a new exploration.`;
    
    // Always write the abstract first
    storyBlock.html(`<p>${abstract}</p>${presetText ? `<p>${presetText}</p>` : ''}`);
}

// Helper functions for tooltip management
function showTooltip(event, regionData, dataPoint) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9)
        .style("display", "block"); // Ensure it's displayed

    updateTooltipContent(event, regionData, dataPoint);
}

function moveTooltip(event, regionData, dataPoint) {
    updateTooltipContent(event, regionData, dataPoint);
}

function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .style("display", "none"); // Hide it completely
}

function updateTooltipContent(event, regionData, dataPoint) {
    // Use dataPoint if available, otherwise find closest on line
    const displayData = dataPoint || (() => {
        const [mx, my] = d3.pointer(event);
        const year = x.invert(mx);
        const bisect = d3.bisector(d => d.year).left;
        const idx = bisect(regionData.values, year, 1);
        const d0 = regionData.values[idx - 1];
        const d1 = regionData.values[idx];
        return (d1 && year - d0.year > d1.year - year) ? d1 : d0;
    })();

    if (displayData && displayData.year && !isNaN(displayData.value)) {
        const topicCombo = currentGroups.map(g => g.join(' + ')).join(', ');
        tooltip.html(`
            <div class="fig4-tooltip-title">${regionData.name}</div>
            <div class="fig4-tooltip-content">
                <div class="fig4-tooltip-row">
                    <span class="fig4-tooltip-label">Year:</span>
                    <span class="fig4-tooltip-value">${d3.timeFormat("%Y")(displayData.year)}</span>
                </div>
                <div class="fig4-tooltip-row">
                    <span class="fig4-tooltip-label">Diversity:</span>
                    <span class="fig4-tooltip-value">${displayData.value.toFixed(3)}</span>
                </div>
                <div class="fig4-tooltip-row">
                    <span class="fig4-tooltip-label">Topics:</span>
                    <span class="fig4-tooltip-value">${topicCombo}</span>
                </div>
            </div>
        `); // 确保模板字符串正确结束
        
        tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    } else {
        hideTooltip(); // Hide if data is invalid
    }
}